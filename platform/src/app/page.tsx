import { HomeContent } from "@/components/home-content";
import { prisma } from "@/lib/prisma";
import { isPreviewMode } from "@/lib/preview-mode";
import { mediaIds } from "@/lib/catalog-utils";
import { HOME_FACTS_KEY, parseHomeFacts } from "@/lib/home-facts";

export const dynamic = "force-dynamic";

/** Only public images count as a photo for a card; a video or a private file would show as a broken box. */
async function imageIds(candidates: string[]): Promise<Set<string>> {
  if (!candidates.length) return new Set();
  const found = await prisma.mediaAsset.findMany({ where: { id: { in: candidates }, mimeType: { startsWith: "image/" }, private: false }, select: { id: true } });
  return new Set(found.map(asset => asset.id));
}

export default async function HomePage() {
  if (isPreviewMode) return <HomeContent contact={{}} work={[]} workPhoto={null} products={[]} facts={parseHomeFacts(null)} />;
  const [settings, work, products, factsRecord] = await Promise.all([
    prisma.siteSetting.findMany({ where: { key: { in: ["phone", "email", "telegram", "instagram"] } } }),
    prisma.portfolioPost.findMany({ where: { published: true }, orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.product.findMany({
      where: { status: "PUBLISHED", priceMinor: { not: null } },
      select: { id: true, name: true, slug: true, priceMinor: true, currency: true, media: true },
      orderBy: { updatedAt: "desc" }, take: 6
    }),
    prisma.siteSetting.findUnique({ where: { key: HOME_FACTS_KEY }, select: { value: true } })
  ]);
  const images = await imageIds([...products.flatMap(product => mediaIds(product.media)), ...work.flatMap(post => mediaIds(post.media))]);
  const workPhoto = work.flatMap(post => mediaIds(post.media).filter(id => images.has(id)).map(id => ({ id, title: post.title })))[0] ?? null;
  return <HomeContent
    contact={Object.fromEntries(settings.map(({ key, value }) => [key, value]))}
    work={work}
    workPhoto={workPhoto}
    products={products.map(({ media, ...product }) => ({ ...product, priceMinor: product.priceMinor as number, imageId: mediaIds(media).find(id => images.has(id)) ?? null }))}
    facts={parseHomeFacts(factsRecord?.value)} />;
}
