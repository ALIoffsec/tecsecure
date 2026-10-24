import { isResponse, requireModuleApi } from "@/lib/auth";
import { canTransition, orderStatusSchema } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

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
  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Holat noto‘g‘ri." }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id }, select: { id: true, status: true, customerId: true, reference: true } });
  if (!order) return Response.json({ error: "Buyurtma topilmadi." }, { status: 404 });
  if (!canTransition(order.status, parsed.data.status)) {
    return Response.json({ error: "Bu holatga o‘tish mumkin emas." }, { status: 409 });
  }

  // Conditional update guards against two staff members racing on the same order.
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.order.updateMany({ where: { id, status: order.status }, data: { status: parsed.data.status } });
    if (result.count === 0) return false;
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
  return Response.json({ ok: true });
}
