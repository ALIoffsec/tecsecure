import type { OrderStatus } from "@prisma/client";
import { prisma } from "./prisma";
import { canTransition, type OrderStatusValue } from "./orders";
import { applyOrderStatus, isWholeOrder, shipmentStamp } from "./order-flow";
import { creditOrderShipments, restoreStock } from "./marketplace-server";
import { escapeTelegramHtml, notifyTelegramAdmins, notifyTelegramUser } from "./telegram";
import { formatMinor } from "./format";

export type ShopMoveResult = { ok: true; status: OrderStatus } | { ok: false; status: number; error: string; code?: string };

const statusWords: Record<string, string> = { CONFIRMED: "qabul qilindi", PREPARING: "tayyorlanmoqda", SHIPPED: "jo‘natildi", DELIVERED: "yetkazildi", CANCELLED: "bekor qilindi" };

/**
 * A shop moves its part of an order. It cannot accept before the buyer's money is in, cannot skip steps,
 * and must give a reason to cancel. When the part is the whole order, the order follows (with its refund
 * rules); in a mixed order a cancelled part is flagged to staff for a partial refund.
 */
export async function moveShopPart(shopId: string, orderId: string, to: OrderStatusValue, note: string | null, actorId: string): Promise<ShopMoveResult> {
  const part = await prisma.shopOrder.findUnique({
    where: { orderId_shopId: { orderId, shopId } },
    select: { id: true, status: true, itemsTotalMinor: true, deliveryShareMinor: true, shop: { select: { name: true } },
      order: { select: { id: true, status: true, customerId: true, reference: true, paymentMethod: true, paymentStatus: true, totalMinor: true } } }
  });
  if (!part) return { ok: false, status: 404, error: "Buyurtma topilmadi." };
  if (!canTransition(part.status, to)) return { ok: false, status: 409, error: "Bu bosqichga o‘tib bo‘lmaydi.", code: "BAD_TRANSITION" };
  if (to !== "CANCELLED" && part.order.paymentStatus !== "PAID") {
    return { ok: false, status: 409, error: "Mijoz to‘lovi hali tasdiqlanmagan. To‘lov tasdiqlangach xabar keladi.", code: "NOT_PAID" };
  }
  if (to === "CANCELLED" && (!note || note.length < 3)) return { ok: false, status: 400, error: "Bekor qilish sababini yozing (mijozga ko‘rinadi).", code: "NOTE_REQUIRED" };

  let partial = false;
  const moved = await prisma.$transaction(async (tx) => {
    const claim = await tx.shopOrder.updateMany({ where: { id: part.id, status: part.status }, data: { status: to, ...shipmentStamp(to), ...(note ? { sellerNote: note } : {}) } });
    if (claim.count === 0) return false;
    // The part is already marked cancelled above, so the order-wide cancel below would skip its lines:
    // its stock is returned here, once, in both the whole-order and the mixed-order case.
    if (to === "CANCELLED") {
      const items = await tx.orderItem.findMany({ where: { orderId, shopId }, select: { productId: true, quantity: true } });
      await restoreStock(tx, items);
    }
    const whole = await isWholeOrder(tx, orderId, shopId);
    if (whole && canTransition(part.order.status, to)) {
      await applyOrderStatus(tx, part.order, to, actorId, note);
    } else if (to === "CANCELLED") {
      await tx.orderStatusHistory.create({ data: { orderId, fromStatus: part.order.status, toStatus: part.order.status, note: `Do‘kon “${part.shop.name}” o‘z qismini bekor qildi: ${note}`, actorId } });
      partial = true;
    }
    await tx.auditLog.create({ data: { actorId, action: "SHOP_ORDER_STATUS_CHANGED", entity: "ShopOrder", entityId: part.id, metadata: { from: part.status, to } } });
    return true;
  });
  if (!moved) return { ok: false, status: 409, error: "Holat allaqachon o‘zgargan. Ro‘yxatni yangilang." };

  await notifyTelegramUser(part.order.customerId, `<b>Tecsecure: buyurtma ${escapeTelegramHtml(statusWords[to] ?? to)}</b>\nRaqam: <code>${escapeTelegramHtml(part.order.reference)}</code>\nSotuvchi: ${escapeTelegramHtml(part.shop.name)}${note ? `\nIzoh: ${escapeTelegramHtml(note)}` : ""}`);
  if (partial && part.order.paymentStatus === "PAID") {
    const refund = (part.itemsTotalMinor ?? 0) + (part.deliveryShareMinor ?? 0);
    await notifyTelegramAdmins(`<b>↩️ Qisman qaytarish kerak</b>\nBuyurtma <code>${escapeTelegramHtml(part.order.reference)}</code>: do‘kon “${escapeTelegramHtml(part.shop.name)}” o‘z qismini bekor qildi.\nMijozga qaytarish: <b>${escapeTelegramHtml(formatMinor(refund, "UZS"))}</b>\nSabab: ${escapeTelegramHtml(note ?? "")}`, part.order.reference);
  }
  if (to === "DELIVERED") await creditOrderShipments(orderId, actorId);
  return { ok: true, status: to };
}

/** The shop's parts of orders with the buyer's details and only the shop's own lines. */
export async function shopOrdersFor(shopId: string, take = 100) {
  const parts = await prisma.shopOrder.findMany({
    where: { shopId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true, status: true, itemsTotalMinor: true, commissionPercent: true, commissionMinor: true, deliveryShareMinor: true, payoutMinor: true, sellerNote: true,
      creditedAt: true, createdAt: true, confirmedAt: true, shippedAt: true, deliveredAt: true, cancelledAt: true,
      order: { select: { id: true, reference: true, status: true, paymentStatus: true, paymentMethod: true, recipientName: true, phone: true, city: true, address: true, region: true, deliveryMethod: true, note: true, latitude: true, longitude: true, createdAt: true,
        items: { where: { shopId }, select: { id: true, name: true, quantity: true, unitPriceMinor: true, productId: true } } } }
    }
  });
  return parts;
}
