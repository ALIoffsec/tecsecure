import { prisma } from "@/lib/prisma";
import { SearchResults } from "@/components/search-results";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const raw = (await searchParams).q;
  const q = typeof raw === "string" ? raw.trim().slice(0, 80) : "";
  const [products, services] = q && !isPreviewMode ? await Promise.all([
    prisma.product.findMany({ where: { status: "PUBLISHED", OR: [{ name: { contains: q, mode: "insensitive" } }, { model: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }, select: { id: true, name: true, slug: true, description: true }, orderBy: { name: "asc" }, take: 12 }),
    prisma.service.findMany({ where: { status: "PUBLISHED", availability: true, OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }, select: { id: true, name: true, slug: true, description: true }, take: 12 })
  ]) : [[], []];
  return <SearchResults query={q} products={products} services={services} />;
}
