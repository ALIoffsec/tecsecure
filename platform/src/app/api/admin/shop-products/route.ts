import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Shop listings for staff review: waiting ones first by default, or any state. */
export async function GET(request: Request) {
  const actor = await requireModuleApi("PRODUCTS");
  if (isResponse(actor)) return actor;
  const state = new URL(request.url).searchParams.get("moderation");
  const moderation = state === "APPROVED" || state === "REJECTED" ? state : "PENDING";
  const [products, counts] = await Promise.all([
    prisma.product.findMany({
      where: { shopId: { not: null }, moderation, status: { not: "ARCHIVED" } },
      select: {
        id: true, name: true, slug: true, description: true, brand: true, model: true, sku: true, priceMinor: true, currency: true, stockQuantity: true,
        warrantyDescription: true, specifications: true, media: true, moderation: true, moderationNote: true, status: true, updatedAt: true,
        category: { select: { name: true } }, shop: { select: { id: true, name: true, slug: true, status: true } }
      },
      orderBy: { updatedAt: moderation === "PENDING" ? "asc" : "desc" },
      take: 100
    }),
    prisma.product.groupBy({ by: ["moderation"], where: { shopId: { not: null }, status: { not: "ARCHIVED" } }, _count: true })
  ]);
  return Response.json({ products, counts: Object.fromEntries(counts.map(row => [row.moderation, row._count])) }, { headers: { "Cache-Control": "private, no-store" } });
}
