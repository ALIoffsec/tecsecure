import { timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { escapeTelegramHtml, sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";

type TelegramUpdateBody = {
  update_id: number;
  message?: {
    text?: string;
    chat: { id: number; type: string };
  };
};

function hasValidSecret(received: string | null, expected: string): boolean {
  if (!received) return false;
  const receivedBytes = Buffer.from(received);
  const expectedBytes = Buffer.from(expected);
  return receivedBytes.length === expectedBytes.length && timingSafeEqual(receivedBytes, expectedBytes);
}

async function handleStart(update: TelegramUpdateBody, token: string): Promise<void> {
  const message = update.message;
  if (!message) return;
  const now = new Date();
  try {
    const linked = await prisma.user.updateMany({
      where: { telegramLinkToken: token, telegramLinkExpiresAt: { gt: now }, active: true },
      data: { telegramChatId: String(message.chat.id), telegramLinkToken: null, telegramLinkExpiresAt: null }
    });
    if (linked.count === 0) {
      await sendTelegramMessage(String(message.chat.id), "Ulanish havolasi eskirgan yoki ishlatilgan. Profilingizdan yangi havola yarating.");
      return;
    }
    await sendTelegramMessage(String(message.chat.id), "Telegram Tecsecure profilingizga ulandi. Admin javoblari va buyurtma holatlarini shu yerda olasiz.");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      await sendTelegramMessage(String(message.chat.id), "Bu Telegram hisobi boshqa profilga ulangan.");
      return;
    }
    throw error;
  }
}

async function handleAdminReply(update: TelegramUpdateBody, reference: string, body: string): Promise<void> {
  const message = update.message;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!message || !adminChatId) return;
  const saved = await prisma.$transaction(async (tx) => {
    await tx.telegramUpdate.create({ data: { updateId: BigInt(update.update_id) } });
    const conversation = await tx.portalConversation.findUnique({
      where: { reference },
      select: {
        id: true,
        sourceType: true,
        sourceId: true,
        customerId: true,
        customer: { select: { telegramChatId: true } }
      }
    });
    if (!conversation) return { status: "missing" as const };
    await tx.portalMessage.create({
      data: { conversationId: conversation.id, sender: "ADMIN", body }
    });
    if (conversation.sourceType === "PRODUCT_QUESTION") {
      await tx.productQuestion.updateMany({
        where: { id: conversation.sourceId },
        data: { answer: body, answeredAt: new Date() }
      });
    }
    if (conversation.customerId) {
      await tx.notification.create({
        data: {
          userId: conversation.customerId,
          channel: "IN_APP",
          event: "SUPPORT_MESSAGE_RECEIVED",
          status: "DELIVERED",
          payload: { reference }
        }
      });
    }
    return {
      status: "saved" as const,
      customerChatId: conversation.customer?.telegramChatId ?? null
    };
  });
  if (saved.status === "missing") {
    await sendTelegramMessage(adminChatId, `Murojaat raqami topilmadi: <code>${escapeTelegramHtml(reference)}</code>`);
    return;
  }
  if (saved.customerChatId) {
    try {
      await sendTelegramMessage(
        saved.customerChatId,
        `<b>Tecsecure javobi</b>\nMurojaat: <code>${escapeTelegramHtml(reference)}</code>\n\n${escapeTelegramHtml(body)}`
      );
    } catch (error) {
      console.error("Telegram reply delivery to customer failed", error);
    }
  }
  await sendTelegramMessage(
    adminChatId,
    saved.customerChatId
      ? "Javob profilga saqlandi va ulangan Telegram’ga yuborildi."
      : "Javob profilga saqlandi. Foydalanuvchi Telegram’ini profilidan ulasa, keyingi xabarlar unga ham boradi."
  );
}

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "Telegram webhook secret sozlanmagan." }, { status: 503 });
  if (!hasValidSecret(request.headers.get("x-telegram-bot-api-secret-token"), secret)) {
    return Response.json({ error: "Ruxsat yo‘q." }, { status: 401 });
  }
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 64 * 1024) return Response.json({ error: "So‘rov juda katta." }, { status: 413 });
  let update: TelegramUpdateBody;
  try {
    update = await request.json() as TelegramUpdateBody;
  } catch {
    return Response.json({ error: "Noto‘g‘ri JSON." }, { status: 400 });
  }
  const message = update.message;
  if (!Number.isSafeInteger(update.update_id) || !message?.text || message.chat.type !== "private") {
    return Response.json({ ok: true });
  }

  const text = message.text.trim();
  const start = text.match(/^\/start(?:@\w+)?(?:\s+([A-Za-z0-9_-]{20,80}))?$/);
  if (start?.[1]) {
    await handleStart(update, start[1]);
    return Response.json({ ok: true });
  }

  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId || String(message.chat.id) !== adminChatId) {
    return Response.json({ ok: true });
  }
  const reply = text.match(/^\/reply(?:@\w+)?\s+([A-Z0-9-]{4,80})\s+([\s\S]{1,3000})$/i);
  if (!reply) {
    if (/^\/reply(?:@\w+)?/i.test(text)) {
      await sendTelegramMessage(adminChatId, "Format: <code>/reply MUROJAAT-RAQAMI javob matni</code> (3000 belgigacha).");
    } else {
      await sendTelegramMessage(adminChatId, "Bot buyrug‘i: <code>/reply MUROJAAT-RAQAMI javob matni</code>.");
    }
    return Response.json({ ok: true });
  }
  try {
    await handleAdminReply(update, reply[1].toUpperCase(), reply[2].trim());
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ ok: true });
    }
    console.error("Telegram webhook processing failed", error);
    return Response.json({ error: "Xabarni saqlab bo‘lmadi." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
