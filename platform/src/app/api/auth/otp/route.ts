import { clientIp } from "@/lib/client-ip";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { beginSignIn } from "@/lib/two-factor";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { findCustomer, hashCode, issueOtp, normalizeIdentifier, otpChannels, telegramAvailable, verifyOtp, type OtpDelivery } from "@/lib/otp";
import { startTelegramPhoneCheck } from "@/lib/phone-telegram";

export const runtime = "nodejs";

const RESET_TICKET_MS = 10 * 60 * 1000;
const identifierField = z.string().trim().min(5).max(254);
const purposeField = z.enum(["LOGIN", "RESET"]);
const requestSchema = z.object({ action: z.literal("request"), purpose: purposeField, identifier: identifierField });
const telegramSchema = z.object({ action: z.literal("telegram"), purpose: purposeField, identifier: identifierField });
const verifySchema = z.object({
  action: z.literal("verify"), purpose: purposeField, identifier: identifierField,
  code: z.string().trim().regex(/^\d{6}$/), name: z.string().trim().min(2).max(100).optional()
});
const resetSchema = z.object({
  action: z.literal("reset"), identifier: identifierField, ticket: z.string().min(20).max(100),
  password: z.string().min(8).max(128), confirm: z.string().min(8).max(128)
});

const tooMany = () => Response.json({ error: "Urinishlar limiti oshdi. Keyinroq urinib ko‘ring.", code: "RATE_LIMITED" }, { status: 429 });
const badIdentifier = () => Response.json({ error: "Telefon raqami yoki email noto‘g‘ri.", code: "BAD_IDENTIFIER" }, { status: 400 });

export async function GET() {
  const { sms, email } = await otpChannels();
  return Response.json({ sms, email, telegram: await telegramAvailable() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }

  // 1a. Send a code by Telegram (if linked), SMS or email.
  const asked = requestSchema.safeParse(body);
  if (asked.success) {
    const identifier = normalizeIdentifier(asked.data.identifier);
    if (!identifier || (asked.data.purpose === "LOGIN" && identifier.kind !== "phone")) return badIdentifier();
    if (!(await checkRateLimit("otp-ip", ip, 12, 60 * 60 * 1000)) || !(await checkRateLimit("otp-target", identifier.value, 6, 60 * 60 * 1000))) return tooMany();
    const login = asked.data.purpose === "LOGIN";
    const user = await findCustomer(identifier);
    let delivery: OtpDelivery = "none";
    // A reset for an unknown account answers exactly like a real one, so nobody can test who has an account here.
    if (user || login) {
      try {
        delivery = await issueOtp(asked.data.purpose, identifier.value, identifier.kind, user);
      } catch (error) {
        console.error("Sending a sign-in code failed", error instanceof Error ? error.message : "UnknownError");
        return Response.json({ error: "Kodni yuborib bo‘lmadi. Keyinroq urinib ko‘ring.", code: "SEND_FAILED" }, { status: 502 });
      }
    }
    if (login && delivery === "none") return Response.json({ error: "SMS xizmati hozircha ishlamayapti.", code: "NO_CHANNEL" }, { status: 503 });
    return Response.json({ ok: true, target: identifier.value, isNew: login && !user, ...(login ? { via: delivery } : {}) });
  }

  // 1b. Or prove the number in Telegram: the bot asks for the person's own contact and sends the code there.
  const viaTelegram = telegramSchema.safeParse(body);
  if (viaTelegram.success) {
    const identifier = normalizeIdentifier(viaTelegram.data.identifier);
    if (!identifier || identifier.kind !== "phone") return badIdentifier();
    if (!(await checkRateLimit("otp-telegram-ip", ip, 12, 60 * 60 * 1000)) || !(await checkRateLimit("otp-telegram-target", identifier.value, 6, 60 * 60 * 1000))) return tooMany();
    const link = await startTelegramPhoneCheck(viaTelegram.data.purpose, identifier.value);
    if (!link) return Response.json({ error: "Telegram bot hali sozlanmagan.", code: "NO_TELEGRAM" }, { status: 503 });
    const user = viaTelegram.data.purpose === "LOGIN" ? await findCustomer(identifier) : null;
    return Response.json({ ok: true, link, target: identifier.value, isNew: viaTelegram.data.purpose === "LOGIN" && !user });
  }

  // 2. Check the code. Sign-in finishes here; a reset only earns a short ticket to choose the new password.
  const parsed = verifySchema.safeParse(body);
  if (parsed.success) {
    const identifier = normalizeIdentifier(parsed.data.identifier);
    if (!identifier) return badIdentifier();
    if (!(await checkRateLimit("otp-verify-ip", ip, 30, 60 * 60 * 1000))) return tooMany();
    if (!(await verifyOtp(parsed.data.purpose, identifier.value, parsed.data.code))) {
      return Response.json({ error: "Kod noto‘g‘ri yoki muddati tugagan.", code: "WRONG_CODE" }, { status: 401 });
    }
    let user = await findCustomer(identifier);
    if (parsed.data.purpose === "RESET") {
      if (!user) return Response.json({ error: "Kod noto‘g‘ri yoki muddati tugagan.", code: "WRONG_CODE" }, { status: 401 });
      const ticket = randomBytes(24).toString("base64url");
      await prisma.otpCode.create({ data: { purpose: "RESET_TICKET", target: identifier.value, codeHash: hashCode(ticket, identifier.value), expiresAt: new Date(Date.now() + RESET_TICKET_MS) } });
      return Response.json({ ok: true, ticket });
    }
    if (!user) {
      // First visit with a verified number: the phone is the account.
      const passwordHash = await bcrypt.hash(randomBytes(32).toString("base64url"), 12);
      const digits = identifier.value.replace("+", "");
      user = await prisma.user.create({
        data: { name: parsed.data.name || `Mijoz ${digits.slice(-4)}`, email: `phone-${digits}@accounts.tecsecure.invalid`, phone: identifier.value, phoneVerifiedAt: new Date(), passwordHash },
        select: { id: true, phone: true, telegramChatId: true, email: true, name: true }
      });
    } else if (identifier.kind === "phone") {
      await prisma.user.update({ where: { id: user.id }, data: { phoneVerifiedAt: new Date() } });
    }
    const started = await beginSignIn(user.id);
    if ("twoFactor" in started) return Response.json({ twoFactor: started.twoFactor });
    return Response.json({ ok: true });
  }

  // 3. The new password, typed twice, with the ticket from step 2.
  const reset = resetSchema.safeParse(body);
  if (reset.success) {
    if (reset.data.password !== reset.data.confirm) return Response.json({ error: "Parollar bir xil emas.", code: "PASSWORD_MISMATCH" }, { status: 400 });
    const identifier = normalizeIdentifier(reset.data.identifier);
    if (!identifier) return badIdentifier();
    if (!(await checkRateLimit("otp-reset-ip", ip, 20, 60 * 60 * 1000))) return tooMany();
    const user = await findCustomer(identifier);
    if (!user || !(await verifyOtp("RESET_TICKET", identifier.value, reset.data.ticket))) {
      return Response.json({ error: "Tasdiqlash vaqti tugadi. Kodni qaytadan oling.", code: "TICKET_EXPIRED" }, { status: 401 });
    }
    const passwordHash = await bcrypt.hash(reset.data.password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      // Every device signed in with the old password is signed out.
      prisma.session.deleteMany({ where: { userId: user.id } }),
      prisma.auditLog.create({ data: { actorId: user.id, action: "PASSWORD_RESET_BY_CODE", entity: "User", entityId: user.id } })
    ]);
    const started = await beginSignIn(user.id);
    if ("twoFactor" in started) return Response.json({ twoFactor: started.twoFactor });
    return Response.json({ ok: true });
  }

  return Response.json({ error: "So‘rov noto‘g‘ri.", code: "BAD_REQUEST" }, { status: 400 });
}
