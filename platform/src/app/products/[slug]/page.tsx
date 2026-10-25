import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { MediaGallery } from "@/components/media-uploader";
import { AddToCartButton, CartFab } from "@/components/cart";
import { ProductVisual } from "@/components/product-visual";
import { ReviewForm } from "@/components/product-feedback";
import { CollapsibleSpecs, ExpandableText, ProductDetailTabs } from "@/components/product-detail-tabs";
import { CurrencyPrice, CurrencySelector } from "@/components/currency-context";

export const dynamic = "force-dynamic";

const stockLabels: Record<string, string> = { IN_STOCK: "Omborda bor", ON_REQUEST: "So‘rov bo‘yicha", OUT_OF_STOCK: "Omborda yo‘q" };

function specRows(value: unknown): [string, string][] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string").map((v) => ["", v]);
  return Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    .map(([k, v]) => [k, String(v)]);
}

function maskName(name: string) {
  const [first, second] = name.trim().split(/\s+/);
  return second ? `${first} ${second[0]}.` : first;
}

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return <span className="shop-stars" role="img" aria-label={`${value.toFixed(1)} / 5`}>{[1, 2, 3, 4, 5].map((n) => <span key={n} className={n <= rounded ? "on" : ""}>★</span>)}</span>;
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({ where: { slug, status: "PUBLISHED" }, include: { category: true } });
  if (!product) notFound();
  const user = await getCurrentUser();
  const isCustomer = user?.role === "CUSTOMER";

  const [related, reviews, canReview, alreadyReviewed] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLISHED", id: { not: product.id }, ...(product.categoryId ? { categoryId: product.categoryId } : {}) },
      select: { id: true, name: true, slug: true, priceMinor: true, currency: true },
      take: 4
    }),
    prisma.productReview.findMany({ where: { productId: product.id }, orderBy: { createdAt: "desc" }, take: 50, include: { user: { select: { name: true } } } }),
    isCustomer ? prisma.orderItem.findFirst({ where: { productId: product.id, order: { customerId: user.id, status: "DELIVERED" } }, select: { id: true } }) : null,
    isCustomer ? prisma.productReview.findUnique({ where: { productId_userId: { productId: product.id, userId: user.id } }, select: { id: true } }) : null
  ]);

  const specs = specRows(product.specifications);
  const compatibility = specRows(product.compatibility);
  const detailSpecs: [string, string][] = [
    ...(product.brand ? [["Brend", product.brand] as [string, string]] : []),
    ...(product.model ? [["Model", product.model] as [string, string]] : []),
    ...(product.sku ? [["SKU", product.sku] as [string, string]] : []),
    ...(product.warrantyDescription ? [["Kafolat", product.warrantyDescription] as [string, string]] : []),
    ...specs,
    ...compatibility.map(([label, value]) => [label || "Moslik", value] as [string, string])
  ];
  const hasMedia = Array.isArray(product.media) && product.media.length > 0;
  const priced = product.priceMinor !== null;
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const distribution = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));
  return <div className="container page-shell">
    <nav className="shop-crumbs" aria-label="Breadcrumb">
      <Link href="/products">Katalog</Link><span>/</span>
      {product.category && <><Link href={`/products?category=${product.category.slug}`}>{product.category.name}</Link><span>/</span></>}
      <span aria-current="page">{product.name}</span>
    </nav>

    <div className="shop-pdp">
      <div className="shop-pdp-media">
        {hasMedia ? <MediaGallery media={product.media} title={product.name} /> : <ProductVisual categorySlug={product.category?.slug} large />}
        {!hasMedia && <p className="small muted" style={{ marginTop: 8 }}>Rasm namunaviy; aniq model taklifda ko‘rsatiladi.</p>}
      </div>

      <div className="shop-pdp-info">
        <h1>{product.name}</h1>
        <div className="shop-meta-row">
          <div className="shop-rating-link">
            <Stars value={average} />
            <strong>{reviews.length ? average.toFixed(1) : "—"}</strong>
            <span className="muted">{reviews.length ? `${reviews.length} ta sharh` : "Sharhlar yo‘q"}</span>
          </div>
          {product.sku && <span className="muted">Kod: {product.sku}</span>}
        </div>
        <ul className="shop-highlights">
          {product.brand && <li><span>Brend</span><strong>{product.brand}</strong></li>}
          {product.model && <li><span>Model</span><strong>{product.model}</strong></li>}
          {product.category && <li><span>Kategoriya</span><strong>{product.category.name}</strong></li>}
          {specs.slice(0, 4).map(([k, v], i) => <li key={`${k}-${i}`}><span>{k || "•"}</span><strong>{v}</strong></li>)}
        </ul>
        <div className="muted"><ExpandableText text={product.description} /></div>
      </div>

      <aside className="shop-buybox" aria-label="Xarid">
        <CurrencySelector />
        <div className={`shop-price${priced ? "" : " is-request"}`} style={{ fontSize: "1.6rem" }}>
          {priced ? <CurrencyPrice amountMinor={product.priceMinor!} currency={product.currency} /> : "Narx so‘rov bo‘yicha"}
        </div>
        <span className={`shop-stock ${product.stockStatus === "IN_STOCK" ? "in" : product.stockStatus === "OUT_OF_STOCK" ? "out" : "req"}`}>{stockLabels[product.stockStatus] ?? "Noma’lum"}</span>
        <AddToCartButton product={{ productId: product.id, name: product.name, slug: product.slug, categorySlug: product.category?.slug ?? null }} disabled={product.stockStatus === "OUT_OF_STOCK"} />
        <Link className="button ghost" href="/request-quote">Texnik taklif so‘rash</Link>
      </aside>
    </div>

    <ProductDetailTabs tabs={[
      {
        id: "description",
        label: "Tavsif",
        content: <section>
          <h2>Mahsulot tavsifi</h2>
          <ExpandableText text={product.description} />
        </section>
      },
      {
        id: "specs",
        label: "Xususiyatlar",
        content: <section>
          <h2>Xususiyatlari</h2>
          <CollapsibleSpecs rows={detailSpecs} />
        </section>
      },
      {
        id: "reviews",
        label: "Sharhlar",
        count: reviews.length,
        content: <section>
          <h2>Xaridorlar sharhlari</h2>
          <div className="shop-reviews-head">
            <div className="shop-score"><strong>{reviews.length ? average.toFixed(1) : "—"}</strong><Stars value={average} /><span className="muted small">{reviews.length} ta sharh</span></div>
            <div className="shop-dist">
              {distribution.map(({ n, count }) => <div key={n}><span>{n} ★</span><div className="shop-bar"><i style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }} /></div><span>{count}</span></div>)}
            </div>
          </div>
          {isCustomer && canReview && !alreadyReviewed && <ReviewForm productId={product.id} />}
          {isCustomer && !canReview && <p className="small muted">Sharhni mahsulotni olgan (yetkazib berilgan) mijozlar qoldira oladi.</p>}
          {!user && <p className="small muted"><Link href="/login">Kiring</Link> — buyurtma yetkazilgach sharh qoldirishingiz mumkin.</p>}
          {reviews.length === 0 ? <p className="muted">Hozircha sharhlar yo‘q.</p> : <div className="shop-review-list">
            {reviews.map((r) => <article key={r.id} className="shop-review">
              <header><strong>{maskName(r.user.name)}</strong><Stars value={r.rating} /><span className="muted small">{r.createdAt.toLocaleDateString("uz-UZ")}</span><span className="shop-verified">Xarid qilgan</span></header>
              {r.pros && <p><b>Afzalliklari:</b> {r.pros}</p>}
              {r.cons && <p><b>Kamchiliklari:</b> {r.cons}</p>}
              <p>{r.comment}</p>
            </article>)}
          </div>}
        </section>
      }
    ]} />

    {related.length > 0 && <section className="shop-section">
      <h2>O‘xshash mahsulotlar</h2>
      <div className="shop-grid" style={{ marginTop: 14 }}>
        {related.map((r) => <Link key={r.id} className="shop-card" href={`/products/${r.slug}`}>
          <ProductVisual categorySlug={product.category?.slug} />
          <div className="shop-card-body"><h2>{r.name}</h2><span className="shop-price">{r.priceMinor === null ? "Narx so‘rov bo‘yicha" : <CurrencyPrice amountMinor={r.priceMinor} currency={r.currency} />}</span></div>
        </Link>)}
      </div>
    </section>}
    <CartFab />
  </div>;
}
