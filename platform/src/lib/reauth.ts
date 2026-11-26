import { createHash, randomBytes, randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { currentSession, type AuthUser } from "@/lib/auth";
import { mailConfigured, sendMail } from "@/lib/mailer";
import { getAuthOptions } from "@/lib/next-auth";
import { hashCode, normalizePhone, otpChannels, verifyOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { gatewayToken, sendGatewayCode } from "@/lib/telegram-gateway";
import { notifyTelegramUser } from "@/lib/telegram";
import { checkTwoFactorCode } from "@/lib/two-factor";
import { couldHaveOtherSignIn, hasOtherSignIn, reauthMethods, reauthTarget, REAUTH_VALID_MS, type ReauthAction, type ReauthMethod } from "@/lib/reauth-rules";

export { REAUTH_ACTIONS, type ReauthAction, type ReauthMethod } from "@/lib/reauth-rules";

const CODE_MS = 5 * 60 * 1000;
const isStaff = (role: string) => role === "STAFF" || role === "ADMIN" || role === "FOUNDER";
const realEmail = (email: string) => !email.endsWith(".invalid");

async function subjectOf(user: AuthUser) {
  const [account, session, channels, mail] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { email: true, phone: true, phoneVerifiedAt: true, telegramChatId: true, twoFactorEnabledAt: true, passwordHash: true } }),
    currentSession(user.id),
    otpChannels(),
    mailConfigured()
  ]);
  if (!account || !session) return null;
  return {
    account, session,
    subject: {
      staff: isStaff(user.role),
      twoFactor: Boolean(account.twoFactorEnabledAt),
      telegramLinked: Boolean(account.telegramChatId),
      phoneVerified: Boolean(account.phoneVerifiedAt && account.phone && normalizePhone(account.phone)),
      gateway: channels.gateway,
      realEmail: realEmail(account.email),
      mailConfigured: mail,
      sessionAgeMs: Date.now() - session.createdAt.getTime()
    }
  };
}

/** What the confirmation window offers this person for this action. */
export async function reauthOptions(user: AuthUser) {
  const found = await subjectOf(user);
  if (!found) return null;
  return reauthMethods(found.subject);
}

const codeTarget = (target: string) => `${target}:code`;

/** Sends a confirmation code to Telegram, the proved number (Gateway) or the mailbox. */
export async function sendReauthCode(user: AuthUser, action: ReauthAction, method: "telegram" | "phone" | "email"): Promise<boolean> {
  const found = await subjectOf(user);
  if (!found || !reauthMethods(found.subject).methods.includes(method)) return false;
  const target = codeTarget(reauthTarget(user.id, found.session.hash, action));
  const code = String(randomInt(100000, 1000000));
  await prisma.otpCode.updateMany({ where: { purpose: "REAUTH", target, consumedAt: null }, data: { consumedAt: new Date() } });
  const record = await prisma.otpCode.create({ data: { purpose: "REAUTH", target, codeHash: hashCode(code, target), expiresAt: new Date(Date.now() + CODE_MS) }, select: { id: true } });
  let sent = false;
  try {
    if (method === "telegram") sent = await notifyTelegramUser(user.id, `🔐 <b>Tecsecure</b>\nAmalni tasdiqlash kodi: <code>${code}</code>\nKod 5 daqiqa amal qiladi. Buni siz so‘ramagan bo‘lsangiz, hech kimga bermang.`);
    if (method === "phone" && found.account.phone) {
      const token = await gatewayToken();
      const phone = normalizePhone(found.account.phone);
      sent = Boolean(token && phone && await sendGatewayCode(token, phone, code, "LOGIN"));
    }
    if (method === "email") {
      await sendMail(found.account.email, "Tecsecure: amalni tasdiqlash kodi", `Tecsecure hisobingizdagi amalni tasdiqlash kodi: ${code}\nKod 5 daqiqa amal qiladi. Buni siz so‘ramagan bo‘lsangiz, xabarga e’tibor bermang.`, code);
      sent = true;
    }
  } catch (error) {
    console.error("Sending a confirmation code failed", error instanceof Error ? error.message : "UnknownError");
    sent = false;
  }
  if (!sent) await prisma.otpCode.delete({ where: { id: record.id } }).catch(() => undefined);
  return sent;
}

export type ReauthProof = { method: ReauthMethod; password?: string; code?: string };

/**
 * Checks the proof and, if it holds, records a one-time approval for this session and action, valid for
 * ten minutes. The protected request then spends it with `spendReauth`.
 */
export async function confirmReauth(user: AuthUser, action: ReauthAction, proof: ReauthProof): Promise<boolean> {
  const found = await subjectOf(user);
  if (!found) return false;
  const { methods, withTotp } = reauthMethods(found.subject);
  if (!methods.includes(proof.method)) return false;
  const target = reauthTarget(user.id, found.session.hash, action);
  let ok = false;
  if (proof.method === "password") ok = Boolean(proof.password) && await bcrypt.compare(proof.password as string, found.account.passwordHash);
  if (proof.method === "totp") ok = Boolean(proof.code) && await checkTwoFactorCode(user.id, proof.code as string);
  if (proof.method === "recent") ok = true;
  if (proof.method === "telegram" || proof.method === "phone" || proof.method === "email") ok = Boolean(proof.code) && await verifyOtp("REAUTH", codeTarget(target), proof.code as string);
  // Staff with two-factor give the authenticator code on top of the password.
  if (ok && withTotp) ok = Boolean(proof.code) && await checkTwoFactorCode(user.id, proof.code as string);
  if (!ok) return false;
  await prisma.$transaction([
    prisma.otpCode.updateMany({ where: { purpose: "REAUTH_OK", target, consumedAt: null }, data: { consumedAt: new Date() } }),
    // providerRef keeps which method was used: unlinking Telegram needs to know whether the password worked.
    prisma.otpCode.create({ data: { purpose: "REAUTH_OK", target, providerRef: proof.method, codeHash: createHash("sha256").update(randomBytes(16)).digest("hex"), expiresAt: new Date(Date.now() + REAUTH_VALID_MS) } })
  ]);
  return true;
}

type Db = Prisma.TransactionClient | typeof prisma;

/** Spends the approval for this session and action once. Returns how it was given, or null. */
export async function spendReauth(user: AuthUser, action: ReauthAction, db: Db = prisma): Promise<ReauthMethod | null> {
  const session = await currentSession(user.id);
  if (!session) return null;
  const target = reauthTarget(user.id, session.hash, action);
  const approval = await db.otpCode.findFirst({ where: { purpose: "REAUTH_OK", target, consumedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" }, select: { id: true, providerRef: true } });
  if (!approval) return null;
  const spent = await db.otpCode.updateMany({ where: { id: approval.id, consumedAt: null }, data: { consumedAt: new Date() } });
  return spent.count === 1 ? (approval.providerRef as ReauthMethod | null) ?? "password" : null;
}

export const reauthRequired = (action: ReauthAction) =>
  Response.json({ error: "Davom etish uchun bu siz ekaningizni tasdiqlang.", code: "REAUTH_REQUIRED", action }, { status: 403 });

/**
 * The gate in front of a sensitive change. An approval from the confirmation window is spent; for an
 * account without two-factor the old form field (current password) is still accepted.
 */
export async function requireReauth(user: AuthUser, action: ReauthAction, legacyPassword?: string): Promise<{ method: ReauthMethod } | Response> {
  if (legacyPassword) {
    const account = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true, twoFactorEnabledAt: true } });
    if (account && !account.twoFactorEnabledAt && await bcrypt.compare(legacyPassword, account.passwordHash)) return { method: "password" };
  }
  const method = await spendReauth(user, action);
  return method ? { method } : reauthRequired(action);
}

/** For unlinking Telegram: what else the account could sign in with. */
export async function otherSignInWays(userId: string) {
  const [account, channels, mail, options] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { email: true, phone: true, phoneVerifiedAt: true, oauthAccounts: { select: { provider: true } } } }),
    otpChannels(),
    mailConfigured(),
    getAuthOptions()
  ]);
  const configured = new Set(options.providers.map(provider => provider.id));
  const ways = {
    realEmail: Boolean(account && realEmail(account.email)),
    oauth: Boolean(account?.oauthAccounts.some(link => configured.has(link.provider))),
    phoneVerified: Boolean(account?.phoneVerifiedAt && account.phone && normalizePhone(account.phone)),
    phoneCodes: channels.sms,
    mailConfigured: mail
  };
  return { possible: couldHaveOtherSignIn(ways), withMethod: (method: ReauthMethod) => hasOtherSignIn({ ...ways, confirmedWithPassword: method === "password" }) };
}

/** Tells the owner through the channels that existed before the change; a failed message never undoes it. */
export async function notifySecurityChange(userId: string, text: string, oldEmail?: string | null): Promise<void> {
  await notifyTelegramUser(userId, `🔐 <b>Tecsecure</b>\n${text}\nBuni siz qilmagan bo‘lsangiz, darhol parolni o‘zgartiring va biz bilan bog‘laning.`).catch(() => false);
  if (oldEmail && realEmail(oldEmail) && await mailConfigured().catch(() => false)) {
    await sendMail(oldEmail, "Tecsecure: hisobingizda o‘zgarish", `${text}\nBuni siz qilmagan bo‘lsangiz, darhol parolni o‘zgartiring va biz bilan bog‘laning.`).catch(() => undefined);
  }
}
