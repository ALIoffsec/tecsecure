import { isResponse, requireModuleApi } from "@/lib/auth";
import { canTransition, orderStatusSchema } from "@/lib/orders";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { escapeTelegramHtml, notifyTelegramUser } from "@/lib/telegram";
import { applyOrderStatus, isWholeOrder, shipmentStamp } from "@/lib/order-flow";
import { creditOrderShipments, notifyShopsPaid } from "@/lib/marketplace-server";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireModuleApi("PRODUCTS");
  if (isResponse(actor)) return actor;
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  if (z.object({ paymentStatus: z.literal("PAID") }).safeParse(body).success) {
    const confirmed = await prisma.$transaction(async (tx) => {
      const result = await tx.order.updateMany({ where: { id, OR: [{ paymentStatus: "AWAITING_CONFIRMATION" }, { paymentStatus: "AWAITING_PAYMENT", paymentMethod: "BANK_TRANSFER" }] }, data: { paymentStatus: "PAID" } });
      if (result.count === 0) return false;
      await tx.auditLog.create({ data: { actorId: actor.id, action: "ORDER_PAYMENT_CONFIRMED", entity: "Order", entityId: id } });
      return true;
    });
    if (!confirmed) return Response.json({ error: "Bu buyurtmada tasdiqlanadigan to‘lov yo‘q." }, { status: 409 });
    // Shops waiting for the money can now ship; parts already delivered are credited.
    await notifyShopsPaid(id);
    await creditOrderShipments(id, actor.id);
    return Response.json({ ok: true });
  }
  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Holat noto‘g‘ri." }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id }, select: { id: true, status: true, customerId: true, reference: true, paymentMethod: true, paymentStatus: true, totalMinor: true } });
  if (!order) return Response.json({ error: "Buyurtma topilmadi." }, { status: 404 });
  if (!canTransition(order.status, parsed.data.status)) {
    return Response.json({ error: "Bu holatga o‘tish mumkin emas." }, { status: 409 });
  }

  // Conditional update guards against two staff members racing on the same order.
  const updated = await prisma.$transaction(async (tx) => {
    const done = await applyOrderStatus(tx, order, parsed.data.status, actor.id, parsed.data.note || null);
    if (!done) return false;
    // An order of one shop's goods is that shop's part; staff moving it moves the part too.
    const parts = await tx.shopOrder.findMany({ where: { orderId: id, status: { notIn: ["DELIVERED", "CANCELLED"] } }, select: { id: true, shopId: true } });
    if (parts.length === 1 && parsed.data.status !== "CANCELLED" && await isWholeOrder(tx, id, parts[0].shopId)) {
      await tx.shopOrder.update({ where: { id: parts[0].id }, data: { status: parsed.data.status, ...shipmentStamp(parsed.data.status) } });
    }
    return true;
  });
  if (!updated) return Response.json({ error: "Buyurtma holati allaqachon o‘zgargan." }, { status: 409 });
  await notifyTelegramUser(
    order.customerId,
    `<b>Tecsecure: buyurtma holati yangilandi</b>\nRaqam: <code>${escapeTelegramHtml(order.reference)}</code>\nYangi holat: ${escapeTelegramHtml(parsed.data.status)}${parsed.data.note ? `\nIzoh: ${escapeTelegramHtml(parsed.data.note)}` : ""}`
  );
  await creditOrderShipments(id, actor.id);
  return Response.json({ ok: true });
}
