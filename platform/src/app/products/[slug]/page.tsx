import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AddToCartButton } from "@/components/cart";
import { ProductMedia, ProductGallery } from "@/components/product-media";
import { ProductGuidance } from "@/components/product-guidance";
import { CompareButton, CompareTray } from "@/components/product-compare";
import { ShopText as S } from "@/components/shop-text";
import { catalogMedia } from "@/lib/catalog-media";
import { detailRows } from "@/lib/catalog-utils";
import { inquiryHref } from "@/lib/journey-copy";
import { ReviewForm } from "@/components/product-feedback";
import { CollapsibleSpecs, ExpandableText, ProductDetailTabs } from "@/components/product-detail-tabs";
import { CurrencyPrice, CurrencySelector } from "@/components/currency-context";

export const dynamic = "force-dynamic";

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
      where: { status: "PUBLISHED", id: { not: product.id }, categoryId: product.categoryId },
      select: { id: true, name: true, slug: true, priceMinor: true, currency: true, media: true, category: { select: { slug: true } } },
      take: 4
    }),
    prisma.productReview.findMany({ where: { productId: product.id }, orderBy: { createdAt: "desc" }, take: 50, include: { user: { select: { name: true } } } }),
    isCustomer ? prisma.orderItem.findFirst({ where: { productId: product.id, order: { customerId: user.id, status: "DELIVERED" } }, select: { id: true } }) : null,
    isCustomer ? prisma.productReview.findUnique({ where: { productId_userId: { productId: product.id, userId: user.id } }, select: { id: true } }) : null
  ]);

  const getMedia = await catalogMedia([product, ...related]);
  const specs = detailRows(product.specifications);
  const compatibility = detailRows(product.compatibility);
  const detailSpecs: [ReactNode, string][] = [...specs];
  if (product.brand) detailSpecs.unshift([<S id="brand" />, product.brand]);
  if (product.model) detailSpecs.unshift([<S id="model" />, product.model]);
  if (product.sku) detailSpecs.push(["SKU", product.sku]);
  if (product.warrantyDescription) detailSpecs.push([<S id="warranty" />, product.warrantyDescription]);
  for (const [label, value] of compatibility) detailSpecs.push([label || <S id="compatibility" />, value]);
  const priced = product.priceMinor !== null;
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const distribution = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));
  return <div className="container page-shell">
    <nav className="shop-crumbs" aria-label="Breadcrumb">
      <Link href="/products"><S id="catalog" /></Link><span>/</span>
      {product.category && <><Link href={`/products?category=${product.category.slug}`}>{product.category.name}</Link><span>/</span></>}
      <span aria-current="page">{product.name}</span>
    </nav>

    <CompareTray />
    <div className="shop-pdp">
      <div className="shop-pdp-media">
        <ProductGallery assets={getMedia(product.media)} title={product.name} slug={product.slug} categorySlug={product.category?.slug} />
      </div>

      <div className="shop-pdp-info">
        <h1>{product.name}</h1>
        <div className="shop-meta-row">
          <div className="shop-rating-link">
            <Stars value={average} />
            <strong>{reviews.length ? average.toFixed(1) : "—"}</strong>
            <span className="muted">{reviews.length ? <>{reviews.length} <S id="reviews" /></> : <S id="noReviews" />}</span>
          </div>
          {product.sku && <span className="muted">SKU: {product.sku}</span>}
        </div>
        <ul className="shop-highlights">
          {product.brand && <li><span><S id="brand" /></span><strong>{product.brand}</strong></li>}
          {product.model && <li><span><S id="model" /></span><strong>{product.model}</strong></li>}
          {product.category && <li><span><S id="category" /></span><strong>{product.category.name}</strong></li>}
          {specs.slice(0, 4).map(([k, v], i) => <li key={`${k}-${i}`}><span>{k || "•"}</span><strong>{v}</strong></li>)}
        </ul>
        <div className="muted"><ExpandableText text={product.description} /></div>
      </div>

      <aside className="shop-buybox" aria-label="Xarid">
        <CurrencySelector />
        <div className={`shop-price${priced ? "" : " is-request"}`} style={{ fontSize: "1.6rem" }}>
          {priced ? <CurrencyPrice amountMinor={product.priceMinor!} currency={product.currency} /> : <S id="priceRequest" />}
        </div>
        <span className={`shop-stock ${product.stockStatus === "IN_STOCK" ? "in" : product.stockStatus === "OUT_OF_STOCK" ? "out" : "req"}`}><S id={product.stockStatus === "IN_STOCK" ? "IN_STOCK" : product.stockStatus === "ON_REQUEST" ? "ON_REQUEST" : product.stockStatus === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "UNKNOWN"} /></span>
        <AddToCartButton product={{ productId: product.id, name: product.name, slug: product.slug, categorySlug: product.category?.slug ?? null }} disabled={product.stockStatus === "OUT_OF_STOCK"} />
        <CompareButton product={{ id: product.id, name: product.name, category: product.category?.slug ?? "" }} />
        <Link className="button ghost" href={inquiryHref(product.name)}><S id="quote" /></Link>
      </aside>
    </div>

    <ProductDetailTabs tabs={[
      {
        id: "description",
        label: <S id="description" />,
        content: <section>
          <h2><S id="description" /></h2>
          <ExpandableText text={product.description} />
        </section>
      },
      {
        id: "specs",
        label: <S id="specs" />,
        content: <section>
          <h2><S id="specs" /></h2>
          <CollapsibleSpecs rows={detailSpecs} />
        </section>
      },
      {
        id: "reviews",
        label: <S id="reviews" />,
        count: reviews.length,
        content: <section>
          <h2><S id="reviews" /></h2>
          <div className="shop-reviews-head">
            <div className="shop-score"><strong>{reviews.length ? average.toFixed(1) : "—"}</strong><Stars value={average} /><span className="muted small">{reviews.length} <S id="reviews" /></span></div>
            <div className="shop-dist">
              {distribution.map(({ n, count }) => <div key={n}><span>{n} ★</span><div className="shop-bar"><i style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }} /></div><span>{count}</span></div>)}
            </div>
          </div>
          {isCustomer && canReview && !alreadyReviewed && <ReviewForm productId={product.id} />}
          {isCustomer && !canReview && <p className="small muted"><S id="reviewNote" /></p>}
          {!user && <p className="small muted"><Link href={`/login?next=${encodeURIComponent(`/products/${product.slug}`)}`}><S id="signInReview" /></Link></p>}
          {reviews.length === 0 ? <p className="muted"><S id="noReviews" /></p> : <div className="shop-review-list">
            {reviews.map((r) => <article key={r.id} className="shop-review">
              <header><strong>{maskName(r.user.name)}</strong><Stars value={r.rating} /><span className="muted small">{r.createdAt.toLocaleDateString("uz-UZ")}</span><span className="shop-verified">Xarid qilgan</span></header>
              {r.pros && <p><b><S id="pros" />:</b> {r.pros}</p>}
              {r.cons && <p><b><S id="cons" />:</b> {r.cons}</p>}
              <p>{r.comment}</p>
            </article>)}
          </div>}
        </section>
      }
    ]} />

    <ProductGuidance name={product.name} warranty={product.warrantyDescription} />
    {related.length > 0 && <section className="shop-section">
      <h2><S id="related" /></h2>
      <div className="shop-grid" style={{ marginTop: 14 }}>
        {related.map((r) => <Link key={r.id} className="shop-card" href={`/products/${r.slug}`}>
          <ProductMedia assets={getMedia(r.media)} title={r.name} slug={r.slug} categorySlug={r.category?.slug} />
          <div className="shop-card-body"><h2>{r.name}</h2><span className="shop-price">{r.priceMinor === null ? <S id="priceRequest" /> : <CurrencyPrice amountMinor={r.priceMinor} currency={r.currency} />}</span></div>
        </Link>)}
      </div>
    </section>}
  </div>;
}
