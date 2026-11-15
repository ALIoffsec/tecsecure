import type { OrderStatus, Prisma } from "@prisma/client";
import { restoreStock } from "./marketplace-server";

type Tx = Prisma.TransactionClient;

export type OrderForStatus = { id: string; status: OrderStatus; customerId: string; reference: string; paymentMethod: string; paymentStatus: string; totalMinor: number | null };

const stamp: Partial<Record<OrderStatus, "confirmedAt" | "shippedAt" | "deliveredAt" | "cancelledAt">> = {
  CONFIRMED: "confirmedAt", SHIPPED: "shippedAt", DELIVERED: "deliveredAt", CANCELLED: "cancelledAt"
};

/** Puts money back on the buyer's wallet with its own ledger line (kind ORDER_REFUND, the order's reference). */
export async function refundToWallet(tx: Tx, order: Pick<OrderForStatus, "customerId" | "reference">, amountMinor: number, actorId: string | null, details: string | null): Promise<void> {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) return;
  await tx.user.update({ where: { id: order.customerId }, data: { walletBalanceMinor: { increment: amountMinor } } });
  await tx.walletTransaction.create({
    data: { userId: order.customerId, kind: "ORDER_REFUND", status: "APPROVED", amountMinor, reference: order.reference, details, reviewedById: actorId, reviewedAt: new Date() }
  });
}

/**
 * What a cancelled wallet order still owes the buyer: the total, less what was already refunded for parts
 * a shop cancelled, less shop parts that were delivered (the buyer has those goods and the shop its money).
 */
export async function walletRefundDue(tx: Tx, order: OrderForStatus): Promise<{ amountMinor: number; deliveredMinor: number }> {
  const [refunded, delivered] = await Promise.all([
    tx.walletTransaction.aggregate({ where: { userId: order.customerId, kind: "ORDER_REFUND", reference: order.reference }, _sum: { amountMinor: true } }),
    tx.shopOrder.findMany({ where: { orderId: order.id, status: "DELIVERED" }, select: { itemsTotalMinor: true, deliveryShareMinor: true } })
  ]);
  const deliveredMinor = delivered.reduce((sum, part) => sum + (part.itemsTotalMinor ?? 0) + (part.deliveryShareMinor ?? 0), 0);
  return { amountMinor: Math.max(0, (order.totalMinor ?? 0) - (refunded._sum.amountMinor ?? 0) - deliveredMinor), deliveredMinor };
}

/** The timestamp a shop part records when it reaches a status. */
export function shipmentStamp(to: OrderStatus): Record<string, Date> {
  const field = stamp[to];
  return field ? { [field]: new Date() } : {};
}

/**
 * Moves a whole order to a new status with everything that goes with it: payment on delivery, the wallet
 * refund or "refund due" on cancel, stock returned, shop parts cancelled, history, notice and audit.
 * Returns false when someone else changed the order first. The caller has checked the transition.
 */
export async function applyOrderStatus(tx: Tx, order: OrderForStatus, to: OrderStatus, actorId: string | null, note: string | null): Promise<boolean> {
  const result = await tx.order.updateMany({ where: { id: order.id, status: order.status }, data: { status: to } });
  if (result.count === 0) return false;
  if (to === "DELIVERED" && order.paymentStatus === "PENDING") {
    await tx.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID" } });
  }
  if (to === "CANCELLED") {
    if (order.paymentMethod === "WALLET" && order.paymentStatus === "PAID" && order.totalMinor !== null) {
      const due = await walletRefundDue(tx, order);
      await refundToWallet(tx, order, due.amountMinor, actorId, due.deliveredMinor ? "Yetkazilgan do‘kon qismlari qaytarilmadi" : null);
      // With delivered shop parts kept, the order stays paid for those goods.
      if (due.deliveredMinor === 0) await tx.order.update({ where: { id: order.id }, data: { paymentStatus: "REFUNDED" } });
    } else if (order.paymentStatus === "PAID") {
      // Money that came from outside the wallet has to be returned by hand, so the order must say so.
      await tx.order.update({ where: { id: order.id }, data: { paymentStatus: "REFUND_DUE" } });
    }
    // Lines of parts that were still open give their stock back; delivered parts keep theirs.
    const open = await tx.shopOrder.findMany({ where: { orderId: order.id, status: { notIn: ["DELIVERED", "CANCELLED"] } }, select: { shopId: true } });
    const items = await tx.orderItem.findMany({ where: { orderId: order.id }, select: { productId: true, quantity: true, shopId: true } });
    const openShops = new Set(open.map(part => part.shopId));
    await restoreStock(tx, items.filter(item => item.shopId === null || openShops.has(item.shopId)));
    await tx.shopOrder.updateMany({ where: { orderId: order.id, status: { notIn: ["DELIVERED", "CANCELLED"] } }, data: { status: "CANCELLED", cancelledAt: new Date() } });
  }
  await tx.orderStatusHistory.create({ data: { orderId: order.id, fromStatus: order.status, toStatus: to, note, actorId } });
  await tx.notification.create({
    data: { userId: order.customerId, channel: "IN_APP", event: "ORDER_STATUS_CHANGED", status: "DELIVERED", payload: { reference: order.reference, orderId: order.id, status: to } }
  });
  if (actorId) {
    await tx.auditLog.create({ data: { actorId, action: "ORDER_STATUS_CHANGED", entity: "Order", entityId: order.id, metadata: { from: order.status, to } } });
  }
  return true;
}

/** True when every line of the order belongs to this one shop, so its part is the whole order. */
export async function isWholeOrder(tx: Tx, orderId: string, shopId: string): Promise<boolean> {
  const others = await tx.orderItem.count({ where: { orderId, OR: [{ shopId: null }, { shopId: { not: shopId } }] } });
  return others === 0;
}
