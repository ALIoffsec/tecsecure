import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { PROMOTION_KEY, parsePromotion, promotionCost, promotionEnd } from "@/lib/marketplace";
import { changeShopBalance } from "@/lib/marketplace-server";
import { noStore, requireSellingShop } from "@/lib/shop-products-server";
import { formatMinor } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/** Today's price list for paid placement; shops see it before they buy. */
export async function GET() {
  const seller = await requireSellingShop();
  if (seller instanceof Response) return seller;
  const record = await prisma.siteSetting.findUnique({ where: { key: PROMOTION_KEY }, select: { value: true } });
  return Response.json({ promotion: parsePromotion(record?.value), balanceMinor: seller.shop.balanceMinor }, { headers: noStore });
}

/**
 * Puts a listing at the top of the catalogue, marked as advertising, for the chosen days. The price comes
 * from the staff setting and is taken from the shop's balance; a running placement is extended.
 */
export async function POST(request: Request, context: Context) {
  const seller = await requireSellingShop();
  if (seller instanceof Response) return seller;
  const { id } = await context.params;
  const parsed = z.object({ days: z.number().int() }).strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Kunlar sonini tanlang." }, { status: 400 });
  const record = await prisma.siteSetting.findUnique({ where: { key: PROMOTION_KEY }, select: { value: true } });
  const settings = parsePromotion(record?.value);
  if (settings.pricePerDayMinor === null) return Response.json({ error: "Reklama hozircha yoqilmagan.", code: "PROMOTION_OFF" }, { status: 409 });
  const cost = promotionCost(settings, parsed.data.days);
  if (cost === null) return Response.json({ error: `1 dan ${settings.maxDays} kungacha tanlang.` }, { status: 400 });
  const product = await prisma.product.findFirst({ where: { id, shopId: seller.shop.id, status: "PUBLISHED" }, select: { id: true, name: true, promotedUntil: true } });
  if (!product) return Response.json({ error: "Faqat sotuvdagi (tasdiqlangan va yoqilgan) mahsulotni reklama qilish mumkin." }, { status: 409 });
  const until = promotionEnd(product.promotedUntil, parsed.data.days);
  const result = await prisma.$transaction(async (tx) => {
    const balance = await changeShopBalance(tx, seller.shop.id, -cost, { kind: "PROMOTION", productId: id, note: `${product.name} · ${parsed.data.days} kun`, actorId: seller.user.id });
    if (balance === null) return null;
    await tx.product.update({ where: { id }, data: { promotedUntil: until } });
    await tx.auditLog.create({ data: { actorId: seller.user.id, action: "SHOP_PRODUCT_PROMOTED", entity: "Product", entityId: id, metadata: { days: parsed.data.days, cost, until: until.toISOString() } } });
    return balance;
  });
  if (result === null) return Response.json({ error: `Balansda mablag‘ yetarli emas: kerak ${formatMinor(cost, "UZS")}.`, code: "BALANCE_TOO_LOW" }, { status: 409 });
  return Response.json({ promotedUntil: until, balanceMinor: result, costMinor: cost }, { headers: noStore });
}
