import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LocalizedText } from "@/components/site-preferences";
import { MediaGallery } from "@/components/media-uploader";
import { isPreviewMode } from "@/lib/preview-mode";
import { formatDate } from "@/lib/format";
import { catalogMedia } from "@/lib/catalog-media";
import { coverMedia } from "@/lib/catalog-utils";
import { siteOrigin } from "@/lib/site-origin";
import { articleLd, jsonLd, pageMetadata, snippet } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

/** One read per request for both the metadata and the page. */
const publishedArticle = cache(async (slug: string) => {
  if (isPreviewMode) return null;
  const article = await prisma.newsArticle.findFirst({ where: { slug, status: "PUBLISHED" } });
  if (!article) return null;
  const cover = coverMedia((await catalogMedia([article]))(article.media));
  return { article, image: cover?.mimeType.startsWith("image/") ? `/api/media/${cover.id}` : null };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await publishedArticle((await params).slug);
  if (!found) return { title: "Yangilik topilmadi", robots: { index: false } };
  const { article, image } = found;
  return pageMetadata({
    path: `/news/${article.slug}`,
    title: article.title,
    description: snippet(article.excerpt || article.content),
    image,
    article: { publishedTime: (article.publishedAt ?? article.createdAt).toISOString(), modifiedTime: article.updatedAt.toISOString() }
  });
}

export default async function NewsDetailPage({ params }: Props) {
  if (isPreviewMode) notFound();
  const found = await publishedArticle((await params).slug);
  if (!found) notFound();
  const { article, image } = found;
  const structured = articleLd({
    origin: siteOrigin(), path: `/news/${article.slug}`, title: article.title, description: snippet(article.excerpt || article.content),
    image, publishedAt: article.publishedAt ?? article.createdAt, updatedAt: article.updatedAt
  });
  return <article className="container page-shell" style={{ maxWidth: 850 }}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
    <span className="eyebrow"><LocalizedText id="news" /></span><h1 className="page-title">{article.title}</h1>
    <p className="page-intro">{(article.publishedAt ? formatDate(article.publishedAt) : "")}</p>
    <p className="lead">{article.excerpt}</p>
    <MediaGallery media={article.media} title={article.title} />
    <div className="panel-card" style={{ whiteSpace: "pre-wrap" }}>{article.content}</div>
  </article>;
}
