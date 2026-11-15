import { prisma } from "@/lib/prisma";
import { LOW_STOCK, PROMOTION_KEY, parsePromotion } from "@/lib/marketplace";
import { noStore, requireSellingShop } from "@/lib/shop-products-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The seller's home screen in one request: what needs doing now, money, and how listings are doing. */
export async function GET() {
  const seller = await requireSellingShop();
  if (seller instanceof Response) return seller;
  const shopId = seller.shop.id;
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [toAccept, awaitingPayment, toShip, shipped, earned30, pending, products, top, promotion, ordersDelivered, disputes] = await Promise.all([
    prisma.shopOrder.count({ where: { shopId, status: "NEW", order: { paymentStatus: "PAID" } } }),
    prisma.shopOrder.count({ where: { shopId, status: "NEW", order: { paymentStatus: { not: "PAID" } } } }),
    prisma.shopOrder.count({ where: { shopId, status: { in: ["CONFIRMED", "PREPARING"] } } }),
    prisma.shopOrder.count({ where: { shopId, status: "SHIPPED" } }),
    prisma.shopLedgerEntry.aggregate({ where: { shopId, kind: "SALE", createdAt: { gte: since } }, _sum: { amountMinor: true } }),
    prisma.shopOrder.aggregate({ where: { shopId, creditedAt: null, status: { not: "CANCELLED" } }, _sum: { payoutMinor: true } }),
    prisma.product.findMany({ where: { shopId, status: { not: "ARCHIVED" } }, select: { id: true, name: true, status: true, moderation: true, sellerHidden: true, stockQuantity: true, stockStatus: true, viewCount: true, promotedUntil: true } }),
    prisma.orderItem.groupBy({ by: ["productId"], where: { shopId, order: { status: { not: "CANCELLED" }, createdAt: { gte: since } } }, _sum: { quantity: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 }),
    prisma.siteSetting.findUnique({ where: { key: PROMOTION_KEY }, select: { value: true } }),
    prisma.shopOrder.count({ where: { shopId, status: "DELIVERED" } }),
    prisma.shopOrder.count({ where: { shopId, disputedAt: { not: null }, disputeResolvedAt: null } })
  ]);
  const now = new Date();
  const names = new Map(products.map(product => [product.id, product.name]));
  return Response.json({
    shop: { name: seller.shop.name, slug: seller.shop.slug, commissionPercent: seller.shop.commissionPercent, referralCommissionPercent: seller.shop.referralCommissionPercent, notifyOrders: seller.shop.notifyOrders },
    orders: { toAccept, awaitingPayment, toShip, shipped, delivered: ordersDelivered, disputes },
    money: { balanceMinor: seller.shop.balanceMinor, pendingMinor: pending._sum.payoutMinor ?? 0, earned30Minor: earned30._sum.amountMinor ?? 0 },
    products: {
      // Same rule as the products list: a sold-out listing counts as sold out, not on sale.
      onSale: products.filter(product => product.status === "PUBLISHED" && product.stockStatus !== "OUT_OF_STOCK").length,
      inReview: products.filter(product => product.moderation === "PENDING").length,
      rejected: products.filter(product => product.moderation === "REJECTED").length,
      hidden: products.filter(product => product.sellerHidden && product.moderation === "APPROVED").length,
      advertised: products.filter(product => product.promotedUntil && product.promotedUntil > now).length,
      lowStock: products.filter(product => product.stockQuantity !== null && product.stockQuantity > 0 && product.stockQuantity <= LOW_STOCK).map(product => ({ id: product.id, name: product.name, left: product.stockQuantity })),
      outOfStock: products.filter(product => product.stockStatus === "OUT_OF_STOCK" && product.status !== "ARCHIVED").map(product => ({ id: product.id, name: product.name })),
      views: products.reduce((sum, product) => sum + product.viewCount, 0),
      topViewed: [...products].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5).filter(product => product.viewCount > 0).map(product => ({ id: product.id, name: product.name, views: product.viewCount })),
      topSold: top.filter(row => row.productId && names.has(row.productId)).map(row => ({ id: row.productId as string, name: names.get(row.productId as string) as string, sold: row._sum.quantity ?? 0 }))
    },
    promotion: parsePromotion(promotion?.value)
  }, { headers: noStore });
}
