import { Localized } from "@/components/localized";
import { categoryName, perLocale } from "@/lib/product-i18n";
import { RecentlyViewed } from "@/components/shop-extras";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { listingWhere, loadProductCards, PAGE_SIZE, productQuery, productsHref as build, readListing, sortKeys, stocks } from "@/lib/product-listing";
import { FilterPanel } from "@/components/filter-panel";
import { ShopGrid } from "@/components/shop-more";
import { ProductCard } from "@/components/product-card";
import { CompareTray } from "@/components/product-compare";
import { ShopText as S, ShopSearchInput, ShopSortSelect } from "@/components/shop-text";
import { CurrencySelector } from "@/components/currency-context";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Uskunalar do‘koni — Tecsecure",
  description: "Videokuzatuv, tarmoq va xavfsizlik uskunalari: narx, mavjudlik va xususiyatlar bilan.",
  alternates: { canonical: "/products" }
};

// A reload deep into the list opens this many batches at once, not every one before it.
const MOST_PAGES_AT_ONCE = 8;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const listing = readListing(await searchParams);
  const { sp, sort, stock, page, currency, invalidPrice, hasPriceRange, spec, current } = listing;
  const where = await listingWhere(listing);
  const firstPage = Math.max(1, page - MOST_PAGES_AT_ONCE + 1);
  const [products, total, categories, brands, currencies, categorySpecs] = await Promise.all([
    loadProductCards(where, sort, (firstPage - 1) * PAGE_SIZE, (page - firstPage + 1) * PAGE_SIZE),
    prisma.product.count({ where }),
    prisma.productCategory.findMany({ where: { products: { some: { status: "PUBLISHED" } } }, select: { name: true, slug: true }, orderBy: { name: "asc" } }),
    prisma.product.groupBy({ by: ["brand"], where: { status: "PUBLISHED", brand: { not: null }, ...(sp.category ? { category: { slug: sp.category } } : {}) }, orderBy: { brand: "asc" } }),
    prisma.product.groupBy({ by: ["currency"], where: { status: "PUBLISHED" }, orderBy: { currency: "asc" } }),
    sp.category ? prisma.product.findMany({ where: { status: "PUBLISHED", category: { slug: sp.category } }, select: { specifications: true } }) : []
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > pages) redirect(build(current, { page: String(pages) }));
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
    hasPriceRange ? { label: `${sp.min || "0"} – ${sp.max || "∞"} ${currency}`, patch: { min: undefined, max: undefined, currency: undefined } } : null,
    spec ? { label: `${spec.key}: ${spec.value}`, patch: { spec: undefined } } : null
  ].filter(item => item !== null);
  return <div className="container page-shell shop-page">
    <header className="shop-heading">
      <span className="eyebrow">Tecsecure</span>
      <h1 className="page-title"><S id="title" /></h1>
      <p><S id="intro" /></p>
    </header>
    <section className="shop-hero">
      <form method="get" action="/products" role="search" className="shop-search">
        {Object.entries(current).filter(([key, value]) => key !== "q" && key !== "page" && value).map(([key, value]) => <input type="hidden" name={key} value={value} key={key} />)}
        <label className="sr-only" htmlFor="shop-search"><S id="search" /></label>
        <ShopSearchInput key={sp.q ?? ""} value={sp.q} />
        <button className="button" type="submit"><S id="searchAction" /></button>
      </form>
    </section>
    <CompareTray />
    {invalidPrice && <p role="alert" className="shop-price-notice"><S id="priceFrom" /> ≤ <S id="priceTo" />. <Link href={build(current, { min: undefined, max: undefined })}><S id="clear" /></Link></p>}
    {sp.spec && !spec && <p role="alert" className="shop-price-notice"><S id="specHint" /> <Link href={build(current, { spec: undefined })}><S id="clear" /></Link></p>}
    <FilterPanel activeCount={activeFilters.length} currency={<CurrencySelector />}
      categories={<nav className="shop-cats" aria-label="Categories">
        <Link className={`shop-chip${!sp.category ? " is-active" : ""}`} href={build(current, { category: undefined, spec: undefined, brand: undefined })}><S id="all" /></Link>
        {categories.map(category => <Link className={`shop-chip${category.slug === sp.category ? " is-active" : ""}`} href={build(current, { category: category.slug, brand: undefined, spec: undefined })} key={category.slug}><Localized values={perLocale((locale) => categoryName(category.name, locale))} /></Link>)}
      </nav>}
      results={<section className="shop-results">
        <div className="shop-results-bar">
          <p className="shop-result-count" role="status"><S id="found" />: <strong>{total}</strong></p>
          <ShopSortSelect value={sort} options={sortKeys.map(key => ({ value: key, href: build(current, { sort: key === "name" ? undefined : key }) }))} />
        </div>
        {activeFilters.length > 0 && <div className="shop-active">{activeFilters.map((filter, index) => <Link className="shop-chip is-active removable" key={index} href={build(current, filter.patch)}>{filter.label}<span aria-hidden="true"> ×</span><span className="sr-only"> — <S id="remove" /></span></Link>)}<Link className="shop-chip" href="/products"><S id="clear" /></Link></div>}
        {products.length > 0
          ? <ShopGrid key={`${JSON.stringify(current)}|${page}`} ids={products.map(product => product.id)} page={page} pages={pages} total={total} pageSize={PAGE_SIZE} query={productQuery(current)}>
            {products.map(({ assets, ...product }) => <ProductCard key={product.id} product={product} assets={assets} />)}
          </ShopGrid>
          : <div className="empty-state"><h2><S id="empty" /></h2><p><S id="emptyHint" /></p><div className="journey-actions"><Link className="button secondary" href="/products"><S id="clear" /></Link><Link href="/contact" className="text-link"><S id="quote" /></Link></div></div>}
      </section>}>
      <form action="/products" method="get" key={JSON.stringify(current)}>
        {sp.q && <input type="hidden" name="q" value={sp.q} />}{sp.category && <input type="hidden" name="category" value={sp.category} />}{current.sort && <input type="hidden" name="sort" value={current.sort} />}
        <label className="field"><span><S id="stock" /></span><select name="stock" defaultValue={stock ?? ""}><option value=""><S id="all" /></option>{stocks.map(value => <option value={value} key={value}><S id={value} /></option>)}</select></label>
        {brands.length > 0 && <label className="field"><span><S id="brand" /></span><select name="brand" defaultValue={sp.brand ?? ""}><option value=""><S id="all" /></option>{brands.map(({ brand }) => <option key={brand} value={brand ?? ""}>{brand}</option>)}</select></label>}
        <fieldset className="shop-price-range">
          <legend><S id="price" /></legend>
          <div>
            <label className="field"><span><S id="priceFrom" /></span><input type="number" name="min" min="0" max="100000000000" step="any" inputMode="decimal" defaultValue={sp.min ?? ""} /></label>
            <label className="field"><span><S id="priceTo" /></span><input type="number" name="max" min="0" max="100000000000" step="any" inputMode="decimal" defaultValue={sp.max ?? ""} /></label>
          </div>
          {currencies.length > 1 && <label className="field"><span><S id="currency" /></span><select name="currency" defaultValue={currency}>{[...new Set(["UZS", ...currencies.map(item => item.currency)])].map(value => <option key={value}>{value}</option>)}</select></label>}
        </fieldset>
        {specOptions.size > 0 && <label className="field"><span><S id="specsFilter" /></span><select name="spec" defaultValue={sp.spec ?? ""}><option value=""><S id="anySpec" /></option>{[...specOptions].map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>}
        <button type="submit" className="button"><S id="apply" /></button>
        <Link className="shop-filter-clear" href="/products"><S id="clear" /></Link>
      </form>
    </FilterPanel>
    <RecentlyViewed />
  </div>;
}
