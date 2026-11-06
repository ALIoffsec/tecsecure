import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteOrigin } from "@/lib/site-origin";

// Generated on request: the catalog changes from the admin panel, without a redeploy.
export const dynamic = "force-dynamic";

const staticPaths = ["", "/services", "/products", "/learning", "/news", "/contact", "/about", "/careers", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const [products, services, news] = await Promise.all([
    prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true }, take: 5000 }),
    prisma.service.findMany({ where: { status: "PUBLISHED", availability: true }, select: { slug: true, updatedAt: true }, take: 1000 }),
    prisma.newsArticle.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true }, take: 5000 })
  ]);
  return [
    ...staticPaths.map((path) => ({ url: `${origin}${path}` })),
    ...products.map((item) => ({ url: `${origin}/products/${item.slug}`, lastModified: item.updatedAt })),
    ...services.map((item) => ({ url: `${origin}/services/${item.slug}`, lastModified: item.updatedAt })),
    ...news.map((item) => ({ url: `${origin}/news/${item.slug}`, lastModified: item.updatedAt }))
  ];
}
