import { reviewWalletTransaction, WalletReviewError, walletReviewMessages } from "@/lib/wallet-review";
import { timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  answerTelegramCallbackQuery,
  createTelegramAdminKeyboard,
  editTelegramAdminMessage,
  escapeTelegramHtml,
  getTelegramAdminPanelUrl,
  parseTelegramAdminCallbackData,
  parseTelegramWalletCallbackData,
  walletDecisionText,
  notifyTelegramUser,
  withTelegramBot,
  sendTelegramMessage
} from "@/lib/telegram";
import { getTelegramCredentials } from "@/lib/integration-credentials";
import { onPhoneCheckStart, onSharedContact, PHONE_START_PREFIX } from "@/lib/phone-telegram";

export const runtime = "nodejs";

type TelegramMessageBody = {
  text?: string;
  from?: { id: number };
  contact?: { phone_number: string; user_id?: number };
  message_id: number;
  chat: { id: number; type: string };
  reply_to_message?: { text?: string };
};

type TelegramUpdateBody = {
  update_id: number;
  message?: TelegramMessageBody;
  callback_query?: {
    id: string;
    from: { id: number };
    data?: string;
    message?: TelegramMessageBody;
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

async function handleAdminReply(update: TelegramUpdateBody, reference: string, body: string, adminChatId: string): Promise<void> {
  const message = update.message;
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

async function buildAdminReport(): Promise<string> {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const [newOrders, todayOrders, pendingWallet, openRequests] = await Promise.all([
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.order.count({ where: { createdAt: { gte: dayStart } } }),
    prisma.walletTransaction.count({ where: { status: "PENDING" } }),
    prisma.serviceRequest.count({ where: { status: { in: ["NEW", "CONTACTED"] } } })
  ]);
  return [
    "<b>📊 Tecsecure hisoboti</b>",
    `Yangi buyurtmalar: <b>${newOrders}</b>`,
    `Bugungi buyurtmalar: <b>${todayOrders}</b>`,
    `Kutilayotgan hamyon arizalari: <b>${pendingWallet}</b>`,
    `Ochiq xizmat arizalari: <b>${openRequests}</b>`
  ].join("\n");
}

async function handleAdminCallback(update: TelegramUpdateBody, adminChatId: string): Promise<void> {
  const callback = update.callback_query;
  if (!callback) return;
  const message = callback.message;
  if (
    !adminChatId ||
    String(callback.from.id) !== adminChatId ||
    !message ||
    message.chat.type !== "private" ||
    String(message.chat.id) !== adminChatId
  ) {
    await answerTelegramCallbackQuery(callback.id, "Bu amal uchun ruxsat yo‘q.");
    return;
  }

  const walletAction = parseTelegramWalletCallbackData(callback.data);
  if (walletAction) {
    try {
      const transaction = await reviewWalletTransaction(walletAction.id, walletAction.decision, { id: null, via: "telegram" });
      await notifyTelegramUser(transaction.userId, walletDecisionText(transaction));
      await answerTelegramCallbackQuery(callback.id, walletAction.decision === "APPROVED" ? "Tasdiqlandi. Balans yangilandi." : "Rad etildi.");
      await sendTelegramMessage(adminChatId, `Ariza ${walletAction.decision === "APPROVED" ? "tasdiqlandi ✅" : "rad etildi ❌"}: ${Math.round(transaction.amountMinor / 100)} so‘m`, { replyToMessageId: message.message_id });
    } catch (error) {
      if (error instanceof WalletReviewError) {
        await answerTelegramCallbackQuery(callback.id, walletReviewMessages[error.code].error);
        return;
      }
      throw error;
    }
    return;
  }
  const action = parseTelegramAdminCallbackData(callback.data);
  if (!action) {
    await answerTelegramCallbackQuery(callback.id, "Tugma ma’lumoti noto‘g‘ri.");
    return;
  }
  if (action.action === "reply") {
    await answerTelegramCallbackQuery(callback.id, "Javob yozish oynasi ochildi.");
    await sendTelegramMessage(
      adminChatId,
      `Javob uchun murojaat: ${action.reference}\nShu xabarga Reply qilib javobingizni yuboring (3000 belgigacha).`,
      {
        replyToMessageId: message.message_id,
        replyMarkup: { force_reply: true, input_field_placeholder: "Javob matnini yozing" }
      }
    );
    return;
  }

  if (!message.text) {
    await answerTelegramCallbackQuery(callback.id, "Xabar matnini o‘qib bo‘lmadi.");
    return;
  }
  const currentStatus = message.text.match(/\n\n(?:🟡 Telegram holati: Jarayonda|✅ Telegram holati: Yakunlandi)$/u)?.[0];
  if (currentStatus?.includes("Yakunlandi")) {
    await answerTelegramCallbackQuery(callback.id, "Bu xabar allaqachon yakunlangan.");
    return;
  }
  if (currentStatus?.includes("Jarayonda") && action.action === "progress") {
    await answerTelegramCallbackQuery(callback.id, "Xabar allaqachon jarayonda.");
    return;
  }

  const originalText = message.text.replace(/\n\n(?:🟡 Telegram holati: Jarayonda|✅ Telegram holati: Yakunlandi)$/u, "");
  const isDone = action.action === "done";
  const statusText = isDone
    ? "✅ Telegram holati: Yakunlandi"
    : "🟡 Telegram holati: Jarayonda";
  await answerTelegramCallbackQuery(
    callback.id,
    isDone ? "Xabar yakunlangan deb belgilandi." : "Xabar jarayonga olindi."
  );
  await editTelegramAdminMessage(
    adminChatId,
    message.message_id,
    `${originalText}\n\n${statusText}`,
    createTelegramAdminKeyboard(
      action.reference,
      getTelegramAdminPanelUrl(),
      isDone ? "done" : "in_progress"
    )
  );
}

/** The answer to a plain /start: what the bot is for and a button into its Mini App. */
async function sendWelcome(chatId: string, bot: "customer" | "staff"): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const path = bot === "staff" ? "/tg/staff" : "/tg";
  const button = appUrl.startsWith("https://") ? { replyMarkup: { inline_keyboard: [[{ text: bot === "staff" ? "Ish oynasini ochish" : "Tecsecure’ni ochish", web_app: { url: new URL(path, appUrl).toString() } }]] } } : {};
  const text = bot === "staff"
    ? ["<b>Tecsecure xodimlar boti</b>", "Yangi buyurtma va arizalar shu yerga keladi.", "Ish oynasini pastdagi tugmadan oching. Bugungi raqamlar: /hisobot"].join("\n")
    : [
      "<b>Assalomu alaykum! Bu Tecsecure boti.</b>",
      "• Do‘kon, buyurtmalar va hisobingiz pastdagi tugma orqali ochiladi.",
      "• Saytda “Kodni Telegram orqali olish” tugmasini bosgan bo‘lsangiz, saytga qayting va o‘sha tugmani yana bir bor bosing: bot raqamingizni so‘raydi va kodni shu yerga yuboradi.",
      "• Buyurtma holati va javoblar ham shu yerga keladi."
    ].join("\n");
  await sendTelegramMessage(chatId, text, button);
}

/** The shop bot only opens the shop cabinet; selling, orders and money all live in its Mini App. */
async function handleShopMessage(update: TelegramUpdateBody): Promise<void> {
  const message = update.message;
  if (!message || message.chat.type !== "private") return;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const open = appUrl.startsWith("https://") ? { inline_keyboard: [[{ text: "Do‘kon kabinetini ochish", web_app: { url: new URL("/tg/shop", appUrl).toString() } }]] } : undefined;
  await sendTelegramMessage(String(message.chat.id), [
    "<b>Tecsecure do‘konlar boti</b>",
    "Mahsulotlaringizni Tecsecure’da o‘z do‘koningiz nomi bilan soting.",
    "Kabinetda ariza berasiz, mahsulot va narx qo‘shasiz, buyurtmalarni jo‘natasiz va balansingizni ko‘rasiz.",
    "Yangi buyurtma va to‘lov xabarlari shu yerga keladi."
  ].join("\n"), open ? { replyMarkup: open } : {});
}

async function handleUpdate(request: Request, bot: "customer" | "staff" | "shop"): Promise<Response> {
  let webhookSecret: string;
  let adminChatId: string;
  try {
    const credentials = await getTelegramCredentials();
    adminChatId = credentials.adminChatId;
    webhookSecret = bot === "staff" ? credentials.staffWebhookSecret : bot === "shop" ? credentials.shopWebhookSecret : credentials.webhookSecret;
  } catch (error) {
    console.error("Telegram webhook configuration unavailable", error instanceof Error ? error.name : "UnknownError");
    return Response.json({ error: "Telegram sozlamalarini o‘qib bo‘lmadi." }, { status: 503 });
  }
  if (!webhookSecret) return Response.json({ error: "Telegram webhook secret sozlanmagan." }, { status: 503 });
  if (!hasValidSecret(request.headers.get("x-telegram-bot-api-secret-token"), webhookSecret)) {
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
  if (!Number.isSafeInteger(update.update_id)) {
    return Response.json({ ok: true });
  }
  if (bot === "shop") {
    try {
      await handleShopMessage(update);
    } catch (error) {
      console.error("Shop bot message failed", error instanceof Error ? error.message : "UnknownError");
    }
    return Response.json({ ok: true });
  }
  if (update.callback_query) {
    try {
      await handleAdminCallback(update, adminChatId);
    } catch (error) {
      console.error("Telegram admin button processing failed", error);
      return Response.json({ error: "Tugma amalini bajarib bo‘lmadi." }, { status: 500 });
    }
    return Response.json({ ok: true });
  }
  const message = update.message;
  // A shared contact answers the phone check that a "Kodni Telegram orqali olish" link started.
  if (message?.contact && message.chat.type === "private" && bot === "customer") {
    try {
      await onSharedContact(String(message.chat.id), message.from?.id, message.contact);
    } catch (error) {
      console.error("Telegram phone check failed at the shared-contact step:", error instanceof Error ? `${error.name}: ${error.message}` : String(error));
    }
    return Response.json({ ok: true });
  }
  if (!message?.text || message.chat.type !== "private") return Response.json({ ok: true });

  const text = message.text.trim();
  const start = text.match(/^\/start(?:@\w+)?(?:\s+([A-Za-z0-9_-]{20,80}))?$/);
  if (start?.[1]?.startsWith(PHONE_START_PREFIX) && bot === "customer") {
    try {
      await onPhoneCheckStart(start[1].slice(PHONE_START_PREFIX.length), String(message.chat.id));
    } catch (error) {
      // Usually the reply could not be sent (wrong token, the person blocked the bot) or the database was unreachable.
      console.error("Telegram phone check failed at the /start step:", error instanceof Error ? `${error.name}: ${error.message}` : String(error));
    }
    return Response.json({ ok: true });
  }
  if (start?.[1]) {
    await handleStart(update, start[1]);
    return Response.json({ ok: true });
  }
  // A plain /start (or one with a parameter we do not know) used to get no answer at all.
  if (/^\/start(?:@\w+)?(?:\s|$)/.test(text) && (bot === "customer" || bot === "staff")) {
    try {
      await sendWelcome(String(message.chat.id), bot);
    } catch (error) {
      console.error("Telegram welcome failed:", error instanceof Error ? `${error.name}: ${error.message}` : String(error));
    }
    return Response.json({ ok: true });
  }

  if (!adminChatId || String(message.chat.id) !== adminChatId) {
    return Response.json({ ok: true });
  }
  if (/^\/(hisobot|report)(?:@\w+)?$/i.test(text)) {
    await sendTelegramMessage(adminChatId, await buildAdminReport());
    return Response.json({ ok: true });
  }
  const reply = text.match(/^\/reply(?:@\w+)?\s+([A-Z0-9-]{4,80})\s+([\s\S]{1,3000})$/i);
  const replyReference = message.reply_to_message?.text?.match(/(?:^|\n)Javob uchun murojaat: ([A-Z0-9-]{4,80})(?:\n|$)/i)?.[1];
  if (reply) {
    try {
      await handleAdminReply(update, reply[1].toUpperCase(), reply[2].trim(), adminChatId);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return Response.json({ ok: true });
      }
      console.error("Telegram webhook processing failed", error);
      return Response.json({ error: "Xabarni saqlab bo‘lmadi." }, { status: 500 });
    }
    return Response.json({ ok: true });
  }
  if (replyReference) {
    if (text.length > 3000) {
      await sendTelegramMessage(adminChatId, "Javob 3000 belgidan oshmasligi kerak.");
      return Response.json({ ok: true });
    }
    try {
      await handleAdminReply(update, replyReference.toUpperCase(), text, adminChatId);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return Response.json({ ok: true });
      }
      console.error("Telegram webhook reply-button processing failed", error);
      return Response.json({ error: "Javobni saqlab bo‘lmadi." }, { status: 500 });
    }
    return Response.json({ ok: true });
  }
  if (/^\/reply(?:@\w+)?/i.test(text)) {
    await sendTelegramMessage(adminChatId, "Format: <code>/reply MUROJAAT-RAQAMI javob matni</code> (3000 belgigacha).");
  } else {
    await sendTelegramMessage(adminChatId, "Javob berish uchun xabar ostidagi tugmani bosing yoki <code>/reply MUROJAAT-RAQAMI javob matni</code> deb yozing.");
  }
  return Response.json({ ok: true });
}

export async function POST(request: Request) {
  const requested = new URL(request.url).searchParams.get("bot");
  const bot = requested === "staff" ? "staff" : requested === "shop" ? "shop" : "customer";
  return withTelegramBot(bot, () => handleUpdate(request, bot));
}
