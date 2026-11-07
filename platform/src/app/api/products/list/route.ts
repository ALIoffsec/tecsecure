import { prisma } from "@/lib/prisma";
import { listingWhere, loadProductCards, PAGE_SIZE, readListing } from "@/lib/product-listing";

export const runtime = "nodejs";

/** The next batch of the shop's list. Same filters and order as the page, published products only. */
export async function GET(request: Request) {
  try {
    const listing = readListing(Object.fromEntries(new URL(request.url).searchParams));
    const where = await listingWhere(listing);
    const [products, total] = await Promise.all([
      loadProductCards(where, listing.sort, (listing.page - 1) * PAGE_SIZE, PAGE_SIZE),
      prisma.product.count({ where })
    ]);
    return Response.json({ products, total, page: listing.page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) });
  } catch (error) {
    console.error("Product list failed", error);
    return Response.json({ error: "Mahsulotlarni yuklab bo‘lmadi." }, { status: 500 });
  }
}
