import { randomBytes } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") {
    return Response.json({ error: "Mijoz hisobiga kirish talab qilinadi." }, { status: 401 });
  }
  const botUsername = process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, "");
  if (!botUsername || !process.env.TELEGRAM_BOT_TOKEN) {
    return Response.json({ error: "Telegram bot hali sozlanmagan." }, { status: 503 });
  }
  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.user.update({
    where: { id: user.id },
    data: { telegramLinkToken: token, telegramLinkExpiresAt: expiresAt }
  });
  return Response.json({
    link: `https://t.me/${botUsername}?start=${token}`,
    expiresAt
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") {
    return Response.json({ error: "Mijoz hisobiga kirish talab qilinadi." }, { status: 401 });
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { telegramChatId: null, telegramLinkToken: null, telegramLinkExpiresAt: null }
  });
  return Response.json({ ok: true });
}
