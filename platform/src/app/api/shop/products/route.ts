import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { escapeTelegramHtml } from "@/lib/telegram";
import { sellerProductSchema, stockStatusFor } from "@/lib/marketplace";
import { notifyStaffPlain } from "@/lib/shop-server";
import { noStore, photosBelongTo, productSlug, requireSellingShop, sellerProductData, sellerProductSelect } from "@/lib/shop-products-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The shop's own listings in every state, with how many were sold. */
export async function GET() {
  const seller = await requireSellingShop();
  if (seller instanceof Response) return seller;
  const [products, sold] = await Promise.all([
    prisma.product.findMany({ where: { shopId: seller.shop.id, status: { not: "ARCHIVED" } }, select: sellerProductSelect, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 500 }),
    prisma.orderItem.groupBy({ by: ["productId"], where: { shopId: seller.shop.id, order: { status: { not: "CANCELLED" } } }, _sum: { quantity: true } })
  ]);
  const soldBy = new Map(sold.map(row => [row.productId, row._sum.quantity ?? 0]));
  return Response.json({ products: products.map(product => ({ ...product, sold: soldBy.get(product.id) ?? 0 })) }, { headers: noStore });
}

/** A new listing waits for staff review before buyers can see it. */
export async function POST(request: Request) {
  const seller = await requireSellingShop();
  if (seller instanceof Response) return seller;
  if (!(await checkRateLimit("shop-product-create", seller.shop.id, 60, 24 * 60 * 60 * 1000))) {
    return Response.json({ error: "Bir kunda 60 tadan ortiq mahsulot qo‘shib bo‘lmaydi." }, { status: 429 });
  }
  const parsed = sellerProductSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message && parsed.error.issues[0].message.length < 120 ? parsed.error.issues[0].message : "Mahsulot ma’lumotlarini tekshiring.", details: parsed.error.flatten() }, { status: 400 });
  if (!(await prisma.productCategory.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } }))) {
    return Response.json({ error: "Kategoriya topilmadi." }, { status: 400 });
  }
  if (!(await photosBelongTo(seller.user.id, parsed.data.media))) return Response.json({ error: "Rasmlarni qayta yuklang." }, { status: 400 });
  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          ...sellerProductData(parsed.data),
          stockStatus: stockStatusFor(parsed.data.stockQuantity, "IN_STOCK"),
          slug: productSlug(parsed.data.name),
          status: "DRAFT",
          shopId: seller.shop.id,
          moderation: "PENDING"
        },
        select: sellerProductSelect
      });
      await tx.auditLog.create({ data: { actorId: seller.user.id, action: "SHOP_PRODUCT_CREATED", entity: "Product", entityId: created.id } });
      return created;
    });
    await notifyStaffPlain(`<b>🆕 Moderatsiya: yangi mahsulot</b>\nDo‘kon: ${escapeTelegramHtml(seller.shop.name)}\nMahsulot: ${escapeTelegramHtml(product.name)}\n\nAdmin panel → Do‘konlar → Moderatsiya.`);
    return Response.json({ product: { ...product, sold: 0 } }, { status: 201, headers: noStore });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Bu SKU (artikul) boshqa mahsulotda bor. Boshqasini yozing yoki bo‘sh qoldiring." }, { status: 409 });
    }
    console.error("Shop product creation failed", error);
    return Response.json({ error: "Mahsulotni saqlab bo‘lmadi." }, { status: 500 });
  }
}
