import { Prisma } from "@prisma/client";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const PAGE_SIZE = 50;

/** One page of the catalog for staff, filtered on the server so its size never limits what can be edited. */
export async function GET(request: Request) {
  const actor = await requireModuleApi("PRODUCTS");
  if (isResponse(actor)) return actor;
  const params = new URL(request.url).searchParams;
  const needle = (params.get("q") ?? "").trim().slice(0, 120);
  const status = params.get("status");
  const categoryId = params.get("categoryId");
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);

  const where: Prisma.ProductWhereInput = {
    status: status === "PUBLISHED" || status === "DRAFT" || status === "ARCHIVED" ? status : { not: "ARCHIVED" },
    ...(categoryId ? { categoryId } : {}),
    ...(needle ? { OR: (["name", "brand", "model", "sku"] as const).map((field) => ({ [field]: { contains: needle, mode: "insensitive" as const } })) } : {}),
    ...(params.get("attention") === "1" ? {
      AND: [{
        OR: [
          { priceMinor: null },
          { categoryId: null },
          { media: { equals: Prisma.DbNull } },
          { media: { equals: [] } },
          { specifications: { equals: Prisma.DbNull } },
          { specifications: { equals: Prisma.JsonNull } },
          { specifications: { equals: {} } }
        ]
      }]
    } : {})
  };
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true, slug: true } } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.product.count({ where })
  ]);
  return Response.json({ products, total, page, pageSize: PAGE_SIZE }, { headers: { "Cache-Control": "private, no-store" } });
}
