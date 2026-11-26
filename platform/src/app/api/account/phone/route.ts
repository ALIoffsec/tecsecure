import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { issuePhoneVerification, lockPhone, otpChannels, phoneAccounts, phoneVerifyTarget, telegramAvailable, verifyOtp } from "@/lib/otp";
import { normalizePhone } from "@/lib/phone";
import { maskPhone, startTelegramPhoneCheck } from "@/lib/phone-telegram";
import { prisma } from "@/lib/prisma";
import { rateLimit, tooManyAttempts } from "@/lib/rate-limit";

export const runtime = "nodejs";

const noStore = { "Cache-Control": "private, no-store" };
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("send") }),
  z.object({ action: z.literal("telegram") }),
  z.object({ action: z.literal("verify"), code: z.string().trim().regex(/^\d{6}$/) })
]);

async function accountPhone(userId: string) {
  const account = await prisma.user.findUnique({ where: { id: userId }, select: { phone: true, phoneVerifiedAt: true } });
  const phone = account?.phone ? normalizePhone(account.phone) : null;
  return { typed: account?.phone ?? null, phone, verified: Boolean(account?.phoneVerifiedAt) };
}

/** Whether the profile number is proved, and which ways of proving it work right now. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  const { typed, phone, verified } = await accountPhone(user.id);
  const channels = await otpChannels();
  return Response.json({
    hasPhone: Boolean(typed), supported: Boolean(phone), verified,
    sms: channels.sms, telegram: await telegramAvailable()
  }, { headers: noStore });
}

/**
 * Proves the number in the profile: a code sent to the number itself (or through Telegram's own contact
 * check), bound to this account. Once proved, sign-in by phone finds this account, and the number stops
 * counting on any other account (its text stays there).
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") return Response.json({ error: "Bu amal uchun ruxsat yo‘q." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "So‘rov noto‘g‘ri." }, { status: 400 });

  const { typed, phone, verified } = await accountPhone(user.id);
  if (!typed) return Response.json({ error: "Avval profilga telefon raqamini kiriting.", code: "NO_PHONE" }, { status: 400 });
  if (!phone) return Response.json({ error: "Faqat O‘zbekiston raqamini tasdiqlash mumkin.", code: "UNSUPPORTED_PHONE" }, { status: 400 });
  if (verified) return Response.json({ ok: true, verified: true });

  if (parsed.data.action === "send" || parsed.data.action === "telegram") {
    const limited = await rateLimit("phone-verify-send", user.id, 5, 60 * 60 * 1000);
    if (!limited.ok) return tooManyAttempts(limited.retryAfterSeconds);
    if (parsed.data.action === "telegram") {
      const link = await startTelegramPhoneCheck({ verifyFor: user.id }, phone);
      if (!link) return Response.json({ error: "Telegram bot hali sozlanmagan.", code: "NO_TELEGRAM" }, { status: 503 });
      return Response.json({ ok: true, link, phone: maskPhone(phone) });
    }
    try {
      const via = await issuePhoneVerification(user.id, phone);
      if (via === "none") return Response.json({ error: "SMS xizmati hozircha ishlamayapti.", code: "NO_CHANNEL" }, { status: 503 });
      return Response.json({ ok: true, via, phone: maskPhone(phone) });
    } catch (error) {
      console.error("Sending a phone check code failed", error instanceof Error ? error.message : "UnknownError");
      return Response.json({ error: "Kodni yuborib bo‘lmadi. Keyinroq urinib ko‘ring.", code: "SEND_FAILED" }, { status: 502 });
    }
  }

  const limited = await rateLimit("phone-verify-check", user.id, 20, 60 * 60 * 1000);
  if (!limited.ok) return tooManyAttempts(limited.retryAfterSeconds);
  if (!(await verifyOtp("VERIFY_PHONE", phoneVerifyTarget(user.id, phone), parsed.data.code))) {
    return Response.json({ error: "Kod noto‘g‘ri yoki muddati tugagan.", code: "WRONG_CODE" }, { status: 401 });
  }
  const done = await prisma.$transaction(async (tx) => {
    await lockPhone(tx, phone);
    const current = await tx.user.findUnique({ where: { id: user.id }, select: { phone: true } });
    // The number was changed while the code was on its way: the code proves the old one only.
    if (!current?.phone || normalizePhone(current.phone) !== phone) return false;
    const others = (await phoneAccounts(phone, tx)).filter(account => account.id !== user.id && account.phoneVerifiedAt);
    if (others.length) {
      // A proved number belongs to one account. The other keeps the text but no longer signs in with it.
      await tx.user.updateMany({ where: { id: { in: others.map(account => account.id) } }, data: { phoneVerifiedAt: null } });
      await tx.auditLog.createMany({ data: others.map(account => ({ actorId: user.id, action: "PHONE_VERIFICATION_MOVED", entity: "User", entityId: account.id, metadata: { phone: maskPhone(phone), to: user.id } })) });
    }
    await tx.user.update({ where: { id: user.id }, data: { phone, phoneVerifiedAt: new Date() } });
    await tx.auditLog.create({ data: { actorId: user.id, action: "PHONE_VERIFIED", entity: "User", entityId: user.id, metadata: { phone: maskPhone(phone) } } });
    return true;
  });
  if (!done) return Response.json({ error: "Raqam o‘zgargan. Kodni qaytadan oling.", code: "PHONE_CHANGED" }, { status: 409 });
  return Response.json({ ok: true, verified: true });
}
