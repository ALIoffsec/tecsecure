import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteOrigin } from "@/lib/site-origin";
import { SEO_RU_BASE, SEO_UZ_BASE, seoPagesRu, seoPagesUz } from "@/lib/seo-pages";

// Generated on request: the catalog changes from the admin panel, without a redeploy.
export const dynamic = "force-dynamic";

const staticPaths = ["", "/services", "/products", "/learning", "/news", "/contact", "/about", "/careers", "/privacy", "/terms", "/work", "/estimate", "/security-check", "/support-plans", "/learning/business"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const [products, services, news, work] = await Promise.all([
    prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true }, take: 5000 }),
    prisma.service.findMany({ where: { status: "PUBLISHED", availability: true }, select: { slug: true, updatedAt: true }, take: 1000 }),
    prisma.newsArticle.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true }, take: 5000 }),
    prisma.portfolioPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true }, take: 1000 })
  ]);
  return [
    ...staticPaths.map((path) => ({ url: `${origin}${path}` })),
    ...seoPagesUz.map((page) => ({ url: `${origin}${SEO_UZ_BASE}/${page.slug}`, alternates: { languages: { uz: `${origin}${SEO_UZ_BASE}/${page.slug}`, ru: `${origin}${SEO_RU_BASE}/${page.twin}` } } })),
    ...seoPagesRu.map((page) => ({ url: `${origin}${SEO_RU_BASE}/${page.slug}`, alternates: { languages: { ru: `${origin}${SEO_RU_BASE}/${page.slug}`, uz: `${origin}${SEO_UZ_BASE}/${page.twin}` } } })),
    ...work.map((item) => ({ url: `${origin}/work/${item.slug}`, lastModified: item.updatedAt })),
    ...products.map((item) => ({ url: `${origin}/products/${item.slug}`, lastModified: item.updatedAt })),
    ...services.map((item) => ({ url: `${origin}/services/${item.slug}`, lastModified: item.updatedAt })),
    ...news.map((item) => ({ url: `${origin}/news/${item.slug}`, lastModified: item.updatedAt }))
  ];
}
