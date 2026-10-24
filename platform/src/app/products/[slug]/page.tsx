import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MediaGallery } from "@/components/media-uploader";
import { AddToCartButton, CartFab } from "@/components/cart";
import { ProductVisual } from "@/components/product-visual";

export const dynamic = "force-dynamic";

const stockLabels: Record<string, string> = { IN_STOCK: "Omborda bor", ON_REQUEST: "So‘rov bo‘yicha", OUT_OF_STOCK: "Omborda yo‘q" };

function specRows(value: unknown): [string, string][] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string").map((v) => ["", v]);
  return Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => typeof v === "string" || typeof v === "number")
    .map(([k, v]) => [k, String(v)]);
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({ where: { slug, status: "PUBLISHED" }, include: { category: true } });
  if (!product) notFound();
  const related = await prisma.product.findMany({
    where: { status: "PUBLISHED", id: { not: product.id }, ...(product.categoryId ? { categoryId: product.categoryId } : {}) },
    select: { id: true, name: true, slug: true, priceMinor: true, currency: true },
    take: 3
  });
  const specs = specRows(product.specifications);
  const hasMedia = Array.isArray(product.media) && product.media.length > 0;
  const priced = product.priceMinor !== null;

  return <div className="container page-shell">
    <nav className="shop-crumbs" aria-label="Breadcrumb">
      <Link href="/products">Katalog</Link><span>/</span>
      {product.category && <><Link href={`/products?category=${product.category.slug}`}>{product.category.name}</Link><span>/</span></>}
      <span aria-current="page">{product.name}</span>
    </nav>
    <div className="shop-pdp">
      <div>
        {hasMedia ? <MediaGallery media={product.media} title={product.name} /> : <ProductVisual categorySlug={product.category?.slug} large />}
        <p className="small muted" style={{ marginTop: 8 }}>{hasMedia ? "" : "Rasm namunaviy; aniq model taklifda ko‘rsatiladi."}</p>
      </div>
      <div>
        <span className="eyebrow">{[product.category?.name, product.brand].filter(Boolean).join(" · ") || "Tecsecure"}</span>
        <h1>{product.name}</h1>
        <p className="muted">{product.description}</p>
        <div className="shop-buybox">
          <div>
            <div className={`shop-price${priced ? "" : " is-request"}`} style={{ fontSize: "1.5rem" }}>
              {priced ? `${(product.priceMinor! / 100).toLocaleString("uz-UZ")} ${product.currency}` : "Narx so‘rov bo‘yicha"}
            </div>
            <span className={`shop-stock ${product.stockStatus === "IN_STOCK" ? "in" : product.stockStatus === "OUT_OF_STOCK" ? "out" : "req"}`}>{stockLabels[product.stockStatus] ?? "Noma’lum"}</span>
          </div>
          <AddToCartButton product={{ productId: product.id, name: product.name, slug: product.slug, categorySlug: product.category?.slug ?? null }} disabled={product.stockStatus === "OUT_OF_STOCK"} />
          <Link className="button ghost" href="/request-quote">Texnik taklif so‘rash</Link>
          <ul className="shop-perks">
            <li>{priced ? "Narx buyurtma tasdiqlanganda yakunlanadi" : "Narx va mavjudlik xodim tomonidan tasdiqlanadi"}</li>
            <li>{product.warrantyDescription ?? "Kafolat muddati taklifda ko‘rsatiladi"}</li>
            <li>Yetkazib berish manzilini xaritada tanlaysiz</li>
          </ul>
        </div>
        <table className="shop-specs">
          <tbody>
            {product.brand && <tr><th>Brend</th><td>{product.brand}</td></tr>}
            {product.model && <tr><th>Model</th><td>{product.model}</td></tr>}
            {product.sku && <tr><th>SKU</th><td>{product.sku}</td></tr>}
            {specs.map(([k, v], i) => <tr key={`${k}-${i}`}><th>{k}</th><td>{v}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
    {related.length > 0 && <section style={{ marginTop: 48 }}>
      <h2>O‘xshash mahsulotlar</h2>
      <div className="shop-grid" style={{ marginTop: 14 }}>
        {related.map((r) => <Link key={r.id} className="shop-card" href={`/products/${r.slug}`}>
          <ProductVisual categorySlug={product.category?.slug} />
          <div className="shop-card-body"><h2>{r.name}</h2><span className="shop-price is-request">{r.priceMinor === null ? "Narx so‘rov bo‘yicha" : `${(r.priceMinor / 100).toLocaleString("uz-UZ")} ${r.currency}`}</span></div>
        </Link>)}
      </div>
    </section>}
    <CartFab />
  </div>;
}
