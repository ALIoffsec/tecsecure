import { WorkCarousel } from "@/components/work-carousel";
import { LocalizedText } from "@/components/site-preferences";
import { prisma } from "@/lib/prisma";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const posts = isPreviewMode ? [] : await prisma.portfolioPost.findMany({ where: { published: true }, orderBy: { updatedAt: "desc" } });
  return <section className="container page-shell">
    <span className="eyebrow"><LocalizedText id="sitePortfolioTitle" /></span>
    <h1 className="page-title"><LocalizedText id="sitePortfolioTitle" /></h1>
    {posts.length ? <WorkCarousel posts={posts} /> : <div className="empty-state"><LocalizedText id="sitePortfolioEmpty" /></div>}
  </section>;
}
