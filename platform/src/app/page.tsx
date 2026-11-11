import { HomeContent } from "@/components/home-content";
import { prisma } from "@/lib/prisma";
import { isPreviewMode } from "@/lib/preview-mode";
import { HOME_FACTS_KEY, parseHomeFacts } from "@/lib/home-facts";
import { loadProductCards } from "@/lib/product-listing";
import { pickShowcase } from "@/lib/home-showcase";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (isPreviewMode) return <HomeContent contact={{}} work={[]} products={[]} facts={parseHomeFacts(null)} />;
  const [settings, work, candidates, factsRecord] = await Promise.all([
    prisma.siteSetting.findMany({ where: { key: { in: ["phone", "email", "telegram", "instagram"] } } }),
    prisma.portfolioPost.findMany({ where: { published: true }, orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", priceMinor: { not: null } },
      select: { id: true, name: true, category: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" }, take: 300
    }),
    prisma.siteSetting.findUnique({ where: { key: HOME_FACTS_KEY }, select: { value: true } })
  ]);
  const picked = pickShowcase(candidates, 4).map(product => product.id);
  const cards = picked.length ? await loadProductCards({ id: { in: picked } }, "new", 0, picked.length) : [];
  return <HomeContent
    contact={Object.fromEntries(settings.map(({ key, value }) => [key, value]))}
    work={work}
    products={picked.flatMap(id => cards.filter(card => card.id === id))}
    facts={parseHomeFacts(factsRecord?.value)} />;
}
