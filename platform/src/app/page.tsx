import { HomeContent } from "@/components/home-content";
import { prisma } from "@/lib/prisma";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = isPreviewMode ? [] : await prisma.siteSetting.findMany({
    where: { key: { in: ["phone", "email", "telegram", "instagram"] } }
  });
  const work = isPreviewMode ? [] : await prisma.portfolioPost.findMany({ where: { published: true }, orderBy: { updatedAt: "desc" }, take: 3 });
  return <><link rel="preload" as="image" href="/hero/infrastructure.webp" fetchPriority="high" /><HomeContent contact={Object.fromEntries(settings.map(({ key, value }) => [key, value]))} work={work} /></>;
}
