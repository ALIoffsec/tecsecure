import { isResponse, requireModuleApi } from "@/lib/auth";
import { canTransition, orderStatusSchema } from "@/lib/orders";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { escapeTelegramHtml, notifyTelegramUser } from "@/lib/telegram";

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
    const result = await tx.order.updateMany({ where: { id, status: order.status }, data: { status: parsed.data.status } });
    if (result.count === 0) return false;
    if (parsed.data.status === "DELIVERED" && order.paymentStatus === "PENDING") {
      await tx.order.update({ where: { id }, data: { paymentStatus: "PAID" } });
    }
    if (parsed.data.status === "CANCELLED" && order.paymentMethod === "WALLET" && order.paymentStatus === "PAID" && order.totalMinor !== null) {
      await tx.user.update({ where: { id: order.customerId }, data: { walletBalanceMinor: { increment: order.totalMinor } } });
      await tx.walletTransaction.create({
        data: { userId: order.customerId, kind: "ORDER_REFUND", status: "APPROVED", amountMinor: order.totalMinor, reference: order.reference, reviewedById: actor.id, reviewedAt: new Date() }
      });
      await tx.order.update({ where: { id }, data: { paymentStatus: "REFUNDED" } });
    } else if (parsed.data.status === "CANCELLED" && order.paymentStatus === "PAID") {
      // Money that came from outside the wallet has to be returned by hand, so the order must say so.
      await tx.order.update({ where: { id }, data: { paymentStatus: "REFUND_DUE" } });
    }
    await tx.orderStatusHistory.create({
      data: { orderId: id, fromStatus: order.status, toStatus: parsed.data.status, note: parsed.data.note || null, actorId: actor.id }
    });
    await tx.notification.create({
      data: {
        userId: order.customerId,
        channel: "IN_APP",
        event: "ORDER_STATUS_CHANGED",
        status: "DELIVERED",
        payload: { reference: order.reference, orderId: id, status: parsed.data.status }
      }
    });
    await tx.auditLog.create({
      data: { actorId: actor.id, action: "ORDER_STATUS_CHANGED", entity: "Order", entityId: id, metadata: { from: order.status, to: parsed.data.status } }
    });
    return true;
  });
  if (!updated) return Response.json({ error: "Buyurtma holati allaqachon o‘zgargan." }, { status: 409 });
  await notifyTelegramUser(
    order.customerId,
    `<b>Tecsecure: buyurtma holati yangilandi</b>\nRaqam: <code>${escapeTelegramHtml(order.reference)}</code>\nYangi holat: ${escapeTelegramHtml(parsed.data.status)}${parsed.data.note ? `\nIzoh: ${escapeTelegramHtml(parsed.data.note)}` : ""}`
  );
  return Response.json({ ok: true });
}
