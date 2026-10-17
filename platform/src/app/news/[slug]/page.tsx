import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LocalizedText } from "@/components/site-preferences";
import { MediaGallery } from "@/components/media-uploader";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  if (isPreviewMode) notFound();
  const { slug } = await params;
  const article = await prisma.newsArticle.findFirst({ where: { slug, status: "PUBLISHED" } });
  if (!article) notFound();
  return <article className="container page-shell" style={{ maxWidth: 850 }}>
    <span className="eyebrow"><LocalizedText id="news" /></span><h1 className="page-title">{article.title}</h1>
    <p className="page-intro">{article.publishedAt?.toLocaleDateString()}</p>
    <p className="lead">{article.excerpt}</p>
    <MediaGallery media={article.media} title={article.title} />
    <div className="panel-card" style={{ whiteSpace: "pre-wrap" }}>{article.content}</div>
  </article>;
}
