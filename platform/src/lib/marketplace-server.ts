import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { canCredit, shopProductIsPublic, stockStatusFor } from "./marketplace";
import { notifyShopOwner } from "./shop-server";
import { escapeTelegramHtml } from "./telegram";
import { formatMinor } from "./format";
import { siteOrigin } from "./site-origin";

type Tx = Prisma.TransactionClient;

/**
 * A shop listing's public status follows from three facts (staff approval, the shop's own on/off switch,
 * the shop being active), so every public query keeps filtering on `status: "PUBLISHED"` alone.
 * Deleted listings stay ARCHIVED.
 */
export async function syncShopProducts(tx: Tx, where: { shopId?: string; productIds?: string[] }): Promise<void> {
  const products = await tx.product.findMany({
    where: { shopId: where.shopId ?? { not: null }, ...(where.productIds ? { id: { in: where.productIds } } : {}), status: { not: "ARCHIVED" } },
    select: { id: true, status: true, moderation: true, sellerHidden: true, shop: { select: { status: true } } }
  });
  const toPublish = products.filter(p => p.shop && shopProductIsPublic(p.moderation, p.sellerHidden, p.shop.status) && p.status !== "PUBLISHED").map(p => p.id);
  const toHide = products.filter(p => !(p.shop && shopProductIsPublic(p.moderation, p.sellerHidden, p.shop.status)) && p.status === "PUBLISHED").map(p => p.id);
  if (toPublish.length) await tx.product.updateMany({ where: { id: { in: toPublish } }, data: { status: "PUBLISHED" } });
  if (toHide.length) await tx.product.updateMany({ where: { id: { in: toHide } }, data: { status: "DRAFT" } });
}

type LedgerFields = { kind: "SALE" | "PROMOTION" | "PAYOUT" | "PAYOUT_RETURNED" | "ADJUSTMENT"; shopOrderId?: string; payoutId?: string; productId?: string; note?: string; actorId?: string };

/**
 * Moves money on a shop's balance and writes the ledger line in the same transaction. A debit only goes
 * through when the balance covers it (the conditional update is the check), and returns null otherwise.
 */
export async function changeShopBalance(tx: Tx, shopId: string, amountMinor: number, entry: LedgerFields): Promise<number | null> {
  if (!Number.isSafeInteger(amountMinor) || amountMinor === 0) throw new Error("Invalid ledger amount");
  const result = await tx.shop.updateMany({
    where: { id: shopId, ...(amountMinor < 0 ? { balanceMinor: { gte: -amountMinor } } : {}) },
    data: { balanceMinor: { increment: amountMinor } }
  });
  if (result.count === 0) return null;
  const shop = await tx.shop.findUniqueOrThrow({ where: { id: shopId }, select: { balanceMinor: true } });
  await tx.shopLedgerEntry.create({ data: { shopId, amountMinor, balanceAfterMinor: shop.balanceMinor, ...entry } });
  return shop.balanceMinor;
}

/**
 * Credits every shop part of an order that is delivered and paid and not credited yet. Safe to call from
 * any place that delivers or confirms payment: each part is credited at most once.
 */
export async function creditOrderShipments(orderId: string, actorId?: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { reference: true, paymentStatus: true, shipments: { select: { id: true, shopId: true, status: true, creditedAt: true, payoutMinor: true, shop: { select: { ownerId: true } } } } }
  });
  if (!order) return;
  for (const shipment of order.shipments) {
    if (!canCredit(shipment, order.paymentStatus)) continue;
    const credited = await prisma.$transaction(async (tx) => {
      const claim = await tx.shopOrder.updateMany({ where: { id: shipment.id, creditedAt: null }, data: { creditedAt: new Date() } });
      if (claim.count === 0) return null;
      return changeShopBalance(tx, shipment.shopId, shipment.payoutMinor as number, { kind: "SALE", shopOrderId: shipment.id, note: order.reference, actorId });
    });
    if (credited !== null) {
      await notifyShopOwner(shipment.shop.ownerId, `💰 <b>Balansga yozildi: ${escapeTelegramHtml(formatMinor(shipment.payoutMinor as number, "UZS"))}</b>\nBuyurtma <code>${escapeTelegramHtml(order.reference)}</code> yetkazildi va to‘langan. Joriy balans: ${escapeTelegramHtml(formatMinor(credited, "UZS"))}.`);
    }
  }
}

/** Puts back the stock that cancelled lines had taken, and marks counted products in stock again. */
export async function restoreStock(tx: Tx, lines: { productId: string | null; quantity: number }[]): Promise<void> {
  for (const line of lines) {
    if (!line.productId) continue;
    const product = await tx.product.findUnique({ where: { id: line.productId }, select: { stockQuantity: true, stockStatus: true } });
    if (!product || product.stockQuantity === null) continue;
    const quantity = product.stockQuantity + line.quantity;
    await tx.product.update({ where: { id: line.productId }, data: { stockQuantity: quantity, stockStatus: stockStatusFor(quantity, product.stockStatus) } });
  }
}

/** A link into the shop's Mini App, opened right on one screen. */
export function shopAppUrl(screen?: string): string | null {
  const origin = siteOrigin();
  if (!origin.startsWith("https://")) return null;
  return `${origin}/tg/shop${screen ? `?open=${encodeURIComponent(screen)}` : ""}`;
}

/** Tells each shop in the order that the buyer's payment arrived, so it can accept and ship. */
export async function notifyShopsPaid(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { reference: true, shipments: { where: { status: "NEW" }, select: { shop: { select: { ownerId: true } } } } } });
  if (!order) return;
  const open = shopAppUrl(`order:${orderId}`);
  for (const part of order.shipments) {
    await notifyShopOwner(part.shop.ownerId, `💳 <b>To‘lov tasdiqlandi</b>\nBuyurtma <code>${escapeTelegramHtml(order.reference)}</code> to‘langan. Qabul qilib, jo‘natishingiz mumkin.`, {
      orderNews: true,
      replyMarkup: { inline_keyboard: [[{ text: "✅ Qabul qildim", callback_data: `so:confirm:${orderId}` }], ...(open ? [[{ text: "Buyurtmani ochish", web_app: { url: open } }]] : [])] }
    });
  }
}

/** Everything that follows a confirmed payment, for paths that must answer fast (Payme): never throws. */
export async function afterOrderPaid(orderId: string): Promise<void> {
  try {
    await notifyShopsPaid(orderId);
    await creditOrderShipments(orderId);
  } catch (error) {
    console.error("After-payment shop steps failed", error instanceof Error ? error.message : "UnknownError");
  }
}
