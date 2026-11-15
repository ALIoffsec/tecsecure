import { prisma } from "@/lib/prisma";
import { categoryName } from "@/lib/product-i18n";
import { requireSellingShop } from "@/lib/shop-products-server";

export const runtime = "nodejs";

/** Categories a shop can list products in, with their names in all three languages. */
export async function GET() {
  const seller = await requireSellingShop();
  if (seller instanceof Response) return seller;
  const categories = await prisma.productCategory.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
  return Response.json({ categories: categories.map(category => ({ id: category.id, names: { uz: categoryName(category.name, "uz"), ru: categoryName(category.name, "ru"), en: categoryName(category.name, "en") } })) }, { headers: { "Cache-Control": "private, max-age=300" } });
}
