import { requireAdminApi } from "@/lib/auth";
import { normalizePhone, otpSmsText, sendSms, SmsSendError } from "@/lib/otp";
import { checkRateLimit } from "@/lib/rate-limit";
import { connectTelegramBot } from "@/lib/telegram";

export const runtime = "nodejs";

/** Sends a real SMS with the sign-in text, so the admin sees Eskiz's own answer (moderation, balance, login). */
async function testSms(actorId: string, phoneInput: unknown): Promise<Response> {
  const phone = typeof phoneInput === "string" ? normalizePhone(phoneInput) : null;
  if (!phone) return Response.json({ error: "Telefon raqami noto‘g‘ri. Masalan: +998 90 123 45 67" }, { status: 400 });
  if (!(await checkRateLimit("admin-sms-test", actorId, 10, 60 * 60 * 1000))) {
    return Response.json({ error: "Bir soatda 10 tadan ortiq sinov SMS yuborib bo‘lmaydi." }, { status: 429 });
  }
  try {
    const id = await sendSms(phone, otpSmsText("LOGIN", "123456"));
    return Response.json({ ok: true, id });
  } catch (error) {
    const detail = error instanceof SmsSendError ? error.detail : error instanceof Error ? error.message : "UnknownError";
    console.error("SMS test failed", detail);
    return Response.json({ error: `Eskiz SMS yubormadi: ${detail}` }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const actor = await requireAdminApi();
  if (actor instanceof Response) return actor;
  const body = await request.json().catch(() => null) as { channel?: unknown; phone?: unknown } | null;
  if (body?.channel === "sms") return testSms(actor.id, body.phone);
  try {
    return Response.json(await connectTelegramBot());
  } catch (error) {
    console.error("Telegram connection test failed", error instanceof Error ? error.message : "UnknownError");
    return Response.json({ error: "Botga ulanib bo‘lmadi. Token va chat ID ni tekshiring." }, { status: 502 });
  }
}
