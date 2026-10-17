import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LocalizedText } from "@/components/site-preferences";
import { MediaGallery } from "@/components/media-uploader";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const articles = isPreviewMode ? [] : await prisma.newsArticle.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" }
  });
  return <div className="container page-shell"><span className="eyebrow"><LocalizedText id="news" /></span><h1 className="page-title"><LocalizedText id="newsPageTitle" /></h1>
    {articles.length ? <div className="card-grid">{articles.map((article) => <article className="card" key={article.id}><p className="small muted">{article.publishedAt?.toLocaleDateString()}</p><h2 style={{ fontSize: "1.3rem" }}><Link href={`/news/${article.slug}`}>{article.title}</Link></h2><p>{article.excerpt}</p><MediaGallery media={article.media} title={article.title} /><Link className="text-link" href={`/news/${article.slug}`}><LocalizedText id="readMore" /></Link></article>)}</div> : <div className="empty-state"><LocalizedText id="noNews" /></div>}
  </div>;
}
