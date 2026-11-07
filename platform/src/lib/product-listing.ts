import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { catalogMedia } from "./catalog-media";
import { priceBound, specificationFilter, type CatalogMedia } from "./catalog-utils";
import { searchProductIds } from "./search-index";

/** The shop page and "show more" read the catalogue through this file, so both always agree on what comes next. */
export const PAGE_SIZE = 12;

const sorts = {
  name: [{ name: "asc" }, { id: "asc" }],
  new: [{ createdAt: "desc" }, { id: "asc" }],
  // Prices in different currencies cannot be ranked against each other, so they stay grouped.
  priceAsc: [{ currency: "asc" }, { priceMinor: { sort: "asc", nulls: "last" } }, { id: "asc" }],
  priceDesc: [{ currency: "asc" }, { priceMinor: { sort: "desc", nulls: "last" } }, { id: "asc" }]
} satisfies Record<string, Prisma.ProductOrderByWithRelationInput[]>;
export type SortKey = keyof typeof sorts;
export const sortKeys = Object.keys(sorts) as SortKey[];
export const stocks = ["IN_STOCK", "ON_REQUEST", "OUT_OF_STOCK", "UNKNOWN"] as const;
export type ProductSearch = Partial<Record<"q" | "category" | "brand" | "stock" | "sort" | "page" | "min" | "max" | "currency" | "spec", string>>;

export function productQuery(params: ProductSearch, patch: ProductSearch = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...params, ...patch })) if (value) query.set(key, value);
  return query.toString();
}

export function productsHref(params: ProductSearch, patch: ProductSearch = {}) {
  const query = productQuery(params, patch);
  return `/products${query ? `?${query}` : ""}`;
}

export function readListing(raw: Record<string, string | string[] | undefined>) {
  const str = (key: string) => {
    const value = raw[key];
    return typeof value === "string" ? value.trim().slice(0, key === "spec" ? 1200 : 100) || undefined : undefined;
  };
  const sp: ProductSearch = { q: str("q"), category: str("category"), brand: str("brand"), stock: str("stock"), sort: str("sort"), page: str("page"), min: str("min"), max: str("max"), currency: str("currency"), spec: str("spec") };
  const sort: SortKey = sortKeys.find(key => key === sp.sort) ?? "name";
  const stock = stocks.find(value => value === sp.stock);
  const page = Math.max(1, Math.min(Number.parseInt(sp.page ?? "1", 10) || 1, 1000));
  const currency = sp.currency && /^[A-Z]{3}$/.test(sp.currency) ? sp.currency : "UZS";
  const min = priceBound(sp.min);
  const max = priceBound(sp.max);
  const invalidPrice = (Boolean(sp.min) && min === undefined) || (Boolean(sp.max) && max === undefined) || (min !== undefined && max !== undefined && min > max);
  const hasPriceRange = !invalidPrice && (min !== undefined || max !== undefined);
  const spec = sp.category ? specificationFilter(sp.spec) : null;
  const current: ProductSearch = { ...sp, page: undefined, stock, sort: sort === "name" ? undefined : sort, currency: hasPriceRange && currency !== "UZS" ? currency : undefined };
  return { sp, sort, stock, page, currency, min, max, invalidPrice, hasPriceRange, spec, current };
}

export type Listing = ReturnType<typeof readListing>;

export async function listingWhere({ sp, stock, hasPriceRange, currency, min, max, spec }: Listing): Promise<Prisma.ProductWhereInput> {
  return {
    status: "PUBLISHED",
    ...(sp.category ? { category: { slug: sp.category } } : {}),
    ...(sp.brand ? { brand: sp.brand } : {}),
    ...(stock ? { stockStatus: stock } : {}),
    ...(hasPriceRange ? { currency, priceMinor: { ...(min !== undefined ? { gte: min } : {}), ...(max !== undefined ? { lte: max } : {}) } } : {}),
    ...(spec ? { specifications: { path: [spec.key], equals: spec.value } } : {}),
    ...(sp.q ? { id: { in: await searchProductIds(sp.q) } } : {})
  };
}

const cardFields = {
  id: true, name: true, slug: true, brand: true, model: true, description: true, priceMinor: true, currency: true,
  stockStatus: true, specifications: true, translations: true, media: true, category: { select: { name: true, slug: true } }
} satisfies Prisma.ProductSelect;

/** Only what a product card shows, because the "show more" response is public. */
export async function loadProductCards(where: Prisma.ProductWhereInput, sort: SortKey, skip: number, take: number) {
  const products = await prisma.product.findMany({ where, select: cardFields, orderBy: sorts[sort], skip, take });
  const getMedia = await catalogMedia(products);
  return products.map(({ media, ...product }) => ({ ...product, assets: getMedia(media) as CatalogMedia[] }));
}

export type ProductCardData = Awaited<ReturnType<typeof loadProductCards>>[number];
