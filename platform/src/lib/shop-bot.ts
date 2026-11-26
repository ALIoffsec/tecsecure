import { prisma } from "./prisma";
import { answerTelegramCallbackQuery, escapeTelegramHtml, sendTelegramMessage, withTelegramBot, type TelegramReplyMarkup } from "./telegram";
import { moveShopPart } from "./shop-orders-server";
import { formatMinor } from "./format";
import { releaseDueCredits, shopAppUrl } from "./marketplace-server";

/**
 * The shop bot: a short summary on /start, the orders waiting on /buyurtmalar, the balance on /balans,
 * and the "accept" button under new-order messages. Everything else lives in the Mini App.
 */
type ShopUpdate = {
  message?: { chat: { id: number; type: string }; text?: string };
  callback_query?: { id: string; from: { id: number }; data?: string };
};

const openButton = (label: string, screen?: string): TelegramReplyMarkup | undefined => {
  const url = shopAppUrl(screen);
  return url ? { inline_keyboard: [[{ text: label, web_app: { url } }]] } : undefined;
};

async function shopOf(telegramId: number) {
  const find = () => prisma.user.findFirst({
    where: { telegramChatId: String(telegramId), active: true, deletedAt: null, role: "CUSTOMER" },
    select: { id: true, shop: { select: { id: true, name: true, status: true, balanceMinor: true } } }
  });
  const owner = await find();
  // Money whose hold has passed lands before the bot quotes the balance.
  if (owner?.shop?.status === "ACTIVE" && await releaseDueCredits(owner.shop.id)) return find();
  return owner;
}

const waitingStatuses = ["NEW", "CONFIRMED", "PREPARING"] as const;

export async function handleShopBotUpdate(update: ShopUpdate): Promise<void> {
  if (update.callback_query) {
    await withTelegramBot("shop", () => handleCallback(update.callback_query!));
    return;
  }
  const message = update.message;
  if (!message || message.chat.type !== "private") return;
  const chatId = String(message.chat.id);
  const text = (message.text ?? "").trim().toLowerCase();
  const owner = await shopOf(message.chat.id);
  const shop = owner?.shop;
  const send = (body: string, markup?: TelegramReplyMarkup) => withTelegramBot("shop", () => sendTelegramMessage(chatId, body, markup ? { replyMarkup: markup } : {}));

  if (!shop) {
    await send([
      "<b>Tecsecure do‘konlar boti</b>",
      "Mahsulotlaringizni Tecsecure’da o‘z do‘koningiz nomi bilan soting: mahsulot qo‘shasiz, buyurtmani o‘zingiz jo‘natasiz, pul balansingizga tushadi.",
      "Boshlash uchun kabinetni oching va ariza yuboring."
    ].join("\n"), openButton("Do‘kon kabinetini ochish"));
    return;
  }
  if (shop.status !== "ACTIVE") {
    const words: Record<string, string> = { PENDING: "Arizangiz ko‘rib chiqilmoqda.", REJECTED: "Ariza rad etilgan — sababini kabinetda ko‘ring.", SUSPENDED: "Do‘kon vaqtincha to‘xtatilgan." };
    await send(`<b>${escapeTelegramHtml(shop.name)}</b>\n${words[shop.status] ?? ""}`, openButton("Kabinetni ochish"));
    return;
  }
  if (text.startsWith("/balans")) {
    await send(`<b>Balans: ${escapeTelegramHtml(formatMinor(shop.balanceMinor, "UZS"))}</b>\nYetkazilgan va to‘langan buyurtmalardan komissiya ayirib yoziladi. Pul yechish — kabinetning “Balans” bo‘limida.`, openButton("Balansni ochish", "balance"));
    return;
  }
  if (text.startsWith("/buyurtmalar") || text.startsWith("/orders")) {
    const parts = await prisma.shopOrder.findMany({
      where: { shopId: shop.id, status: { in: [...waitingStatuses] } },
      orderBy: { createdAt: "asc" }, take: 10,
      select: { status: true, payoutMinor: true, order: { select: { id: true, reference: true, paymentStatus: true } } }
    });
    if (!parts.length) { await send("Kutayotgan buyurtma yo‘q. Yangisi kelsa, shu yerga xabar keladi."); return; }
    const words: Record<string, string> = { NEW: "yangi", CONFIRMED: "qabul qilingan", PREPARING: "tayyorlanmoqda" };
    await send([
      `<b>Kutayotgan buyurtmalar: ${parts.length}</b>`,
      ...parts.map(part => `• <code>${escapeTelegramHtml(part.order.reference)}</code> — ${words[part.status]}${part.order.paymentStatus !== "PAID" ? " (to‘lov kutilmoqda)" : ""}${part.payoutMinor !== null ? ` · ${escapeTelegramHtml(formatMinor(part.payoutMinor, "UZS"))}` : ""}`)
    ].join("\n"), openButton("Buyurtmalarni ochish", "orders"));
    return;
  }
  const waiting = await prisma.shopOrder.count({ where: { shopId: shop.id, status: { in: [...waitingStatuses] } } });
  await send([
    `<b>${escapeTelegramHtml(shop.name)}</b>`,
    `Kutayotgan buyurtmalar: <b>${waiting}</b>`,
    `Balans: <b>${escapeTelegramHtml(formatMinor(shop.balanceMinor, "UZS"))}</b>`,
    "",
    "/buyurtmalar — kutayotgan buyurtmalar",
    "/balans — balans va pul yechish"
  ].join("\n"), openButton("Kabinetni ochish"));
}

async function handleCallback(query: NonNullable<ShopUpdate["callback_query"]>): Promise<void> {
  const [prefix, action, orderId] = (query.data ?? "").split(":");
  if (prefix !== "so" || action !== "confirm" || !orderId) { await answerTelegramCallbackQuery(query.id, "Noma’lum tugma."); return; }
  const owner = await shopOf(query.from.id);
  if (!owner?.shop || owner.shop.status !== "ACTIVE") { await answerTelegramCallbackQuery(query.id, "Bu Telegram do‘kon hisobiga ulanmagan."); return; }
  const result = await moveShopPart(owner.shop.id, orderId, "CONFIRMED", null, owner.id);
  await answerTelegramCallbackQuery(query.id, result.ok ? "Qabul qilindi. Endi tayyorlab jo‘nating." : result.error.slice(0, 190));
}
