import { z } from "zod";
import { isResponse, requireOperationsApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MESSAGE_MAX, STAFF_SENDER, afterMessage } from "@/lib/conversations";
import { escapeTelegramHtml, sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";

const bodySchema = z.union([
  z.object({ message: z.string().trim().min(1).max(MESSAGE_MAX) }),
  z.object({ status: z.enum(["OPEN", "CLOSED"]) })
]);

/** Staff answer a conversation from the inbox (the customer is told in the cabinet and on Telegram), or close and reopen it. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireOperationsApi();
  if (isResponse(actor)) return actor;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Xabar 1–3000 belgi bo‘lishi kerak." }, { status: 400 });
  const { id } = await params;
  const conversation = await prisma.portalConversation.findUnique({ where: { id }, select: { id: true, reference: true, customerId: true, customer: { select: { telegramChatId: true, deletedAt: true } } } });
  if (!conversation) return Response.json({ error: "Suhbat topilmadi." }, { status: 404 });
  if ("status" in parsed.data) {
    await prisma.$transaction([
      prisma.portalConversation.update({ where: { id }, data: { status: parsed.data.status } }),
      prisma.auditLog.create({ data: { actorId: actor.id, action: `CONVERSATION_${parsed.data.status}`, entity: "PortalConversation", entityId: id } })
    ]);
    return Response.json({ ok: true });
  }
  const body = parsed.data.message;
  await prisma.$transaction(async (tx) => {
    await tx.portalMessage.create({ data: { conversationId: id, sender: STAFF_SENDER, body } });
    await tx.portalConversation.update({ where: { id }, data: afterMessage(STAFF_SENDER) });
    if (conversation.customerId) {
      await tx.notification.create({ data: { userId: conversation.customerId, channel: "IN_APP", event: "SUPPORT_MESSAGE_RECEIVED", status: "UNREAD", payload: { reference: conversation.reference } } });
    }
    await tx.auditLog.create({ data: { actorId: actor.id, action: "CONVERSATION_REPLIED", entity: "PortalConversation", entityId: id } });
  });
  const chatId = conversation.customer && !conversation.customer.deletedAt ? conversation.customer.telegramChatId : null;
  if (chatId) await sendTelegramMessage(chatId, `<b>Tecsecure javobi</b> · <code>${escapeTelegramHtml(conversation.reference)}</code>\n\n${escapeTelegramHtml(body)}`).catch(() => undefined);
  return Response.json({ ok: true });
}
