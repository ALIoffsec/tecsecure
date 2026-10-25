import { prisma } from "@/lib/prisma";
import { getTelegramCredentials } from "@/lib/integration-credentials";

type TelegramResponse<T> = {
  ok: boolean;
  description?: string;
  result?: T;
};
type TelegramInlineKeyboardButton = {
  text: string;
  callback_data?: string;
  url?: string;
};
export type TelegramReplyMarkup =
  | { inline_keyboard: TelegramInlineKeyboardButton[][] }
  | { force_reply: true; input_field_placeholder?: string };
export type TelegramAdminAction = "reply" | "progress" | "done";
export type TelegramAdminMessageStatus = "new" | "in_progress" | "done";
export type TelegramAdminCallback = { action: TelegramAdminAction; reference: string };

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
  const { botToken } = await getTelegramCredentials();
  if (!botToken) throw new Error("Telegram bot token is not configured");
  await sendWithToken(botToken, chatId, text, options);
}

export async function answerTelegramCallbackQuery(callbackQueryId: string, text: string): Promise<void> {
  const { botToken } = await getTelegramCredentials();
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
  const { botToken } = await getTelegramCredentials();
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
    const { botToken, adminChatId } = await getTelegramCredentials();
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

export async function notifyTelegramUser(userId: string, text: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { telegramChatId: true } });
    if (!user?.telegramChatId) return false;
    await sendTelegramMessage(user.telegramChatId, text);
    return true;
  } catch (error) {
    console.error("Telegram customer notification failed", error);
    return false;
  }
}
