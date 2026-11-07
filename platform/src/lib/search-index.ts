import { categoryName, productVariants } from "@/lib/product-i18n";
import { prisma } from "@/lib/prisma";
import { isPreviewMode } from "@/lib/preview-mode";
import { getPublishedLearningDocuments } from "@/lib/learning-content";
import { serviceJourneys } from "@/lib/service-journeys";
import { siteCopy } from "@/lib/site-copy";
import type { Locale } from "@/lib/messages";
import { completionsFor, prepareSearchDocument, scoreSearchDocument, searchTokens, type PreparedSearchDocument } from "@/lib/search-text";

export const searchGroups = ["product", "service", "learning", "news", "page"] as const;
export type SearchGroup = (typeof searchGroups)[number];
export type SearchItem = { id: string; group: SearchGroup; title: string; subtitle: string; href: string; imageId: string | null; priceMinor: number | null; currency: string | null };
export type SearchResponse = { query: string; completions: string[]; total: number; groups: { group: SearchGroup; items: SearchItem[] }[] };
type IndexedItem = { item: SearchItem; doc: PreparedSearchDocument };

const CACHE_MS = 60_000;
const cache = new Map<Locale, { at: number; items: Promise<IndexedItem[]> }>();

function text(value: unknown, locale: Locale): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const chosen = record[locale] ?? record.uz;
    return typeof chosen === "string" ? chosen : "";
  }
  return "";
}

function specText(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  return Object.entries(value as Record<string, unknown>).flat().filter(part => typeof part === "string" || typeof part === "number").join(" ");
}

function short(value: string, length = 96) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length).trimEnd()}…` : clean;
}

async function buildIndex(locale: Locale): Promise<IndexedItem[]> {
  const items: IndexedItem[] = [];
  const add = (item: Omit<SearchItem, "imageId" | "priceMinor" | "currency"> & Partial<SearchItem>, keywords = "", body = "") => items.push({
    item: { imageId: null, priceMinor: null, currency: null, ...item },
    doc: prepareSearchDocument({ title: item.title, keywords, body })
  });

  if (!isPreviewMode) {
    const [products, services, news, modules, paths, labs, exams] = await Promise.all([
      prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { id: true, name: true, slug: true, description: true, brand: true, model: true, sku: true, media: true, priceMinor: true, currency: true, specifications: true, translations: true, category: { select: { name: true } } }, take: 2000 }),
      prisma.service.findMany({ where: { status: "PUBLISHED", availability: true }, select: { id: true, name: true, slug: true, description: true }, take: 500 }),
      prisma.newsArticle.findMany({ where: { status: "PUBLISHED" }, select: { id: true, title: true, slug: true, excerpt: true }, take: 500 }),
      getPublishedLearningDocuments("module"),
      getPublishedLearningDocuments("path"),
      getPublishedLearningDocuments("lab"),
      getPublishedLearningDocuments("exam")
    ]);
    for (const product of products) {
      const media = Array.isArray(product.media) ? product.media.find((id): id is string => typeof id === "string") ?? null : null;
      const own = productVariants(product)[locale];
      const category = product.category ? categoryName(product.category.name, locale) : null;
      add({ id: `product:${product.id}`, group: "product", title: own.name, subtitle: [product.brand, category].filter(Boolean).join(" · ") || short(own.description, 60), href: `/products/${product.slug}`, imageId: media, priceMinor: product.priceMinor, currency: product.currency },
        [product.name, product.brand, product.model, product.sku, category, specText(own.specifications)].filter(Boolean).join(" "), own.description);
    }
    for (const service of services) add({ id: `service:${service.id}`, group: "service", title: service.name, subtitle: short(service.description), href: `/services/${service.slug}` }, "", service.description);
    for (const article of news) add({ id: `news:${article.id}`, group: "news", title: article.title, subtitle: short(article.excerpt), href: `/news/${article.slug}` }, "", article.excerpt);
    for (const module of modules) {
      const summary = text(module.summary, locale);
      add({ id: `module:${module.slug}`, group: "learning", title: text(module.title, locale), subtitle: short(summary), href: `/learning/modules/${module.slug}` }, text(module.category, locale), summary);
    }
    for (const path of paths as unknown as Record<string, unknown>[]) {
      const summary = text(path.description ?? path.summary, locale);
      add({ id: `path:${String(path.slug)}`, group: "learning", title: text(path.title, locale), subtitle: short(summary), href: `/learning/paths/${String(path.slug)}` }, "", summary);
    }
    for (const lab of labs as unknown as Record<string, unknown>[]) {
      const summary = text(lab.summary ?? lab.description, locale);
      add({ id: `lab:${String(lab.slug)}`, group: "learning", title: text(lab.title, locale), subtitle: short(summary), href: `/learning/labs/${String(lab.slug)}` }, "", summary);
    }
    for (const exam of exams as unknown as Record<string, unknown>[]) {
      const summary = text(exam.summary ?? exam.description, locale);
      add({ id: `exam:${String(exam.slug)}`, group: "learning", title: text(exam.title, locale), subtitle: short(summary), href: `/learning/exams/${String(exam.slug)}` }, text(exam.acronym, locale), summary);
    }
  }
  for (const need of serviceJourneys[locale]) add({ id: `need:${need.id}`, group: "service", title: need.title, subtitle: short(need.summary), href: `/services#need-${need.id}` }, "", `${need.summary} ${need.scope} ${need.prepare}`);
  const menu = siteCopy[locale].menu;
  const seen = new Set<string>();
  for (const group of [menu.services, menu.learning, menu.shop, menu.company, menu.legal]) {
    for (const link of group.links) {
      if (seen.has(link.href)) continue;
      seen.add(link.href);
      add({ id: `page:${link.href}`, group: "page", title: link.title, subtitle: link.hint, href: link.href }, group.title);
    }
  }
  return items;
}

function getIndex(locale: Locale): Promise<IndexedItem[]> {
  const cached = cache.get(locale);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.items;
  const items = buildIndex(locale);
  cache.set(locale, { at: Date.now(), items });
  items.catch(() => cache.delete(locale));
  return items;
}

/** Ranked matches for a query. An empty or punctuation-only query returns nothing. */
export async function searchCatalog(rawQuery: string, locale: Locale, options: { scope?: "all" | "products"; perGroup?: number } = {}): Promise<SearchResponse> {
  const query = rawQuery.trim().slice(0, 80);
  const tokens = searchTokens(query);
  const empty: SearchResponse = { query, completions: [], total: 0, groups: [] };
  if (!tokens.length) return empty;
  const index = await getIndex(locale);
  const ranked = index
    .filter(entry => options.scope !== "products" || entry.item.group === "product")
    .map(entry => ({ entry, score: scoreSearchDocument(tokens, entry.doc) }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.item.title.length - b.entry.item.title.length);
  const perGroup = options.perGroup ?? 5;
  const groups = searchGroups
    .map(group => ({ group, items: ranked.filter(result => result.entry.item.group === group).slice(0, perGroup).map(result => result.entry.item) }))
    .filter(group => group.items.length > 0);
  return { query, total: ranked.length, groups, completions: completionsFor(query, ranked.slice(0, 20).map(result => result.entry.item.title)) };
}

/** The same matching for the shop's own list, so a typo finds a product there too. */
export async function searchProductIds(rawQuery: string): Promise<string[]> {
  const tokens = searchTokens(rawQuery.slice(0, 80));
  if (!tokens.length) return [];
  const index = await getIndex("uz");
  return index
    .filter(entry => entry.item.group === "product" && scoreSearchDocument(tokens, entry.doc) > 0)
    .map(entry => entry.item.id.replace("product:", ""));
}
