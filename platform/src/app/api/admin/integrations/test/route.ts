import { requireAdminApi } from "@/lib/auth";
import { normalizePhone, otpSmsText, sendSms, SmsSendError } from "@/lib/otp";
import { checkRateLimit } from "@/lib/rate-limit";
import { connectTelegramBot } from "@/lib/telegram";
import { MailSendError, sendMail } from "@/lib/mailer";
import { GatewayError, gatewayToken, sendGatewayCode } from "@/lib/telegram-gateway";

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

/** Sends a real message from the company mailbox to the address staff typed, and reports the server's answer. */
async function testMail(actorId: string, toInput: unknown): Promise<Response> {
  const to = typeof toInput === "string" ? toInput.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return Response.json({ error: "Email manzili noto‘g‘ri." }, { status: 400 });
  if (!(await checkRateLimit("admin-mail-test", actorId, 10, 60 * 60 * 1000))) {
    return Response.json({ error: "Bir soatda 10 tadan ortiq sinov xat yuborib bo‘lmaydi." }, { status: 429 });
  }
  try {
    await sendMail(to, "Tecsecure: sinov xati", "Bu Tecsecure admin panelidan yuborilgan sinov xati. Kodlar va bildirishnomalar shu manzildan keladi.");
    return Response.json({ ok: true });
  } catch (error) {
    const detail = error instanceof MailSendError ? error.detail : error instanceof Error ? error.message : "UnknownError";
    console.error("Mail test failed", detail);
    return Response.json({ error: `Xat yuborilmadi: ${detail}` }, { status: 502 });
  }
}

/** A real Gateway code to the number staff typed. Free to the Gateway account owner's own number. */
async function testGateway(actorId: string, phoneInput: unknown): Promise<Response> {
  const phone = typeof phoneInput === "string" ? normalizePhone(phoneInput) : null;
  if (!phone) return Response.json({ error: "Telefon raqami noto‘g‘ri. Masalan: +998 90 123 45 67" }, { status: 400 });
  if (!(await checkRateLimit("admin-gateway-test", actorId, 10, 60 * 60 * 1000))) {
    return Response.json({ error: "Bir soatda 10 tadan ortiq sinov yuborib bo‘lmaydi." }, { status: 429 });
  }
  const token = await gatewayToken();
  if (!token) return Response.json({ error: "Telegram Gateway tokeni kiritilmagan." }, { status: 400 });
  try {
    const requestId = await sendGatewayCode(token, phone, "123456", "TEST");
    if (!requestId) return Response.json({ error: "Bu raqamga Telegram orqali kod yuborib bo‘lmaydi (raqamda Telegram yo‘q yoki cheklangan)." }, { status: 409 });
    return Response.json({ ok: true, requestId });
  } catch (error) {
    const detail = error instanceof GatewayError ? error.code : error instanceof Error ? error.message : "UnknownError";
    console.error("Gateway test failed", detail);
    return Response.json({ error: `Telegram Gateway kod yubormadi: ${detail}` }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const actor = await requireAdminApi();
  if (actor instanceof Response) return actor;
  const body = await request.json().catch(() => null) as { channel?: unknown; phone?: unknown; to?: unknown } | null;
  if (body?.channel === "sms") return testSms(actor.id, body.phone);
  if (body?.channel === "mail") return testMail(actor.id, body.to);
  if (body?.channel === "gateway") return testGateway(actor.id, body.phone);
  try {
    return Response.json(await connectTelegramBot());
  } catch (error) {
    console.error("Telegram connection test failed", error instanceof Error ? error.message : "UnknownError");
    return Response.json({ error: "Botga ulanib bo‘lmadi. Token va chat ID ni tekshiring." }, { status: 502 });
  }
}
