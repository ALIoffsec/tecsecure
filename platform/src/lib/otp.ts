import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getSmsCredentials, getTelegramCredentials, type SmsCredentials } from "@/lib/integration-credentials";
import { notifyTelegramUser } from "@/lib/telegram";
import { mailConfigured, sendMail } from "@/lib/mailer";
import { deliverPhoneCode, gatewayToken, reportGatewayVerified, sendGatewayCode } from "@/lib/telegram-gateway";
import { otpSmsText, type OtpPurpose } from "@/lib/otp-text";

export { otpSmsText, type OtpPurpose };

const TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_AFTER_MS = 60 * 1000;
const ESKIZ = "https://notify.eskiz.uz/api";

/** One spelling for a Uzbek mobile number, however it was typed: +998901234567. Null if it is not one. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (/^998\d{9}$/.test(digits)) return `+${digits}`;
  if (/^\d{9}$/.test(digits)) return `+998${digits}`;
  return null;
}

export function normalizeIdentifier(input: string): { kind: "phone" | "email"; value: string } | null {
  const clean = input.trim();
  if (clean.includes("@")) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) ? { kind: "email", value: clean.toLowerCase() } : null;
  const phone = normalizePhone(clean);
  return phone ? { kind: "phone", value: phone } : null;
}

export function hashCode(code: string, target: string): string {
  const pepper = process.env.INTEGRATION_CREDENTIALS_KEY || process.env.NEXTAUTH_SECRET || "development-only";
  return createHash("sha256").update(`${pepper}:${target}:${code}`).digest("hex");
}

async function smsCredentials(): Promise<SmsCredentials | null> {
  try {
    const credentials = await getSmsCredentials();
    return credentials.eskizEmail && credentials.eskizPassword ? credentials : null;
  } catch (error) {
    console.error("SMS settings could not be read", error instanceof Error ? error.message : "UnknownError");
    return null;
  }
}

export async function otpChannels() {
  const consoleMode = process.env.NODE_ENV !== "production" && process.env.OTP_DEV_CONSOLE === "1";
  const gateway = Boolean(await gatewayToken());
  const sms = Boolean(await smsCredentials());
  return {
    consoleMode,
    gateway,
    // "sms" means a phone can get a code directly, by Telegram Gateway or by SMS.
    sms: gateway || sms || consoleMode,
    smsOnly: sms,
    email: (await mailConfigured()) || consoleMode
  };
}

export async function telegramAvailable(): Promise<boolean> {
  try {
    return Boolean((await getTelegramCredentials()).botToken);
  } catch {
    return false;
  }
}

/** Phone numbers were stored as typed, so candidates are found by their last digits and then compared whole. */
export async function findCustomerByPhone(phone: string) {
  const candidates = await prisma.user.findMany({
    where: { phone: { contains: phone.slice(-4) }, role: "CUSTOMER", active: true, deletedAt: null },
    select: { id: true, phone: true, telegramChatId: true, email: true, name: true },
    take: 50
  });
  const exact = candidates.filter(user => user.phone && normalizePhone(user.phone) === phone);
  return exact.length === 1 ? exact[0] : null;
}

export async function findCustomer(identifier: { kind: "phone" | "email"; value: string }) {
  if (identifier.kind === "phone") return findCustomerByPhone(identifier.value);
  const user = await prisma.user.findUnique({ where: { email: identifier.value }, select: { id: true, phone: true, telegramChatId: true, email: true, name: true, role: true, active: true, deletedAt: true } });
  return user && user.role === "CUSTOMER" && user.active && !user.deletedAt ? user : null;
}

/** What Eskiz said, kept so the admin test and the server log show the real reason (moderation, balance, login). */
export class SmsSendError extends Error {
  constructor(readonly status: number, readonly detail: string) {
    super(`Eskiz ${status}: ${detail}`);
    this.name = "SmsSendError";
  }
}

async function eskizMessage(response: Response): Promise<string> {
  const text = await response.text().catch(() => "");
  try {
    const body = JSON.parse(text) as { message?: unknown; data?: unknown; errors?: unknown };
    const message = body.message ?? body.errors ?? body.data;
    return (typeof message === "string" ? message : JSON.stringify(message ?? body)).slice(0, 300);
  } catch {
    return text.slice(0, 300) || response.statusText;
  }
}

let eskizToken: { account: string; value: string; expiresAt: number } | null = null;

async function eskizLogin(credentials: SmsCredentials, fresh = false): Promise<string> {
  const account = createHash("sha256").update(`${credentials.eskizEmail}:${credentials.eskizPassword}`).digest("hex");
  if (!fresh && eskizToken && eskizToken.account === account && eskizToken.expiresAt > Date.now()) return eskizToken.value;
  const form = new FormData();
  form.set("email", credentials.eskizEmail);
  form.set("password", credentials.eskizPassword);
  const response = await fetch(`${ESKIZ}/auth/login`, { method: "POST", body: form, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new SmsSendError(response.status, `login: ${await eskizMessage(response)}`);
  const body = await response.json() as { data?: { token?: string } };
  if (!body.data?.token) throw new SmsSendError(response.status, "login: no token in the answer");
  // Eskiz tokens last 30 days; renew a little early.
  eskizToken = { account, value: body.data.token, expiresAt: Date.now() + 25 * 24 * 60 * 60 * 1000 };
  return eskizToken.value;
}

/** Sends one SMS. Returns Eskiz's own message id. */
export async function sendSms(phone: string, text: string): Promise<string> {
  const credentials = await smsCredentials();
  if (!credentials) throw new SmsSendError(0, "SMS is not configured");
  const send = async (token: string) => {
    const form = new FormData();
    form.set("mobile_phone", phone.replace(/\D/g, ""));
    form.set("message", text);
    form.set("from", credentials.eskizFrom || "4546");
    return fetch(`${ESKIZ}/message/sms/send`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form, signal: AbortSignal.timeout(15000) });
  };
  let response = await send(await eskizLogin(credentials));
  // A token can be revoked before it expires (password change, new login elsewhere): log in once more.
  if (response.status === 401) response = await send(await eskizLogin(credentials, true));
  if (!response.ok) throw new SmsSendError(response.status, await eskizMessage(response));
  const body = await response.json().catch(() => ({})) as { id?: unknown; status?: unknown };
  if (body.status === "error") throw new SmsSendError(response.status, JSON.stringify(body).slice(0, 300));
  return String(body.id ?? "");
}


/**
 * "telegram": our own bot (the account is linked). "gateway": Telegram Gateway to the number's Telegram.
 * "recent": a code went out less than a minute ago and is still valid. "none": nothing can reach this person.
 */
export type OtpDelivery = "telegram" | "gateway" | "sms" | "email" | "recent" | "none";

/** Creates a code and sends it the cheapest way that reaches this person. The code itself is never stored. */
export async function issueOtp(purpose: OtpPurpose, target: string, kind: "phone" | "email", user: { id: string; telegramChatId?: string | null } | null): Promise<OtpDelivery> {
  const channels = await otpChannels();
  const recent = await prisma.otpCode.findFirst({ where: { target, purpose, createdAt: { gt: new Date(Date.now() - RESEND_AFTER_MS) } }, select: { id: true } });
  if (recent) return "recent";
  const direct = kind === "phone" ? channels.sms : channels.email;
  if (!user?.telegramChatId && !direct) return "none";

  const code = String(randomInt(100000, 1000000));
  const record = await prisma.otpCode.create({ data: { purpose, target, codeHash: hashCode(code, target), expiresAt: new Date(Date.now() + TTL_MS) }, select: { id: true } });
  // A code that never left must not block the next try for a minute.
  const discard = () => prisma.otpCode.delete({ where: { id: record.id } }).catch(() => undefined);
  try {
    if (channels.consoleMode) console.info(`[OTP dev] ${target} ${purpose} ${code}`);
    if (user?.telegramChatId && await notifyTelegramUser(user.id, `🔐 <b>Tecsecure</b>\nTasdiqlash kodi: <code>${code}</code>\nKod 5 daqiqa amal qiladi. Uni hech kimga bermang.`)) return "telegram";
    if (channels.consoleMode) return kind === "phone" ? "sms" : "email";
    if (kind === "phone" && channels.sms) {
      // Gateway first, then Eskiz SMS; with neither, the site offers the bot link instead.
      const token = channels.gateway ? await gatewayToken() : "";
      const sent = await deliverPhoneCode(target, code, purpose, {
        gateway: token ? (phone, value, kindOfCode) => sendGatewayCode(token, phone, value, kindOfCode) : null,
        sms: channels.smsOnly ? async (phone) => { await sendSms(phone, otpSmsText(purpose, code)); } : null
      });
      if (sent.via === "gateway") {
        await prisma.otpCode.update({ where: { id: record.id }, data: { providerRef: sent.requestId, deliveryStatus: "sent" } });
        return "gateway";
      }
      if (sent.via === "sms") return "sms";
    }
    if (kind === "email" && channels.email) {
      await sendMail(target, purpose === "RESET" ? "Tecsecure: parolni tiklash kodi" : "Tecsecure: kirish kodi", `${otpSmsText(purpose, code)}\nKod 5 daqiqa amal qiladi.`, code);
      return "email";
    }
  } catch (error) {
    await discard();
    throw error;
  }
  await discard();
  return "none";
}

/** True once, for the right code, within its time and attempt limits. */
export async function verifyOtp(purpose: OtpPurpose | "RESET_TICKET", target: string, code: string): Promise<boolean> {
  const record = await prisma.otpCode.findFirst({ where: { target, purpose, consumedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } });
  if (!record || record.attempts >= MAX_ATTEMPTS) return false;
  await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
  const given = Buffer.from(hashCode(code.trim(), target));
  const expected = Buffer.from(record.codeHash);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;
  const consumed = await prisma.otpCode.updateMany({ where: { id: record.id, consumedAt: null }, data: { consumedAt: new Date() } });
  // Telegram counts conversions when told the code was right; sign-in does not wait for it.
  if (consumed.count === 1 && record.providerRef) reportGatewayVerified(record.providerRef, code.trim());
  return consumed.count === 1;
}
