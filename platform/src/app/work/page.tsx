import { MediaGallery } from "@/components/media-uploader";
import { LocalizedText } from "@/components/site-preferences";
import { prisma } from "@/lib/prisma";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const posts = isPreviewMode ? [] : await prisma.portfolioPost.findMany({ where: { published: true }, orderBy: { updatedAt: "desc" } });
  return <section className="container page-shell">
    <span className="eyebrow"><LocalizedText id="sitePortfolioTitle" /></span>
    <h1 className="page-title"><LocalizedText id="sitePortfolioTitle" /></h1>
    {posts.length ? <div className="portfolio-grid">{posts.map((post) => <article className="panel-card portfolio-public-card" key={post.id}>
      <h2>{post.title}</h2>
      <p>{post.description}</p>
      <MediaGallery media={post.media} title={post.title} marquee />
    </article>)}</div> : <div className="empty-state"><LocalizedText id="sitePortfolioEmpty" /></div>}
  </section>;
}
