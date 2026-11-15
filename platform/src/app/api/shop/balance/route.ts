import { prisma } from "@/lib/prisma";
import { payoutDetailsSchema } from "@/lib/marketplace";
import { noStore, requireSellingShop } from "@/lib/shop-products-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The balance with its explanation: what is available, what is still on the way (accepted orders not yet
 * delivered and paid), every ledger line, payout requests, and the bank details payouts go to.
 */
export async function GET() {
  const seller = await requireSellingShop();
  if (seller instanceof Response) return seller;
  const shopId = seller.shop.id;
  const [pending, ledger, payouts] = await Promise.all([
    prisma.shopOrder.aggregate({ where: { shopId, creditedAt: null, status: { not: "CANCELLED" } }, _sum: { payoutMinor: true } }),
    prisma.shopLedgerEntry.findMany({ where: { shopId }, orderBy: { createdAt: "desc" }, take: 100, select: { id: true, kind: true, amountMinor: true, balanceAfterMinor: true, note: true, createdAt: true } }),
    prisma.shopPayout.findMany({ where: { shopId }, orderBy: { createdAt: "desc" }, take: 30, select: { id: true, amountMinor: true, status: true, reviewNote: true, paymentReference: true, createdAt: true, reviewedAt: true } })
  ]);
  const { payoutBankName, payoutAccount, payoutMfo, payoutRecipient } = seller.shop;
  return Response.json({
    balanceMinor: seller.shop.balanceMinor,
    pendingMinor: pending._sum.payoutMinor ?? 0,
    commissionPercent: seller.shop.commissionPercent,
    referralCommissionPercent: seller.shop.referralCommissionPercent,
    ledger, payouts,
    details: { payoutBankName, payoutAccount, payoutMfo, payoutRecipient }
  }, { headers: noStore });
}

/** The bank account payouts go to: a business account (20 digits) with its MFO, never a card. */
export async function PUT(request: Request) {
  const seller = await requireSellingShop();
  if (seller instanceof Response) return seller;
  const parsed = payoutDetailsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Rekvizitlarni tekshiring." }, { status: 400 });
  await prisma.$transaction([
    prisma.shop.update({ where: { id: seller.shop.id }, data: parsed.data }),
    prisma.auditLog.create({ data: { actorId: seller.user.id, action: "SHOP_PAYOUT_DETAILS_UPDATED", entity: "Shop", entityId: seller.shop.id } })
  ]);
  return Response.json({ details: parsed.data }, { headers: noStore });
}
