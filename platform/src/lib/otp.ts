import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getTelegramCredentials } from "@/lib/integration-credentials";
import { notifyTelegramUser } from "@/lib/telegram";

export type OtpPurpose = "LOGIN" | "RESET";
const TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_AFTER_MS = 60 * 1000;

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

function hashCode(code: string, target: string): string {
  const pepper = process.env.INTEGRATION_CREDENTIALS_KEY || process.env.NEXTAUTH_SECRET || "development-only";
  return createHash("sha256").update(`${pepper}:${target}:${code}`).digest("hex");
}

export function otpChannels() {
  const consoleMode = process.env.NODE_ENV !== "production" && process.env.OTP_DEV_CONSOLE === "1";
  return {
    consoleMode,
    sms: Boolean(process.env.ESKIZ_EMAIL && process.env.ESKIZ_PASSWORD) || consoleMode,
    email: Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM) || consoleMode
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

let eskizToken: { value: string; expiresAt: number } | null = null;

async function eskizLogin(): Promise<string> {
  if (eskizToken && eskizToken.expiresAt > Date.now()) return eskizToken.value;
  const form = new FormData();
  form.set("email", process.env.ESKIZ_EMAIL ?? "");
  form.set("password", process.env.ESKIZ_PASSWORD ?? "");
  const response = await fetch("https://notify.eskiz.uz/api/auth/login", { method: "POST", body: form });
  const body = await response.json() as { data?: { token?: string } };
  if (!response.ok || !body.data?.token) throw new Error(`Eskiz login failed: ${response.status}`);
  eskizToken = { value: body.data.token, expiresAt: Date.now() + 25 * 24 * 60 * 60 * 1000 };
  return eskizToken.value;
}

async function sendSms(phone: string, text: string): Promise<void> {
  const token = await eskizLogin();
  const form = new FormData();
  form.set("mobile_phone", phone.replace("+", ""));
  form.set("message", text);
  form.set("from", process.env.ESKIZ_FROM ?? "4546");
  const response = await fetch("https://notify.eskiz.uz/api/message/sms/send", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
  if (!response.ok) throw new Error(`Eskiz send failed: ${response.status}`);
}

async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to, subject, text })
  });
  if (!response.ok) throw new Error(`Email send failed: ${response.status}`);
}

export type OtpDelivery = "telegram" | "sms" | "email" | "none";

/** Creates a code and sends it the cheapest way that reaches this person. The code itself is never stored. */
export async function issueOtp(purpose: OtpPurpose, target: string, kind: "phone" | "email", user: { id: string; telegramChatId?: string | null } | null): Promise<OtpDelivery> {
  const channels = otpChannels();
  const recent = await prisma.otpCode.findFirst({ where: { target, purpose, createdAt: { gt: new Date(Date.now() - RESEND_AFTER_MS) } }, select: { id: true } });
  if (recent) return "none";
  const code = String(randomInt(100000, 1000000));
  const text = `Tecsecure tasdiqlash kodi: ${code}. Kod 5 daqiqa amal qiladi. Uni hech kimga bermang.`;
  await prisma.otpCode.create({ data: { purpose, target, codeHash: hashCode(code, target), expiresAt: new Date(Date.now() + TTL_MS) } });
  if (channels.consoleMode) console.info(`[OTP dev] ${target} ${purpose} ${code}`);
  if (user?.telegramChatId && await notifyTelegramUser(user.id, `🔐 <b>Tecsecure</b>\nTasdiqlash kodi: <code>${code}</code>\nKod 5 daqiqa amal qiladi. Uni hech kimga bermang.`)) return "telegram";
  if (channels.consoleMode) return kind === "phone" ? "sms" : "email";
  if (kind === "phone" && channels.sms) { await sendSms(target, text); return "sms"; }
  if (kind === "email" && channels.email) { await sendEmail(target, "Tecsecure tasdiqlash kodi", text); return "email"; }
  return "none";
}

/** True once, for the right code, within its time and attempt limits. */
export async function verifyOtp(purpose: OtpPurpose, target: string, code: string): Promise<boolean> {
  const record = await prisma.otpCode.findFirst({ where: { target, purpose, consumedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } });
  if (!record || record.attempts >= MAX_ATTEMPTS) return false;
  await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
  const given = Buffer.from(hashCode(code.trim(), target));
  const expected = Buffer.from(record.codeHash);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;
  const consumed = await prisma.otpCode.updateMany({ where: { id: record.id, consumedAt: null }, data: { consumedAt: new Date() } });
  return consumed.count === 1;
}
