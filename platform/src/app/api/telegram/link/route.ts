import { randomBytes } from "node:crypto";
import { endOtherSessions, getCurrentUser } from "@/lib/auth";
import { getTelegramCredentials } from "@/lib/integration-credentials";
import { prisma } from "@/lib/prisma";
import { otherSignInWays, reauthRequired, requireReauth, spendReauth } from "@/lib/reauth";
import { sendTelegramMessage, withTelegramBot } from "@/lib/telegram";

export const runtime = "nodejs";

const noStore = { "Cache-Control": "private, no-store" };
const isStaff = (role: string) => role !== "CUSTOMER";

/**
 * A one-time bot link, valid ten minutes. Opening it does not link anything yet: the bot names the account
 * and asks "link this Telegram?", and only the "Yes" button links it.
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  }
  let botUsername: string;
  let botToken: string;
  try {
    const credentials = await getTelegramCredentials();
    const staff = isStaff(user.role) && Boolean(credentials.staffBotToken);
    botUsername = staff ? credentials.staffBotUsername : credentials.botUsername;
    botToken = staff ? credentials.staffBotToken : credentials.botToken;
  } catch (error) {
    console.error("Telegram linking configuration unavailable", error instanceof Error ? error.name : "UnknownError");
    return Response.json({ error: "Telegram sozlamalarini o‘qib bo‘lmadi." }, { status: 503 });
  }
  const normalizedBotUsername = botUsername.replace(/^@/, "");
  if (!normalizedBotUsername || !botToken) {
    return Response.json({ error: "Telegram bot hali sozlanmagan." }, { status: 503 });
  }
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { telegramChatId: true } });
  if (account?.telegramChatId) return Response.json({ error: "Avval ulangan Telegram’ni uzing.", code: "ALREADY_LINKED" }, { status: 409 });
  const confirmed = await requireReauth(user, "TELEGRAM_LINK");
  if (confirmed instanceof Response) return confirmed;
  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.user.update({
    where: { id: user.id },
    data: { telegramLinkToken: token, telegramLinkExpiresAt: expiresAt }
  });
  return Response.json({
    link: `https://t.me/${normalizedBotUsername}?start=${token}`,
    expiresAt
  }, { headers: noStore });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { telegramChatId: true } });
  return Response.json({ linked: Boolean(account?.telegramChatId) }, { headers: noStore });
}

/** Unlinks Telegram after a confirmation, and never the last way a customer can sign in. */
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  }
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { telegramChatId: true } });
  if (!account?.telegramChatId) return Response.json({ ok: true });
  const lastWay = Response.json({ error: "Avval boshqa kirish usulini qo‘shing.", code: "LAST_SIGN_IN" }, { status: 409 });
  const ways = isStaff(user.role) ? null : await otherSignInWays(user.id);
  if (ways && !ways.possible) return lastWay;
  const method = await spendReauth(user, "TELEGRAM_UNLINK");
  if (!method) return reauthRequired("TELEGRAM_UNLINK");
  if (ways && !ways.withMethod(method)) return lastWay;

  const chatId = account.telegramChatId;
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { telegramChatId: null, telegramLinkToken: null, telegramLinkExpiresAt: null } }),
    prisma.auditLog.create({ data: { actorId: user.id, action: "TELEGRAM_UNLINKED", entity: "User", entityId: user.id } })
  ]);
  await endOtherSessions(user.id);
  // The chat that was linked hears about it; a failed message does not undo the change.
  await withTelegramBot(isStaff(user.role) ? "staff" : "customer", () => sendTelegramMessage(chatId, "🔐 <b>Tecsecure</b>\nBu Telegram hisobingizdan uzildi. Buni siz qilmagan bo‘lsangiz, darhol parolni o‘zgartiring va biz bilan bog‘laning."))
    .catch(() => undefined);
  return Response.json({ ok: true });
}
