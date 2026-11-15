import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { escapeTelegramHtml } from "@/lib/telegram";
import { editNeedsReview, sellerProductSchema, sellerQuickSchema, stockStatusFor } from "@/lib/marketplace";
import { syncShopProducts } from "@/lib/marketplace-server";
import { notifyStaffPlain } from "@/lib/shop-server";
import { noStore, photosBelongTo, requireSellingShop, sellerProductData, sellerProductSelect } from "@/lib/shop-products-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

async function ownListing(id: string, shopId: string) {
  return prisma.product.findFirst({ where: { id, shopId, status: { not: "ARCHIVED" } }, select: { ...sellerProductSelect } });
}

export async function GET(_request: Request, context: Context) {
  const seller = await requireSellingShop();
  if (seller instanceof Response) return seller;
  const product = await ownListing((await context.params).id, seller.shop.id);
  if (!product) return Response.json({ error: "Mahsulot topilmadi." }, { status: 404 });
  return Response.json({ product }, { headers: noStore });
}

/**
 * A full edit. Changes buyers judge a product by (text, photos, details) send it back to review and off
 * sale until approved; the seller is told so before saving.
 */
export async function PUT(request: Request, context: Context) {
  const seller = await requireSellingShop();
  if (seller instanceof Response) return seller;
  const { id } = await context.params;
  const current = await ownListing(id, seller.shop.id);
  if (!current) return Response.json({ error: "Mahsulot topilmadi." }, { status: 404 });
  const parsed = sellerProductSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Mahsulot ma’lumotlarini tekshiring.", details: parsed.error.flatten() }, { status: 400 });
  if (!(await prisma.productCategory.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } }))) {
    return Response.json({ error: "Kategoriya topilmadi." }, { status: 400 });
  }
  if (!(await photosBelongTo(seller.user.id, parsed.data.media))) return Response.json({ error: "Rasmlarni qayta yuklang." }, { status: 400 });
  const review = current.moderation !== "APPROVED" || editNeedsReview({
    name: current.name, description: current.description, categoryId: current.categoryId ?? undefined, brand: current.brand ?? undefined, model: current.model ?? undefined,
    warrantyDescription: current.warrantyDescription ?? undefined, specifications: (current.specifications ?? {}) as Record<string, string>, media: (current.media ?? []) as string[],
    translations: (current.translations ?? undefined) as never
  }, parsed.data);
  try {
    const product = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...sellerProductData(parsed.data),
          ...(parsed.data.translations === undefined ? { translations: Prisma.DbNull } : {}),
          stockStatus: stockStatusFor(parsed.data.stockQuantity, "IN_STOCK"),
          ...(review ? { moderation: "PENDING", moderationNote: null } : {})
        }
      });
      await syncShopProducts(tx, { productIds: [id] });
      await tx.auditLog.create({ data: { actorId: seller.user.id, action: review ? "SHOP_PRODUCT_RESUBMITTED" : "SHOP_PRODUCT_UPDATED", entity: "Product", entityId: id } });
      return tx.product.findUniqueOrThrow({ where: { id }, select: sellerProductSelect });
    });
    if (review) await notifyStaffPlain(`<b>✏️ Moderatsiya: mahsulot o‘zgardi</b>\nDo‘kon: ${escapeTelegramHtml(seller.shop.name)}\nMahsulot: ${escapeTelegramHtml(product.name)}`);
    return Response.json({ product, review }, { headers: noStore });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Bu SKU (artikul) boshqa mahsulotda bor." }, { status: 409 });
    }
    console.error("Shop product update failed", error);
    return Response.json({ error: "Saqlab bo‘lmadi." }, { status: 500 });
  }
}

/** Price, stock and on/off sale change at once, without review. */
export async function PATCH(request: Request, context: Context) {
  const seller = await requireSellingShop();
  if (seller instanceof Response) return seller;
  const { id } = await context.params;
  const current = await ownListing(id, seller.shop.id);
  if (!current) return Response.json({ error: "Mahsulot topilmadi." }, { status: 404 });
  const parsed = sellerQuickSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Qiymat noto‘g‘ri." }, { status: 400 });
  const quantity = parsed.data.stockQuantity !== undefined ? parsed.data.stockQuantity : current.stockQuantity;
  const product = await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.stockQuantity !== undefined ? { stockStatus: stockStatusFor(quantity, "IN_STOCK") } : {})
      }
    });
    await syncShopProducts(tx, { productIds: [id] });
    await tx.auditLog.create({ data: { actorId: seller.user.id, action: "SHOP_PRODUCT_QUICK_EDIT", entity: "Product", entityId: id, metadata: parsed.data } });
    return tx.product.findUniqueOrThrow({ where: { id }, select: sellerProductSelect });
  });
  return Response.json({ product }, { headers: noStore });
}

/** Removes the listing from sale for good; past orders keep their own copy of its name and price. */
export async function DELETE(_request: Request, context: Context) {
  const seller = await requireSellingShop();
  if (seller instanceof Response) return seller;
  const { id } = await context.params;
  const current = await ownListing(id, seller.shop.id);
  if (!current) return Response.json({ error: "Mahsulot topilmadi." }, { status: 404 });
  await prisma.$transaction([
    prisma.product.update({ where: { id }, data: { status: "ARCHIVED", sellerHidden: true, promotedUntil: null } }),
    prisma.auditLog.create({ data: { actorId: seller.user.id, action: "SHOP_PRODUCT_DELETED", entity: "Product", entityId: id } })
  ]);
  return Response.json({ ok: true }, { headers: noStore });
}
