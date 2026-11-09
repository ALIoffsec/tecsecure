import { AsyncLocalStorage } from "node:async_hooks";
import { prisma } from "@/lib/prisma";
import { getTelegramCredentials } from "@/lib/integration-credentials";

export type TelegramBotName = "customer" | "staff" | "shop";
const activeBot = new AsyncLocalStorage<TelegramBotName>();

/** Everything sent inside `run` goes out through the named bot. */
export function withTelegramBot<T>(bot: TelegramBotName, run: () => Promise<T>): Promise<T> {
  return activeBot.run(bot, run);
}

/**
 * Staff traffic uses the staff bot when one is configured and falls back to the single bot, so the
 * site keeps working with one token until a second is added.
 */
function tokenFor(credentials: { botToken: string; staffBotToken: string; shopBotToken: string; adminChatId: string }, chatId?: string): string {
  if (activeBot.getStore() === "shop") return credentials.shopBotToken || credentials.botToken;
  const wantsStaff = activeBot.getStore() === "staff" || (activeBot.getStore() !== "customer" && chatId !== undefined && chatId === credentials.adminChatId);
  return wantsStaff ? credentials.staffBotToken || credentials.botToken : credentials.botToken;
}

type TelegramResponse<T> = {
  ok: boolean;
  description?: string;
  result?: T;
};
type TelegramInlineKeyboardButton = {
  text: string;
  callback_data?: string;
  url?: string;
  web_app?: { url: string };
};
export type TelegramReplyMarkup =
  | { inline_keyboard: TelegramInlineKeyboardButton[][] }
  | { force_reply: true; input_field_placeholder?: string }
  | { keyboard: { text: string; request_contact?: boolean }[][]; resize_keyboard?: boolean; one_time_keyboard?: boolean }
  | { remove_keyboard: true };
export type TelegramAdminAction = "reply" | "progress" | "done";
export type TelegramAdminMessageStatus = "new" | "in_progress" | "done";
export type TelegramAdminCallback = { action: TelegramAdminAction; reference: string };
export type TelegramWalletCallback = { decision: "APPROVED" | "REJECTED"; id: string };

type TelegramSendOptions = {
  replyMarkup?: TelegramReplyMarkup;
  replyToMessageId?: number;
};

async function callTelegramApi<T>(
  token: string,
  method: string,
  payload: Record<string, unknown>
): Promise<T | undefined> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await response.json() as TelegramResponse<T>;
  if (!response.ok || !result.ok) {
    throw new Error(`Telegram ${method} failed: ${result.description ?? response.statusText}`);
  }
  return result.result;
}

export function getTelegramAdminPanelUrl(): string | undefined {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return undefined;
  try {
    const url = new URL(appUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("Unsupported application URL protocol.");
    }
    return new URL("/admin", url).toString();
  } catch (error) {
    console.error("Telegram admin panel button URL is invalid", error instanceof Error ? error.message : "UnknownError");
    return undefined;
  }
}

export function parseTelegramAdminCallbackData(data: string | undefined): TelegramAdminCallback | null {
  const match = data?.match(/^tc:(reply|progress|done):([A-Z0-9-]{4,80})$/i);
  if (!match) return null;
  return { action: match[1].toLowerCase() as TelegramAdminAction, reference: match[2].toUpperCase() };
}

export function parseTelegramWalletCallbackData(data: string | undefined): TelegramWalletCallback | null {
  const match = data?.match(/^tw:(approve|reject):([a-z0-9]{10,40})$/);
  if (!match) return null;
  return { decision: match[1] === "approve" ? "APPROVED" : "REJECTED", id: match[2] };
}

export function createTelegramWalletKeyboard(id: string, adminUrl: string | undefined): TelegramReplyMarkup {
  return {
    inline_keyboard: [
      [{ text: "✅ Tasdiqlash", callback_data: `tw:approve:${id}` }, { text: "❌ Rad etish", callback_data: `tw:reject:${id}` }],
      ...(adminUrl ? [[{ text: "🌐 Admin panel", url: adminUrl }]] : [])
    ]
  };
}

export function createTelegramAdminKeyboard(
  reference: string,
  adminUrl: string | undefined,
  status: TelegramAdminMessageStatus = "new"
): TelegramReplyMarkup {
  if (!/^[A-Z0-9-]{4,80}$/i.test(reference)) {
    throw new Error("Telegram notification reference has an invalid format.");
  }
  const button = (action: TelegramAdminAction, text: string): TelegramInlineKeyboardButton => {
    const callbackData = `tc:${action}:${reference}`;
    if (Buffer.byteLength(callbackData, "utf8") > 64) {
      throw new Error("Telegram notification reference is too long for an inline button.");
    }
    return { text, callback_data: callbackData };
  };
  const openAdmin: TelegramInlineKeyboardButton[] = adminUrl
    ? [{ text: "🌐 Admin panel", url: adminUrl }]
    : [];

  if (status === "done") {
    return { inline_keyboard: openAdmin.length ? [openAdmin] : [] };
  }
  if (status === "in_progress") {
    return {
      inline_keyboard: [
        [
          button("reply", "✍️ Javob berish"),
          button("done", "✅ Yakunlash")
        ],
        ...openAdmin.map((item) => [item])
      ]
    };
  }
  return {
    inline_keyboard: [
      [
        button("reply", "✍️ Javob berish"),
        button("progress", "🟡 Jarayonda")
      ],
      [
        button("done", "✅ Yakunlash"),
        ...openAdmin
      ]
    ]
  };
}

export function walletDecisionText(transaction: { kind: string; status: string; amountMinor: number }): string {
  const amount = `${Math.round(transaction.amountMinor / 100).toLocaleString("en-US").replaceAll(",", " ")} so‘m`;
  const subject = transaction.kind === "DEPOSIT" ? "Hisobni to‘ldirish arizangiz" : "Pul yechish arizangiz";
  return `<b>Tecsecure hamyoni</b>\n${subject} (${amount}) ${transaction.status === "APPROVED" ? "tasdiqlandi ✅" : "rad etildi ❌"}.`;
}

export function escapeTelegramHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

async function sendWithToken(token: string, chatId: string, text: string, options: TelegramSendOptions = {}): Promise<void> {
  await callTelegramApi(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
    ...(options.replyToMessageId ? { reply_to_message_id: options.replyToMessageId } : {})
  });
}

export async function sendTelegramMessage(chatId: string, text: string, options: TelegramSendOptions = {}): Promise<void> {
  const credentials = await getTelegramCredentials();
  const botToken = tokenFor(credentials, chatId);
  if (!botToken) throw new Error("Telegram bot token is not configured");
  await sendWithToken(botToken, chatId, text, options);
}

export async function answerTelegramCallbackQuery(callbackQueryId: string, text: string): Promise<void> {
  const credentials = await getTelegramCredentials();
  const botToken = tokenFor(credentials, credentials.adminChatId);
  if (!botToken) throw new Error("Telegram bot token is not configured");
  await callTelegramApi(botToken, "answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
    show_alert: false
  });
}

export async function editTelegramAdminMessage(
  chatId: string,
  messageId: number,
  text: string,
  replyMarkup: TelegramReplyMarkup
): Promise<void> {
  const credentials = await getTelegramCredentials();
  const botToken = tokenFor(credentials, chatId);
  if (!botToken) throw new Error("Telegram bot token is not configured");
  await callTelegramApi(botToken, "editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    reply_markup: replyMarkup
  });
}

export async function notifyTelegramAdmins(text: string, reference: string): Promise<boolean> {
  try {
    const credentials = await getTelegramCredentials();
    const { adminChatId } = credentials;
    const botToken = tokenFor(credentials, adminChatId);
    if (!botToken || !adminChatId) {
      console.warn("Telegram admin notification skipped: bot token or admin chat ID is not configured.");
      return false;
    }
    await sendWithToken(botToken, adminChatId, text, {
      replyMarkup: createTelegramAdminKeyboard(reference, getTelegramAdminPanelUrl())
    });
    return true;
  } catch (error) {
    console.error("Telegram admin notification failed", error);
    return false;
  }
}

/** Sends a payment proof image with the request details as its caption, falling back to plain text. */
export async function notifyTelegramAdminsWithProof(
  text: string,
  proof: { data: Uint8Array; mimeType: string; name: string } | null,
  replyMarkup: TelegramReplyMarkup
): Promise<boolean> {
  try {
    const credentials = await getTelegramCredentials();
    const { adminChatId } = credentials;
    const botToken = tokenFor(credentials, adminChatId);
    if (!botToken || !adminChatId) {
      console.warn("Telegram admin notification skipped: bot token or admin chat ID is not configured.");
      return false;
    }
    if (proof) {
      try {
        const form = new FormData();
        form.set("chat_id", adminChatId);
        form.set("caption", text.slice(0, 1024));
        form.set("parse_mode", "HTML");
        form.set("reply_markup", JSON.stringify(replyMarkup));
        form.set("photo", new Blob([Buffer.from(proof.data)], { type: proof.mimeType }), proof.name || "proof.jpg");
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, { method: "POST", body: form });
        const result = await response.json() as TelegramResponse<unknown>;
        if (response.ok && result.ok) return true;
        console.error("Telegram proof photo was refused", result.description ?? response.statusText);
      } catch (error) {
        console.error("Telegram proof photo failed", error);
      }
    }
    await sendWithToken(botToken, adminChatId, text, { replyMarkup });
    return true;
  } catch (error) {
    console.error("Telegram admin notification failed", error);
    return false;
  }
}

export async function notifyTelegramUser(userId: string, text: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { telegramChatId: true } });
    if (!user?.telegramChatId) return false;
    // Customers always hear from the customer bot, even when a staff button triggered the message.
    await withTelegramBot("customer", () => sendTelegramMessage(user.telegramChatId as string, text));
    return true;
  } catch (error) {
    console.error("Telegram customer notification failed", error);
    return false;
  }
}

export type TelegramConnection = { botName: string; staffBotName: string; messageSent: true; webhook: "connected" | "needs-https" | "needs-secret" };

async function connectOneBot(token: string, secret: string, appUrl: string, botParam: string, menuPath: string, commands: { command: string; description: string }[]) {
  await callTelegramApi(token, "setWebhook", { url: new URL(`/api/telegram/webhook${botParam}`, appUrl).toString(), secret_token: secret, allowed_updates: ["message", "callback_query"] });
  await callTelegramApi(token, "setMyCommands", { commands });
  await callTelegramApi(token, "setChatMenuButton", { menu_button: { type: "web_app", text: "Tecsecure", web_app: { url: new URL(menuPath, appUrl).toString() } } });
}

/** Proves the saved credentials work end to end, then points Telegram's buttons and Mini Apps at this site. */
export async function connectTelegramBot(): Promise<TelegramConnection> {
  const { botToken, adminChatId, webhookSecret, staffBotToken, staffWebhookSecret, shopBotToken, shopWebhookSecret } = await getTelegramCredentials();
  if (!botToken || !adminChatId) throw new Error("Bot token va admin chat ID kiritilmagan.");
  const adminToken = staffBotToken || botToken;
  const me = await callTelegramApi<{ username?: string }>(botToken, "getMe", {});
  const staffMe = staffBotToken ? await callTelegramApi<{ username?: string }>(staffBotToken, "getMe", {}) : me;
  await sendWithToken(adminToken, adminChatId, "✅ <b>Tecsecure boti ulandi.</b>\nYangi buyurtma va arizalar shu chatga keladi. Hisobot uchun: /hisobot");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  let webhook: TelegramConnection["webhook"] = "needs-https";
  if (appUrl.startsWith("https://")) {
    if (webhookSecret && (!staffBotToken || staffWebhookSecret) && (!shopBotToken || shopWebhookSecret)) {
      await connectOneBot(botToken, webhookSecret, appUrl, "", "/tg", [{ command: "start", description: "Tecsecure'ni ochish" }]);
      if (staffBotToken) await connectOneBot(staffBotToken, staffWebhookSecret, appUrl, "?bot=staff", "/tg/staff", [{ command: "hisobot", description: "Bugungi hisobot" }]);
      if (shopBotToken) await connectOneBot(shopBotToken, shopWebhookSecret, appUrl, "?bot=shop", "/tg/shop", [{ command: "start", description: "Do'kon kabinetini ochish" }]);
      webhook = "connected";
    } else {
      webhook = "needs-secret";
    }
  }
  return { botName: me?.username ?? "", staffBotName: staffMe?.username ?? "", messageSent: true, webhook };
}
