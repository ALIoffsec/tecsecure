import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteOrigin } from "@/lib/site-origin";
import { SEO_RU_BASE, SEO_UZ_BASE, seoPagesRu, seoPagesUz } from "@/lib/seo-pages";
import { getAdminLearningDocuments } from "@/lib/learning-content";

// Generated on request: the catalog changes from the admin panel, without a redeploy.
export const dynamic = "force-dynamic";

// Public pages worth finding in search. Sign-in, cabinet, compare and other personal pages stay out (they
// are marked noindex too).
const staticPaths = [
  "", "/services", "/cybersecurity", "/consultation", "/request-service", "/support-plans", "/estimate", "/security-check", "/sample-report",
  "/products", "/work", "/news", "/about", "/contact", "/careers", "/privacy", "/terms",
  "/learning", "/learning/modules", "/learning/paths", "/learning/practice", "/learning/practice/labs", "/learning/certifications", "/learning/labs", "/learning/ctf", "/learning/business"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const [products, services, news, work, shops, courses, paths, categories] = await Promise.all([
    prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true }, take: 5000 }),
    prisma.service.findMany({ where: { status: "PUBLISHED", availability: true }, select: { slug: true, updatedAt: true }, take: 1000 }),
    prisma.newsArticle.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true }, take: 5000 }),
    prisma.portfolioPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true }, take: 1000 }),
    // Storefronts of working shops with something on sale; an empty or test shop is left out.
    prisma.shop.findMany({ where: { status: "ACTIVE", products: { some: { status: "PUBLISHED" } } }, select: { slug: true, updatedAt: true }, take: 2000 }),
    // Courses from the same source the learning catalog reads, published ones only.
    getAdminLearningDocuments("module").then(documents => documents.filter(document => document.status === "PUBLISHED")),
    getAdminLearningDocuments("path").then(documents => documents.filter(document => document.status === "PUBLISHED")),
    // Shop categories with something on sale: each is its own indexable page (products?category=…).
    prisma.productCategory.findMany({ where: { products: { some: { status: "PUBLISHED" } } }, select: { slug: true } })
  ]);
  const entries: MetadataRoute.Sitemap = [
    ...staticPaths.map((path) => ({ url: `${origin}${path}` })),
    ...seoPagesUz.map((page) => ({ url: `${origin}${SEO_UZ_BASE}/${page.slug}`, alternates: { languages: { uz: `${origin}${SEO_UZ_BASE}/${page.slug}`, ru: `${origin}${SEO_RU_BASE}/${page.twin}` } } })),
    ...seoPagesRu.map((page) => ({ url: `${origin}${SEO_RU_BASE}/${page.slug}`, alternates: { languages: { ru: `${origin}${SEO_RU_BASE}/${page.slug}`, uz: `${origin}${SEO_UZ_BASE}/${page.twin}` } } })),
    ...work.map((item) => ({ url: `${origin}/work/${item.slug}`, lastModified: item.updatedAt })),
    ...categories.map((item) => ({ url: `${origin}/products?category=${encodeURIComponent(item.slug)}` })),
    ...products.map((item) => ({ url: `${origin}/products/${item.slug}`, lastModified: item.updatedAt })),
    ...services.map((item) => ({ url: `${origin}/services/${item.slug}`, lastModified: item.updatedAt })),
    ...news.map((item) => ({ url: `${origin}/news/${item.slug}`, lastModified: item.updatedAt })),
    ...shops.map((item) => ({ url: `${origin}/s/${item.slug}`, lastModified: item.updatedAt })),
    ...courses.map((item) => ({ url: `${origin}/learning/${item.slug}`, ...(item.updatedAt ? { lastModified: item.updatedAt } : {}) })),
    ...paths.map((item) => ({ url: `${origin}/learning/paths/${item.slug}`, ...(item.updatedAt ? { lastModified: item.updatedAt } : {}) }))
  ];
  // One entry per address: the first (static) one wins.
  const seen = new Set<string>();
  return entries.filter(entry => !seen.has(entry.url) && Boolean(seen.add(entry.url)));
}
