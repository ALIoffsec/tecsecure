import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, tooManyAttempts } from "@/lib/rate-limit";
import { canAskToCancel } from "@/lib/customer-orders";
import { canDispute } from "@/lib/marketplace";
import { escapeTelegramHtml, notifyTelegramAdmins } from "@/lib/telegram";

export const runtime = "nodejs";

const bodySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("PROBLEM"), message: z.string().trim().min(5).max(1000) }),
  z.object({ kind: z.literal("CANCEL_REQUEST"), message: z.string().trim().max(300).optional() })
]);

const sources = { PROBLEM: "ORDER_PROBLEM", CANCEL_REQUEST: "ORDER_CANCEL_REQUEST" } as const;

/**
 * The buyer writes to staff about an order: a problem with Tecsecure's own goods, or a request to cancel an
 * accepted order. Each kind is one conversation per order; asking again adds a message to it. The order
 * itself is not changed here: staff cancel it with their own buttons.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Hisobga kiring." }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Muammoni kamida 5 belgida yozing." }, { status: 400 });
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, reference: true, status: true, paymentMethod: true, paymentStatus: true, customerId: true, recipientName: true, phone: true, items: { select: { shopId: true } }, shipments: { select: { status: true, creditedAt: true, disputedAt: true, disputeResolvedAt: true } } }
  });
  if (!order || order.customerId !== user.id) return Response.json({ error: "Buyurtma topilmadi." }, { status: 404 });
  const sourceType = sources[parsed.data.kind];
  if (parsed.data.kind === "CANCEL_REQUEST") {
    const asked = await prisma.portalConversation.count({ where: { sourceType, sourceId: id } });
    if (!canAskToCancel(order, order.shipments, asked > 0)) return Response.json({ error: "Bu buyurtmani hozir bekor qilishni so‘rab bo‘lmaydi.", code: "NOT_ALLOWED" }, { status: 409 });
  } else if (!order.items.some(item => item.shopId === null) && order.status !== "CANCELLED" && order.shipments.some(part => canDispute(part))) {
    // A shop's parcel that can be disputed has its own "problem" button, which holds the shop's money.
    return Response.json({ error: "Do‘kon jo‘natmasi bo‘yicha muammoni o‘sha jo‘natma ostida yozing.", code: "SHOP_PART" }, { status: 409 });
  }
  const limit = await rateLimit("order-contact", user.id, 5, 60 * 60 * 1000);
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSeconds);
  const body = parsed.data.message?.trim() || "Mijoz buyurtmani bekor qilishni so‘radi.";
  const subject = parsed.data.kind === "PROBLEM" ? "Buyurtma bo‘yicha muammo" : "Buyurtmani bekor qilish so‘rovi";
  const reference = `${order.reference}-${parsed.data.kind === "PROBLEM" ? "M" : "B"}`;
  const write = () => prisma.portalConversation.upsert({
    where: { sourceType_sourceId: { sourceType, sourceId: id } },
    create: { reference, category: "ORDER", sourceType, sourceId: id, subject, customerName: user.name, customerPhone: order.phone, customerId: user.id, messages: { create: { sender: "CUSTOMER", body } } },
    update: { messages: { create: { sender: "CUSTOMER", body } } },
    select: { reference: true }
  });
  let conversation: { reference: string };
  try {
    conversation = await write();
  } catch (error) {
    // Two taps at once: the second finds the conversation the first created.
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
    conversation = await write();
  }
  await notifyTelegramAdmins([
    `<b>${parsed.data.kind === "PROBLEM" ? "⚠️ Buyurtma bo‘yicha muammo" : "↩️ Bekor qilish so‘rovi"}</b>`,
    `Buyurtma <code>${escapeTelegramHtml(order.reference)}</code> · ${escapeTelegramHtml(user.name)}`,
    "",
    escapeTelegramHtml(body),
    "",
    `Javob: <code>/reply ${escapeTelegramHtml(conversation.reference)} matn</code>`
  ].join("\n"), order.reference);
  return Response.json({ ok: true });
}
