import { prisma } from "./prisma";
import { creditOrderShipments } from "./marketplace-server";
import { isWholeOrder, lockOrder, queuePartRefund, refundToWallet } from "./order-flow";
import { notifyShopOwner } from "./shop-server";
import { escapeTelegramHtml, notifyTelegramAdmins, notifyTelegramUser } from "./telegram";
import { formatMinor } from "./format";
import { canDispute, isDisputeOpen } from "./marketplace";
import { partRefundEffect } from "./order-refunds";

export type DisputeResult = { ok: true } | { ok: false; status: number; error: string; code?: string };

/** The buyer reports a problem with one shop's part; its money stays with Tecsecure until staff decide. */
export async function openDispute(customerId: string, orderId: string, shopId: string, note: string): Promise<DisputeResult> {
  const part = await prisma.shopOrder.findUnique({
    where: { orderId_shopId: { orderId, shopId } },
    select: { id: true, status: true, creditedAt: true, disputedAt: true, shop: { select: { name: true, ownerId: true } }, order: { select: { customerId: true, reference: true } } }
  });
  if (!part || part.order.customerId !== customerId) return { ok: false, status: 404, error: "Buyurtma topilmadi." };
  if (part.disputedAt) return { ok: false, status: 409, error: "Bu buyurtma bo‘yicha murojaatingiz allaqachon ko‘rib chiqilmoqda.", code: "ALREADY_OPEN" };
  if (part.creditedAt) return { ok: false, status: 409, error: "Pul sotuvchiga o‘tkazilgan. Iltimos, qo‘llab-quvvatlash orqali yozing.", code: "ALREADY_PAID_OUT" };
  if (!canDispute(part)) return { ok: false, status: 409, error: "Muammo haqida faqat jo‘natilgan yoki yetkazilgan buyurtma bo‘yicha yozish mumkin.", code: "NOT_YET" };
  const claimed = await prisma.$transaction(async (tx) => {
    await lockOrder(tx, orderId);
    const claim = await tx.shopOrder.updateMany({ where: { id: part.id, disputedAt: null, creditedAt: null }, data: { disputedAt: new Date(), disputeNote: note } });
    if (claim.count === 0) return false;
    await tx.orderStatusHistory.create({ data: { orderId, fromStatus: null, toStatus: part.status, note: `Mijoz “${part.shop.name}” jo‘natmasi bo‘yicha muammo bildirdi: ${note}`, actorId: customerId } });
    return true;
  });
  if (!claimed) return { ok: false, status: 409, error: "Holat o‘zgargan. Sahifani yangilang." };
  const ref = escapeTelegramHtml(part.order.reference);
  await notifyTelegramAdmins(`<b>⚠️ Mijoz muammo bildirdi</b>\nBuyurtma <code>${ref}</code>, do‘kon “${escapeTelegramHtml(part.shop.name)}”.\n${escapeTelegramHtml(note)}\n\nPul ushlab turilibdi. Admin panel → Do‘konlar → Murojaatlar.`, part.order.reference);
  await notifyShopOwner(part.shop.ownerId, `<b>⚠️ Mijoz muammo bildirdi</b>\nBuyurtma <code>${ref}</code>: ${escapeTelegramHtml(note)}\nTecsecure xodimi bog‘lanadi; hal bo‘lguncha bu buyurtma puli balansga yozilmaydi.`, { orderNews: true });
  return { ok: true };
}

/**
 * Staff decide a complaint. RELEASE lets the money go to the shop (after any hold). REFUND cancels the
 * part: a wallet payment goes straight back, any other payment is marked for a refund by hand.
 */
export async function decideDispute(shopOrderId: string, action: "RELEASE" | "REFUND", note: string, actorId: string): Promise<DisputeResult> {
  const part = await prisma.shopOrder.findUnique({
    where: { id: shopOrderId },
    select: {
      id: true, orderId: true, shopId: true, status: true, creditedAt: true, disputedAt: true, disputeResolvedAt: true, itemsTotalMinor: true, deliveryShareMinor: true,
      shop: { select: { name: true, ownerId: true } },
      order: { select: { id: true, customerId: true, reference: true, paymentMethod: true, paymentStatus: true, status: true } }
    }
  });
  if (!part || !isDisputeOpen(part)) return { ok: false, status: 404, error: "Ochiq murojaat topilmadi." };
  if (part.creditedAt) return { ok: false, status: 409, error: "Pul allaqachon do‘konga yozilgan." };
  const share = (part.itemsTotalMinor ?? 0) + (part.deliveryShareMinor ?? 0);
  let refunded = 0;
  const done = await prisma.$transaction(async (tx) => {
    const order = await lockOrder(tx, part.orderId);
    if (!order) return false;
    part.order = { ...part.order, paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus, status: order.status };
    const claim = await tx.shopOrder.updateMany({
      where: { id: part.id, disputeResolvedAt: null, creditedAt: null },
      data: { disputeResolution: action === "RELEASE" ? "RELEASED" : "REFUNDED", disputeResolvedAt: new Date(), ...(action === "REFUND" ? { status: "CANCELLED" as const, cancelledAt: new Date() } : {}) }
    });
    if (claim.count === 0) return false;
    if (action === "REFUND") {
      const whole = await isWholeOrder(tx, part.orderId, part.shopId);
      const effect = partRefundEffect(part.order, whole);
      if (effect === "WALLET") {
        refunded = await refundToWallet(tx, { ...part.order, totalMinor: order.totalMinor }, share, actorId, `Murojaat bo‘yicha: “${part.shop.name}”`);
        if (whole) await tx.order.update({ where: { id: part.orderId }, data: { paymentStatus: "REFUNDED" } });
      } else if (effect === "REFUND_DUE") {
        // Card, bank or Payme money is returned by hand; the order says so until staff do it.
        await tx.order.update({ where: { id: part.orderId }, data: { paymentStatus: "REFUND_DUE" } });
      } else if (effect === "QUEUE") {
        // In a mixed order only this shop's share goes back; the order stays paid so the other shops are credited.
        await queuePartRefund(tx, { orderId: part.orderId, entity: "ShopOrder", entityId: part.id, amountMinor: share > 0 ? share : null, shopName: part.shop.name, reason: note }, actorId);
      }
    }
    const outcome = action === "RELEASE" ? "pul do‘konga o‘tkaziladi" : refunded ? `mijozga qaytarildi (${formatMinor(refunded, "UZS")})` : "mijozga qaytariladi";
    await tx.orderStatusHistory.create({ data: { orderId: part.orderId, fromStatus: null, toStatus: part.order.status, note: `Murojaat hal qilindi (“${part.shop.name}”): ${outcome}. ${note}`, actorId } });
    await tx.auditLog.create({ data: { actorId, action: "SHOP_DISPUTE_DECIDED", entity: "ShopOrder", entityId: part.id, metadata: { action, refunded } } });
    return true;
  });
  if (!done) return { ok: false, status: 409, error: "Murojaat allaqachon hal qilingan." };
  const ref = escapeTelegramHtml(part.order.reference);
  const shopName = escapeTelegramHtml(part.shop.name);
  if (action === "RELEASE") {
    await notifyTelegramUser(part.order.customerId, `<b>Tecsecure: murojaatingiz ko‘rib chiqildi</b>\nBuyurtma <code>${ref}</code>, sotuvchi “${shopName}”.\n${escapeTelegramHtml(note)}`);
    await notifyShopOwner(part.shop.ownerId, `<b>✅ Murojaat yopildi</b>\nBuyurtma <code>${ref}</code>: pul odatdagidek balansingizga yoziladi.\n${escapeTelegramHtml(note)}`, { orderNews: true });
    await creditOrderShipments(part.orderId, actorId);
  } else {
    const how = refunded ? `\nHamyoningizga qaytarildi: <b>${escapeTelegramHtml(formatMinor(refunded, "UZS"))}</b>` : "\nXodimimiz qaytarish bo‘yicha bog‘lanadi.";
    await notifyTelegramUser(part.order.customerId, `<b>Tecsecure: pulingiz qaytariladi</b>\nBuyurtma <code>${ref}</code>, sotuvchi “${shopName}”.${how}\n${escapeTelegramHtml(note)}`);
    await notifyShopOwner(part.shop.ownerId, `<b>↩️ Murojaat mijoz foydasiga hal qilindi</b>\nBuyurtma <code>${ref}</code> bekor qilindi, pul balansingizga yozilmaydi.\n${escapeTelegramHtml(note)}`, { orderNews: true });
  }
  return { ok: true };
}
