import { prisma } from "@/lib/prisma";

type TelegramResponse = {
  ok: boolean;
  description?: string;
  result?: { message_id?: number };
};

export function escapeTelegramHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true })
  });
  const result = await response.json() as TelegramResponse;
  if (!response.ok || !result.ok) {
    throw new Error(`Telegram sendMessage failed: ${result.description ?? response.statusText}`);
  }
}

export async function notifyTelegramAdmins(text: string): Promise<boolean> {
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!process.env.TELEGRAM_BOT_TOKEN || !chatId) {
    console.warn("Telegram admin notification skipped: bot token or admin chat ID is not configured.");
    return false;
  }
  try {
    await sendTelegramMessage(chatId, text);
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
