import { randomBytes } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { getTelegramCredentials } from "@/lib/integration-credentials";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  }
  let botUsername: string;
  let botToken: string;
  try {
    const credentials = await getTelegramCredentials();
    const staff = user.role !== "CUSTOMER" && Boolean(credentials.staffBotToken);
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
  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.user.update({
    where: { id: user.id },
    data: { telegramLinkToken: token, telegramLinkExpiresAt: expiresAt }
  });
  return Response.json({
    link: `https://t.me/${normalizedBotUsername}?start=${token}`,
    expiresAt
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { telegramChatId: true } });
  return Response.json({ linked: Boolean(account?.telegramChatId) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { telegramChatId: null, telegramLinkToken: null, telegramLinkExpiresAt: null }
  });
  return Response.json({ ok: true });
}
