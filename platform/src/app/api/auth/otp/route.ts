import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { findCustomer, issueOtp, normalizeIdentifier, otpChannels, telegramAvailable, verifyOtp, type OtpDelivery } from "@/lib/otp";

export const runtime = "nodejs";

const requestSchema = z.object({ action: z.literal("request"), purpose: z.enum(["LOGIN", "RESET"]), identifier: z.string().trim().min(5).max(254) });
const verifySchema = z.object({
  action: z.literal("verify"), purpose: z.enum(["LOGIN", "RESET"]), identifier: z.string().trim().min(5).max(254),
  code: z.string().trim().regex(/^\d{6}$/), password: z.string().min(8).max(128).optional(), name: z.string().trim().min(2).max(100).optional()
});

export async function GET() {
  const { sms, email } = await otpChannels();
  return Response.json({ sms, email, telegram: await telegramAvailable() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }

  const asked = requestSchema.safeParse(body);
  if (asked.success) {
    const identifier = normalizeIdentifier(asked.data.identifier);
    if (!identifier || (asked.data.purpose === "LOGIN" && identifier.kind !== "phone")) return Response.json({ error: "Telefon raqami yoki email noto‘g‘ri." }, { status: 400 });
    if (!(await checkRateLimit("otp-ip", ip, 12, 60 * 60 * 1000)) || !(await checkRateLimit("otp-target", identifier.value, 6, 60 * 60 * 1000))) {
      return Response.json({ error: "Urinishlar limiti oshdi. Keyinroq urinib ko‘ring." }, { status: 429 });
    }
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
    // Sign-in says nothing went out rather than showing a code field for a code that will never come.
    if (login && delivery === "none") {
      return Response.json({ error: "SMS xizmati hozircha ishlamayapti. Email va parol bilan kiring.", code: "NO_CHANNEL" }, { status: 503 });
    }
    return Response.json({ ok: true, target: identifier.value, isNew: login && !user, ...(login ? { via: delivery } : {}) });
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Kod yoki parol noto‘g‘ri." }, { status: 400 });
  const identifier = normalizeIdentifier(parsed.data.identifier);
  if (!identifier) return Response.json({ error: "Telefon raqami yoki email noto‘g‘ri." }, { status: 400 });
  if (!(await checkRateLimit("otp-verify-ip", ip, 30, 60 * 60 * 1000))) return Response.json({ error: "Urinishlar limiti oshdi. Keyinroq urinib ko‘ring." }, { status: 429 });
  if (parsed.data.purpose === "RESET" && !parsed.data.password) return Response.json({ error: "Parol talablarga mos emas." }, { status: 400 });
  if (!(await verifyOtp(parsed.data.purpose, identifier.value, parsed.data.code))) return Response.json({ error: "Kod noto‘g‘ri yoki muddati tugagan." }, { status: 401 });

  let user = await findCustomer(identifier);
  if (parsed.data.purpose === "RESET") {
    if (!user) return Response.json({ error: "Kod noto‘g‘ri yoki muddati tugagan." }, { status: 401 });
    const passwordHash = await bcrypt.hash(parsed.data.password as string, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
      prisma.auditLog.create({ data: { actorId: user.id, action: "PASSWORD_RESET_BY_CODE", entity: "User", entityId: user.id } })
    ]);
  } else if (!user) {
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
  await createSession(user.id);
  return Response.json({ ok: true });
}
