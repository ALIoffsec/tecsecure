import { LocalizedText } from "@/components/site-preferences";
import { AddToCartButton, CartLink } from "@/components/cart";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getProductStockMessageKey } from "@/lib/products";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;
const sorts: Record<string, Prisma.ProductOrderByWithRelationInput[]> = {
  name: [{ name: "asc" }],
  new: [{ createdAt: "desc" }],
  priceAsc: [{ priceMinor: { sort: "asc", nulls: "last" } }, { name: "asc" }],
  priceDesc: [{ priceMinor: { sort: "desc", nulls: "last" } }, { name: "asc" }]
};

type Search = { q?: string; category?: string; brand?: string; stock?: string; sort?: string; page?: string };

function pageHref(current: Search, page: number) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...current, page: String(page) })) if (v) params.set(k, v);
  return `/products?${params.toString()}`;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 80) || undefined;
  const sort = sp.sort && sorts[sp.sort] ? sp.sort : "name";
  const page = Math.max(1, Math.min(Number.parseInt(sp.page ?? "1", 10) || 1, 1000));
  const stock = ["IN_STOCK", "ON_REQUEST", "OUT_OF_STOCK"].includes(sp.stock ?? "") ? sp.stock : undefined;

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

  const [products, total, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      select: { id: true, name: true, slug: true, description: true, brand: true, model: true, priceMinor: true, currency: true, stockStatus: true, warrantyDescription: true, category: { select: { name: true } } },
      orderBy: sorts[sort],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.product.count({ where }),
    prisma.productCategory.findMany({ where: { products: { some: { status: "PUBLISHED" } } }, select: { name: true, slug: true, _count: { select: { products: { where: { status: "PUBLISHED" } } } } }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { status: "PUBLISHED", brand: { not: null } }, select: { brand: true }, distinct: ["brand"], orderBy: { brand: "asc" } })
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(q || sp.category || sp.brand || stock);
  const keep: Search = { q, category: sp.category, brand: sp.brand, stock, sort: sp.sort };

  return <div className="container page-shell">
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      <span className="eyebrow"><LocalizedText id="products" /></span>
      <CartLink />
    </div>
    <h1 className="page-title"><LocalizedText id="productsPageTitle" /></h1>
    <p className="page-intro"><LocalizedText id="verifiedCatalog" /></p>

    <form method="get" action="/products" className="panel-card stack" role="search">
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input name="q" defaultValue={q ?? ""} placeholder="Qidiruv: nom, brend, model, SKU" aria-label="Qidiruv" style={{ flex: "1 1 240px" }} />
        <select name="category" defaultValue={sp.category ?? ""} aria-label="Kategoriya">
          <option value="">Barcha kategoriyalar</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name} ({c._count.products})</option>)}
        </select>
        <select name="brand" defaultValue={sp.brand ?? ""} aria-label="Brend">
          <option value="">Barcha brendlar</option>
          {brands.map((b) => <option key={b.brand} value={b.brand ?? ""}>{b.brand}</option>)}
        </select>
        <select name="stock" defaultValue={stock ?? ""} aria-label="Mavjudlik">
          <option value="">Mavjudlik: hammasi</option>
          <option value="IN_STOCK">Omborda bor</option>
          <option value="ON_REQUEST">So‘rov bo‘yicha</option>
          <option value="OUT_OF_STOCK">Omborda yo‘q</option>
        </select>
        <select name="sort" defaultValue={sort} aria-label="Saralash">
          <option value="name">Nomi bo‘yicha</option>
          <option value="new">Yangilari</option>
          <option value="priceAsc">Narx: arzondan</option>
          <option value="priceDesc">Narx: qimmatdan</option>
        </select>
        <button className="button" type="submit">Qidirish</button>
        {hasFilters && <Link className="button secondary" href="/products">Tozalash</Link>}
      </div>
    </form>

    <p className="small muted" style={{ margin: "14px 0" }}>{total} ta mahsulot topildi</p>
    {products.length ? <div className="dashboard-grid">
      {products.map((product) => <article className="panel-card" key={product.id}>
        <span className="eyebrow">{product.category?.name ?? product.brand ?? "Tecsecure"}</span>
        <h2>{product.name}</h2>
        {(product.brand || product.model) && <p className="small muted">{[product.brand, product.model].filter(Boolean).join(" · ")}</p>}
        <p>{product.description}</p>
        <p><strong>{product.priceMinor === null
          ? <LocalizedText id="priceOnRequest" />
          : `${(product.priceMinor / 100).toLocaleString("uz-UZ")} ${product.currency}`}</strong></p>
        <p className="small muted"><LocalizedText id="stockLabel" />: <LocalizedText id={getProductStockMessageKey(product.stockStatus)} /></p>
        {product.warrantyDescription && <p className="small muted">{product.warrantyDescription}</p>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <AddToCartButton product={{ productId: product.id, name: product.name, slug: product.slug }} disabled={product.stockStatus === "OUT_OF_STOCK"} />
          <Link className="button secondary" href={`/products/${product.slug}`}><LocalizedText id="details" /></Link>
        </div>
      </article>)}
    </div> : <div className="empty-state"><p><LocalizedText id="noProducts" /></p></div>}

    {pages > 1 && <nav style={{ display: "flex", gap: 8, marginTop: 20, alignItems: "center" }} aria-label="Sahifalar">
      {page > 1 && <Link className="button secondary" href={pageHref(keep, page - 1)}>← Oldingi</Link>}
      <span className="small muted">{page} / {pages}</span>
      {page < pages && <Link className="button secondary" href={pageHref(keep, page + 1)}>Keyingi →</Link>}
    </nav>}
  </div>;
}
