import { LocalizedText } from "@/components/site-preferences";
import { AddToCartButton, CartFab } from "@/components/cart";
import { FilterPanel } from "@/components/filter-panel";
import { ProductVisual } from "@/components/product-visual";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;
const NEW_DAYS = 30;
const sorts: Record<string, { label: string; order: Prisma.ProductOrderByWithRelationInput[] }> = {
  name: { label: "Nomi bo‘yicha", order: [{ name: "asc" }] },
  new: { label: "Yangilari", order: [{ createdAt: "desc" }] },
  priceAsc: { label: "Narx: arzondan", order: [{ priceMinor: { sort: "asc", nulls: "last" } }, { name: "asc" }] },
  priceDesc: { label: "Narx: qimmatdan", order: [{ priceMinor: { sort: "desc", nulls: "last" } }, { name: "asc" }] }
};
const stockLabels: Record<string, string> = { IN_STOCK: "Omborda bor", ON_REQUEST: "So‘rov bo‘yicha", OUT_OF_STOCK: "Omborda yo‘q" };

type Search = { q?: string; category?: string; brand?: string; stock?: string; sort?: string; page?: string };

function build(params: Search, patch: Partial<Search> = {}) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...params, ...patch })) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `/products?${s}` : "/products";
}

function stockClass(status: string) {
  return status === "IN_STOCK" ? "in" : status === "OUT_OF_STOCK" ? "out" : "req";
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 80) || undefined;
  const sort = sp.sort && sorts[sp.sort] ? sp.sort : "name";
  const page = Math.max(1, Math.min(Number.parseInt(sp.page ?? "1", 10) || 1, 1000));
  const stock = sp.stock && stockLabels[sp.stock] ? sp.stock : undefined;
  const current: Search = { q, category: sp.category, brand: sp.brand, stock, sort: sp.sort };

  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    ...(sp.category ? { category: { slug: sp.category } } : {}),
    ...(sp.brand ? { brand: sp.brand } : {}),
    ...(stock ? { stockStatus: stock } : {}),
    ...(q ? { OR: [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } }
    ] } : {})
  };

  const [products, total, allCount, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      select: { id: true, name: true, slug: true, description: true, brand: true, model: true, priceMinor: true, currency: true, stockStatus: true, createdAt: true, category: { select: { name: true, slug: true } } },
      orderBy: sorts[sort].order,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.product.count({ where }),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.productCategory.findMany({ where: { products: { some: { status: "PUBLISHED" } } }, select: { name: true, slug: true, _count: { select: { products: { where: { status: "PUBLISHED" } } } } }, orderBy: { name: "asc" } }),
    prisma.product.groupBy({ by: ["brand"], where: { status: "PUBLISHED", brand: { not: null } }, _count: { _all: true }, orderBy: { brand: "asc" } })
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeCategory = categories.find((c) => c.slug === sp.category);
  const activeFilters = [
    q && { label: `“${q}”`, href: build(current, { q: undefined, page: undefined }) },
    activeCategory && { label: activeCategory.name, href: build(current, { category: undefined }) },
    sp.brand && { label: sp.brand, href: build(current, { brand: undefined }) },
    stock && { label: stockLabels[stock], href: build(current, { stock: undefined }) }
  ].filter(Boolean) as { label: string; href: string }[];
  const newSince = Date.now() - NEW_DAYS * 86400000;

  return <div className="container page-shell">
    <section className="shop-hero">
      <span className="eyebrow"><LocalizedText id="products" /></span>
      <h1><LocalizedText id="productsPageTitle" /></h1>
      <p><LocalizedText id="verifiedCatalog" /></p>
      <form method="get" action="/products" role="search" className="shop-search">
        {sp.category && <input type="hidden" name="category" value={sp.category} />}
        <input name="q" defaultValue={q ?? ""} placeholder="Mahsulot, brend, model yoki SKU qidiring…" aria-label="Qidiruv" maxLength={80} />
        <button className="button" type="submit">Qidirish</button>
      </form>
      <div className="shop-trust"><span>Tanlash va montajda maslahat</span><span>Kafolat taklifda ko‘rsatiladi</span><span>Yetkazib berish — xaritada nuqta tanlash</span><span>Buyurtma holatini kuzatish</span></div>
    </section>

    <nav className="shop-cats" aria-label="Kategoriyalar">
      <Link className={`shop-chip${!sp.category ? " is-active" : ""}`} href={build(current, { category: undefined, page: undefined })}>Hammasi <small>{allCount}</small></Link>
      {categories.map((c) => <Link key={c.slug} className={`shop-chip${sp.category === c.slug ? " is-active" : ""}`} href={build(current, { category: c.slug, page: undefined })}>{c.name} <small>{c._count.products}</small></Link>)}
    </nav>

    <div className="shop-layout">
      <FilterPanel activeCount={activeFilters.length}>
        <form method="get" action="/products">
          <h2>Filtrlar</h2>
          {q && <input type="hidden" name="q" value={q} />}
          {sp.category && <input type="hidden" name="category" value={sp.category} />}
          {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
          <details open>
            <summary>Mavjudlik</summary>
            <div className="opts">
              <label><input type="radio" name="stock" value="" defaultChecked={!stock} /> Hammasi</label>
              {Object.entries(stockLabels).map(([value, label]) => <label key={value}><input type="radio" name="stock" value={value} defaultChecked={stock === value} /> {label}</label>)}
            </div>
          </details>
          {brands.length > 0 && <details open>
            <summary>Brend</summary>
            <div className="opts">
              <label><input type="radio" name="brand" value="" defaultChecked={!sp.brand} /> Hammasi</label>
              {brands.map((b) => <label key={b.brand}><input type="radio" name="brand" value={b.brand ?? ""} defaultChecked={sp.brand === b.brand} /> {b.brand} <small>{b._count._all}</small></label>)}
            </div>
          </details>}
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            <button className="button" type="submit">Qo‘llash</button>
            {activeFilters.length > 0 && <Link className="button ghost" href="/products">Hammasini tozalash</Link>}
          </div>
        </form>
      </FilterPanel>

      <section aria-live="polite">
        <div className="shop-toolbar">
          <strong>{total} ta mahsulot</strong>
          <div className="shop-sort" aria-label="Saralash">
            {Object.entries(sorts).map(([key, s]) => <Link key={key} className={sort === key ? "is-active" : ""} href={build(current, { sort: key === "name" ? undefined : key, page: undefined })}>{s.label}</Link>)}
          </div>
        </div>
        {activeFilters.length > 0 && <div className="shop-active">
          {activeFilters.map((f) => <Link key={f.label} className="shop-chip is-active removable" href={f.href}>{f.label}</Link>)}
        </div>}

        {products.length ? <div className="shop-grid">
          {products.map((product) => {
            const isNew = product.createdAt.getTime() > newSince;
            return <article className="shop-card" key={product.id}>
              <Link className="shop-card-media" href={`/products/${product.slug}`} aria-label={product.name}>
                <div className="shop-badges">
                  {isNew && <span className="shop-badge new">Yangi</span>}
                  {product.stockStatus === "IN_STOCK" && <span className="shop-badge ok">Omborda</span>}
                  {product.stockStatus === "OUT_OF_STOCK" && <span className="shop-badge warn">Tugagan</span>}
                </div>
                <ProductVisual categorySlug={product.category?.slug} />
              </Link>
              <div className="shop-card-body">
                <span className="shop-card-cat">{[product.category?.name, product.brand].filter(Boolean).join(" · ") || "Tecsecure"}</span>
                <h2><Link href={`/products/${product.slug}`}>{product.name}</Link></h2>
                {product.model && <span className="small muted">Model: {product.model}</span>}
                <p className="shop-card-desc">{product.description}</p>
                <div className="shop-card-foot">
                  <div>
                    <div className={`shop-price${product.priceMinor === null ? " is-request" : ""}`}>
                      {product.priceMinor === null ? "Narx so‘rov bo‘yicha" : `${(product.priceMinor / 100).toLocaleString("uz-UZ")} ${product.currency}`}
                    </div>
                    <span className={`shop-stock ${stockClass(product.stockStatus)}`}>{stockLabels[product.stockStatus] ?? "Noma’lum"}</span>
                  </div>
                  <AddToCartButton product={{ productId: product.id, name: product.name, slug: product.slug, categorySlug: product.category?.slug ?? null }} disabled={product.stockStatus === "OUT_OF_STOCK"} />
                </div>
              </div>
            </article>;
          })}
        </div> : <div className="empty-state">
          <p><strong>Hech narsa topilmadi.</strong></p>
          <p>Boshqa so‘z bilan qidiring yoki filtrlarni tozalang. Kerakli uskuna ro‘yxatda yo‘q bo‘lsa, <Link href="/request-quote" style={{ color: "var(--accent)" }}>taklif so‘rang</Link>.</p>
          {activeFilters.length > 0 && <Link className="button" href="/products">Filtrlarni tozalash</Link>}
        </div>}

        {pages > 1 && <nav className="shop-pager" aria-label="Sahifalar">
          {page > 1 ? <Link className="button secondary" href={build(current, { page: String(page - 1) })}>← Oldingi</Link> : <span />}
          <span className="small muted">{page} / {pages}</span>
          {page < pages ? <Link className="button secondary" href={build(current, { page: String(page + 1) })}>Keyingi →</Link> : <span />}
        </nav>}
      </section>
    </div>
    <CartFab />
  </div>;
}
