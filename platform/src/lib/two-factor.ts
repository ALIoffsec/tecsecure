import { createHash, randomBytes } from "node:crypto";
import QRCode from "qrcode";
import { createSession } from "./auth";
import { decryptIntegrationCredential, encryptIntegrationCredential } from "./integration-credentials";
import { prisma } from "./prisma";
import { generateBackupCodes, generateTotpSecret, hashBackupCode, otpauthUri, verifyTotp } from "./totp";

const TICKET_MS = 5 * 60 * 1000;
const TICKET_ATTEMPTS = 5;

function masterSecret(): string {
  const secret = process.env.INTEGRATION_CREDENTIALS_KEY || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Integration credential encryption is not configured.");
  return secret;
}
const storageKey = (userId: string) => `two-factor:${userId}`;
const sealSecret = (userId: string, secret: string) => encryptIntegrationCredential(secret, storageKey(userId), masterSecret());
const openSecret = (userId: string, sealed: string) => decryptIntegrationCredential(sealed, storageKey(userId), masterSecret());
const ticketHash = (ticket: string) => createHash("sha256").update(`two-factor-ticket:${ticket}`).digest("hex");

/**
 * The one place a sign-in turns into a session. With two-factor on, it returns a short-lived ticket
 * instead and the session waits for the authenticator code.
 */
export async function beginSignIn(userId: string, adminAccess = false): Promise<{ ok: true } | { twoFactor: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { twoFactorEnabledAt: true } });
  if (!user?.twoFactorEnabledAt) {
    await createSession(userId, adminAccess);
    return { ok: true };
  }
  const ticket = randomBytes(24).toString("base64url");
  await prisma.otpCode.create({
    data: { purpose: "TWO_FACTOR", target: `${userId}:${adminAccess ? "admin" : "user"}`, codeHash: ticketHash(ticket), expiresAt: new Date(Date.now() + TICKET_MS) }
  });
  return { twoFactor: ticket };
}

export type TwoFactorResult = { ok: true; role: string } | { ok: false; reason: "expired" | "wrong" };

/** Second step of a sign-in: a current authenticator code, or one unused backup code. */
export async function completeSignIn(ticket: string, code: string): Promise<TwoFactorResult> {
  const record = await prisma.otpCode.findFirst({ where: { purpose: "TWO_FACTOR", codeHash: ticketHash(ticket), consumedAt: null, expiresAt: { gt: new Date() } } });
  if (!record || record.attempts >= TICKET_ATTEMPTS) return { ok: false, reason: "expired" };
  await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
  const [userId, scope] = record.target.split(":");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, active: true, twoFactorSecret: true, twoFactorEnabledAt: true, twoFactorBackupCodes: true, twoFactorLastStep: true } });
  if (!user?.active || !user.twoFactorEnabledAt || !user.twoFactorSecret) return { ok: false, reason: "expired" };
  if (!(await acceptCode(user, code))) return { ok: false, reason: "wrong" };
  const consumed = await prisma.otpCode.updateMany({ where: { id: record.id, consumedAt: null }, data: { consumedAt: new Date() } });
  if (consumed.count !== 1) return { ok: false, reason: "expired" };
  await createSession(user.id, scope === "admin");
  return { ok: true, role: user.role };
}

type SecretHolder = { id: string; twoFactorSecret: string | null; twoFactorBackupCodes: unknown; twoFactorLastStep: number | null };

/** Checks an authenticator or backup code and records its use; true at most once per code. */
async function acceptCode(user: SecretHolder, code: string): Promise<boolean> {
  if (!user.twoFactorSecret) return false;
  const step = verifyTotp(openSecret(user.id, user.twoFactorSecret), code, user.twoFactorLastStep);
  if (step !== null) {
    const updated = await prisma.user.updateMany({ where: { id: user.id, OR: [{ twoFactorLastStep: null }, { twoFactorLastStep: { lt: step } }] }, data: { twoFactorLastStep: step } });
    return updated.count === 1;
  }
  const hashes = Array.isArray(user.twoFactorBackupCodes) ? user.twoFactorBackupCodes.filter((value): value is string => typeof value === "string") : [];
  const hash = hashBackupCode(code);
  if (!hashes.includes(hash)) return false;
  await prisma.user.update({ where: { id: user.id }, data: { twoFactorBackupCodes: hashes.filter(item => item !== hash) } });
  return true;
}

export async function twoFactorStatus(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { twoFactorEnabledAt: true, twoFactorBackupCodes: true } });
  return {
    enabled: Boolean(user?.twoFactorEnabledAt),
    enabledAt: user?.twoFactorEnabledAt ?? null,
    backupCodesLeft: Array.isArray(user?.twoFactorBackupCodes) ? user.twoFactorBackupCodes.length : 0
  };
}

/** Starts setup: a new secret (kept but inactive) and the QR code to scan. Restarting replaces it. */
export async function startTwoFactorSetup(userId: string, account: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { twoFactorEnabledAt: true } });
  if (user?.twoFactorEnabledAt) throw new Error("ALREADY_ENABLED");
  const secret = generateTotpSecret();
  await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: sealSecret(userId, secret), twoFactorLastStep: null } });
  const uri = otpauthUri(secret, account);
  return { secret: secret.match(/.{1,4}/g)?.join(" ") ?? secret, uri, qr: await QRCode.toDataURL(uri, { margin: 1, width: 240, errorCorrectionLevel: "M" }) };
}

/** Finishes setup once the app shows a matching code. Returns the backup codes, shown this one time only. */
export async function confirmTwoFactor(userId: string, code: string): Promise<string[] | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, twoFactorSecret: true, twoFactorEnabledAt: true, twoFactorLastStep: true } });
  if (!user?.twoFactorSecret || user.twoFactorEnabledAt) return null;
  const step = verifyTotp(openSecret(user.id, user.twoFactorSecret), code, user.twoFactorLastStep);
  if (step === null) return null;
  const backupCodes = generateBackupCodes();
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { twoFactorEnabledAt: new Date(), twoFactorLastStep: step, twoFactorBackupCodes: backupCodes.map(hashBackupCode) } }),
    prisma.auditLog.create({ data: { actorId: userId, action: "TWO_FACTOR_ENABLED", entity: "User", entityId: userId } })
  ]);
  return backupCodes;
}

/** Turning it off needs a current code (or a backup code), so a stolen session alone cannot remove it. */
export async function disableTwoFactor(userId: string, code: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, twoFactorSecret: true, twoFactorEnabledAt: true, twoFactorBackupCodes: true, twoFactorLastStep: true } });
  if (!user?.twoFactorEnabledAt || !(await acceptCode(user, code))) return false;
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: null, twoFactorEnabledAt: null, twoFactorBackupCodes: [], twoFactorLastStep: null } }),
    prisma.auditLog.create({ data: { actorId: userId, action: "TWO_FACTOR_DISABLED", entity: "User", entityId: userId } })
  ]);
  return true;
}
