import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, tooManyAttempts } from "@/lib/rate-limit";
import { CUSTOMER_SENDER, MESSAGE_MAX, afterMessage } from "@/lib/conversations";
import { escapeTelegramHtml, notifyTelegramAdmins } from "@/lib/telegram";

export const runtime = "nodejs";

const bodySchema = z.object({ message: z.string().trim().min(1).max(MESSAGE_MAX) });

/** The customer writes again in one of their own conversations. Someone else's looks like one that does not exist. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Xabar 1–3000 belgi bo‘lishi kerak." }, { status: 400 });
  const { id } = await params;
  const conversation = await prisma.portalConversation.findFirst({ where: { id, customerId: user.id }, select: { id: true, reference: true } });
  if (!conversation) return Response.json({ error: "Suhbat topilmadi." }, { status: 404 });
  const limit = await rateLimit("portal-reply", user.id, 30, 60 * 60 * 1000);
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSeconds);
  await prisma.$transaction([
    prisma.portalMessage.create({ data: { conversationId: id, sender: CUSTOMER_SENDER, body: parsed.data.message } }),
    prisma.portalConversation.update({ where: { id }, data: afterMessage(CUSTOMER_SENDER) })
  ]);
  await notifyTelegramAdmins(`<b>💬 Mijoz yozdi</b> · <code>${escapeTelegramHtml(conversation.reference)}</code>\n${escapeTelegramHtml(user.name)}\n\n${escapeTelegramHtml(parsed.data.message)}\n\nJavob: <code>/reply ${escapeTelegramHtml(conversation.reference)} matn</code>`, conversation.reference);
  return Response.json({ ok: true }, { status: 201 });
}

/** The customer opened their messages: staff replies so far count as read. */
export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  const { id } = await params;
  const updated = await prisma.portalConversation.updateMany({ where: { id, customerId: user.id }, data: { customerReadAt: new Date() } });
  return updated.count ? Response.json({ ok: true }) : Response.json({ error: "Suhbat topilmadi." }, { status: 404 });
}
