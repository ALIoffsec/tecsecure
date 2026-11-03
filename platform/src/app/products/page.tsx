import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { catalogMedia } from "@/lib/catalog-media";
import { detailRows, priceBound, specificationFilter } from "@/lib/catalog-utils";
import { AddToCartButton } from "@/components/cart";
import { FilterPanel } from "@/components/filter-panel";
import { ProductMedia } from "@/components/product-media";
import { ProductQuickView } from "@/components/product-quick-view";
import { CompareButton, CompareTray } from "@/components/product-compare";
import { ShopText as S, ShopSearchInput } from "@/components/shop-text";
import { CurrencyPrice, CurrencySelector } from "@/components/currency-context";
import type { ShopKey } from "@/lib/shop-copy";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 12;
const sorts: Record<string, Prisma.ProductOrderByWithRelationInput[]> = {
  name: [{ name: "asc" }, { id: "asc" }],
  new: [{ createdAt: "desc" }, { id: "asc" }],
  priceAsc: [{ priceMinor: { sort: "asc", nulls: "last" } }, { id: "asc" }],
  priceDesc: [{ priceMinor: { sort: "desc", nulls: "last" } }, { id: "asc" }]
};
const stocks = ["IN_STOCK", "ON_REQUEST", "OUT_OF_STOCK", "UNKNOWN"] as const;
type Search = Partial<Record<"q" | "category" | "brand" | "stock" | "sort" | "page" | "min" | "max" | "currency" | "spec", string>>;
function build(params: Search, patch: Search = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...params, ...patch })) if (value) query.set(key, value);
  return `/products${query.size ? `?${query}` : ""}`;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const str = (key: string) => typeof raw[key] === "string" ? raw[key].trim().slice(0, key === "spec" ? 1200 : 100) || undefined : undefined;
  const sp: Search = { q: str("q"), category: str("category"), brand: str("brand"), stock: str("stock"), sort: str("sort"), page: str("page"), min: str("min"), max: str("max"), currency: str("currency"), spec: str("spec") };
  const sort = sp.sort && Object.hasOwn(sorts, sp.sort) ? sp.sort : "name";
  const stock = stocks.find(value => value === sp.stock);
  const page = Math.max(1, Math.min(Number.parseInt(sp.page ?? "1", 10) || 1, 1000));
  const currency = sp.currency && /^[A-Z]{3}$/.test(sp.currency) ? sp.currency : "UZS";
  const min = priceBound(sp.min);
  const max = priceBound(sp.max);
  const invalidPrice = (Boolean(sp.min) && min === undefined) || (Boolean(sp.max) && max === undefined) || (min !== undefined && max !== undefined && min > max);
  const usePrice = !invalidPrice && (min !== undefined || max !== undefined || sort.startsWith("price"));
  const spec = sp.category ? specificationFilter(sp.spec) : null;
  const current: Search = { ...sp, page: undefined, stock, sort, currency };
  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    ...(sp.category ? { category: { slug: sp.category } } : {}),
    ...(sp.brand ? { brand: sp.brand } : {}),
    ...(stock ? { stockStatus: stock } : {}),
    ...(usePrice ? { currency, priceMinor: { ...(min !== undefined ? { gte: min } : {}), ...(max !== undefined ? { lte: max } : {}) } } : {}),
    ...(spec ? { specifications: { path: [spec.key], equals: spec.value } } : {}),
    ...(sp.q ? { OR: ["name", "description", "brand", "model", "sku"].map(key => ({ [key]: { contains: sp.q, mode: "insensitive" } })) } : {})
  };
  const [products, total, categories, brands, currencies, categorySpecs] = await Promise.all([
    prisma.product.findMany({ where, include: { category: { select: { name: true, slug: true } } }, orderBy: sorts[sort], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.product.count({ where }),
    prisma.productCategory.findMany({ where: { products: { some: { status: "PUBLISHED" } } }, select: { name: true, slug: true }, orderBy: { name: "asc" } }),
    prisma.product.groupBy({ by: ["brand"], where: { status: "PUBLISHED", brand: { not: null }, ...(sp.category ? { category: { slug: sp.category } } : {}) }, orderBy: { brand: "asc" } }),
    prisma.product.groupBy({ by: ["currency"], where: { status: "PUBLISHED" }, orderBy: { currency: "asc" } }),
    sp.category ? prisma.product.findMany({ where: { status: "PUBLISHED", category: { slug: sp.category } }, select: { specifications: true } }) : []
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > pages) redirect(build(current, { page: String(pages) }));
  const getMedia = await catalogMedia(products);
  const specOptions = new Map<string, string>();
  for (const product of categorySpecs) {
    if (!product.specifications || typeof product.specifications !== "object" || Array.isArray(product.specifications)) continue;
    for (const [key, value] of Object.entries(product.specifications)) {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") specOptions.set(JSON.stringify([key, value]), `${key}: ${value}`);
    }
  }
  const activeFilters = [
    sp.q ? { label: sp.q, patch: { q: undefined } } : null,
    sp.category ? { label: categories.find(category => category.slug === sp.category)?.name ?? sp.category, patch: { category: undefined, spec: undefined } } : null,
    sp.brand ? { label: sp.brand, patch: { brand: undefined } } : null,
    stock ? { label: <S id={stock} />, patch: { stock: undefined } } : null,
    usePrice ? { label: `${sp.min || "0"} – ${sp.max || "∞"} ${currency}`, patch: { min: undefined, max: undefined, sort: "name" } } : null,
    spec ? { label: `${spec.key}: ${spec.value}`, patch: { spec: undefined } } : null
  ].filter(item => item !== null);
  return <div className="container page-shell">
    <header className="shop-heading"><span className="eyebrow">Tecsecure</span><h1 className="page-title"><S id="title" /></h1><p><S id="intro" /></p></header>
    <section className="shop-hero">
      <form method="get" action="/products" role="search" className="shop-search">
        {Object.entries(current).filter(([key, value]) => key !== "q" && key !== "page" && value).map(([key, value]) => <input type="hidden" name={key} value={value} key={key} />)}
        <label className="sr-only" htmlFor="shop-search"><S id="search" /></label>
        <ShopSearchInput key={sp.q ?? ""} value={sp.q} />
        <button className="button" type="submit"><S id="searchAction" /></button>
      </form><CurrencySelector />
    </section>
    <CompareTray />
    {invalidPrice && <p role="alert" className="shop-price-notice"><S id="priceFrom" /> ≤ <S id="priceTo" />. 0 – 20 000 000. <Link href={build(current, { min: undefined, max: undefined })}><S id="clear" /></Link></p>}
    {sp.spec && !spec && <p role="alert" className="shop-price-notice"><S id="specHint" /> <Link href={build(current, { spec: undefined })}><S id="clear" /></Link></p>}
    <FilterPanel activeCount={activeFilters.length}
      categories={<nav className="shop-cats" aria-label="Categories">
        <Link className={`shop-chip${!sp.category ? " is-active" : ""}`} href={build(current, { category: undefined, spec: undefined, brand: undefined })}><S id="all" /></Link>
        {categories.map(category => <Link className={`shop-chip${category.slug === sp.category ? " is-active" : ""}`} href={build(current, { category: category.slug, brand: undefined, spec: undefined })} key={category.slug}>{category.name}</Link>)}
      </nav>}
      results={<section>
        <p className="shop-result-count" role="status"><S id="found" />: {total}</p>
        {activeFilters.length > 0 && <div className="shop-active">{activeFilters.map((filter, index) => <Link className="shop-chip is-active removable" key={index} href={build(current, filter.patch)}>{filter.label}<span className="sr-only"> — <S id="remove" /></span></Link>)}<Link className="shop-chip" href="/products"><S id="clear" /></Link></div>}
        {products.length > 0 ? <div className="shop-grid">{products.map(product => <article className="shop-card" key={product.id}>
          <Link className="shop-card-media" href={`/products/${product.slug}`} aria-label={product.name}>
            <div className="shop-badges">{product.stockStatus === "IN_STOCK" && <span className="shop-badge ok"><S id="IN_STOCK" /></span>}{product.stockStatus === "OUT_OF_STOCK" && <span className="shop-badge warn"><S id="OUT_OF_STOCK" /></span>}</div>
            <ProductMedia assets={getMedia(product.media)} title={product.name} slug={product.slug} categorySlug={product.category?.slug} />
          </Link>
          <div className="shop-card-body">
            <span className="shop-card-cat">{[product.category?.name, product.brand].filter(Boolean).join(" · ") || "Tecsecure"}</span>
            <h2><Link href={`/products/${product.slug}`}>{product.name}</Link></h2>
            {product.model && <span className="small muted"><S id="model" />: {product.model}</span>}
            <p className="shop-card-desc">{detailRows(product.specifications).slice(0, 3).map(([key, value]) => `${key}: ${value}`).join(" · ") || product.description}</p>
            <div className="shop-card-foot">
              <div><div className="shop-price">{product.priceMinor === null ? <S id="priceRequest" /> : <CurrencyPrice amountMinor={product.priceMinor} currency={product.currency} />}</div><span className={`shop-stock ${product.stockStatus === "IN_STOCK" ? "in" : product.stockStatus === "OUT_OF_STOCK" ? "out" : "req"}`}><S id={stocks.find(stock => stock === product.stockStatus) ?? "UNKNOWN"} /></span></div>
              <AddToCartButton product={{ productId: product.id, name: product.name, slug: product.slug, categorySlug: product.category?.slug }} disabled={product.stockStatus === "OUT_OF_STOCK"} />
              <div className="shop-card-tools">
                <ProductQuickView product={{ id: product.id, slug: product.slug, name: product.name, description: product.description, priceMinor: product.priceMinor, currency: product.currency, stockStatus: stocks.find(stock => stock === product.stockStatus) ?? "UNKNOWN", categorySlug: product.category?.slug, assets: getMedia(product.media), specs: detailRows(product.specifications).slice(0, 4) }} />
                <CompareButton product={{ id: product.id, name: product.name, category: product.category?.slug ?? "" }} />
              </div>
            </div>
          </div>
        </article>)}</div> : <div className="empty-state"><h2><S id="empty" /></h2><p><S id="emptyHint" /></p><div className="journey-actions"><Link className="button secondary" href="/products"><S id="clear" /></Link><Link href="/contact" className="text-link"><S id="quote" /></Link></div></div>}
        {pages > 1 && <nav className="shop-pager" aria-label="Pagination">
          {page > 1 && <Link className="button secondary" href={build(current, { page: String(page - 1) })}>←</Link>}<span>{page} / {pages}</span>
          {page < pages && <Link className="button secondary" href={build(current, { page: String(page + 1) })}>→</Link>}
        </nav>}
      </section>}>
      <form action="/products" method="get" key={JSON.stringify(current)}>
        <h2><S id="filter" /></h2>
        {sp.q && <input type="hidden" name="q" value={sp.q} />}{sp.category && <input type="hidden" name="category" value={sp.category} />}
        <label className="field"><span><S id="stock" /></span><select name="stock" defaultValue={stock ?? ""}><option value=""><S id="all" /></option>{stocks.map(value => <option value={value} key={value}><S id={value} /></option>)}</select></label>
        <label className="field"><span><S id="brand" /></span><select name="brand" defaultValue={sp.brand ?? ""}><option value=""><S id="all" /></option>{brands.map(({ brand }) => <option key={brand} value={brand ?? ""}>{brand}</option>)}</select></label>
        <label className="field"><span><S id="sort" /></span><select name="sort" defaultValue={sort}>{Object.keys(sorts).map(key => <option value={key} key={key}><S id={key as ShopKey} /></option>)}</select></label>
        <label className="field"><span><S id="currency" /></span><select name="currency" defaultValue={currency}>{[...new Set(["UZS", ...currencies.map(item => item.currency)])].map(value => <option key={value}>{value}</option>)}</select></label>
        <label className="field"><span><S id="priceFrom" /></span><input type="number" name="min" min="0" max="20000000" step="0.01" inputMode="decimal" defaultValue={sp.min ?? ""} /></label>
        <label className="field"><span><S id="priceTo" /></span><input type="number" name="max" min="0" max="20000000" step="0.01" inputMode="decimal" defaultValue={sp.max ?? ""} /></label>
        {specOptions.size > 0 && <label className="field"><span><S id="specsFilter" /></span><select name="spec" defaultValue={sp.spec ?? ""}><option value=""><S id="anySpec" /></option>{[...specOptions].map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>}
        <p className="small muted"><S id="priceNote" /></p>
        <button type="submit" className="button"><S id="apply" /></button>
        <Link className="shop-filter-clear" href="/products"><S id="clear" /></Link>
      </form>
    </FilterPanel>
  </div>;
}
