import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AddToCartButton } from "@/components/cart";
import { MobileBuyBar, ProductTrust, RecentlyViewed, TrackProductView } from "@/components/shop-extras";
import { ProductGallery } from "@/components/product-media";
import { ProductCard } from "@/components/product-card";
import { ProductGuidance } from "@/components/product-guidance";
import { CompareButton, CompareTray } from "@/components/product-compare";
import { ShopText as S } from "@/components/shop-text";
import { catalogMedia } from "@/lib/catalog-media";
import { coverMedia, detailRows } from "@/lib/catalog-utils";
import { inquiryHref } from "@/lib/journey-copy";
import { AnswerForm, QuestionForm, ReviewForm } from "@/components/product-feedback";
import { ExpandableText, ProductDetailTabs } from "@/components/product-detail-tabs";
import { CurrencyPrice, CurrencySelector } from "@/components/currency-context";
import { formatDate } from "@/lib/format";
import { Localized, LocalizedSpecs, LocalizedText } from "@/components/localized";
import { categoryName, perLocale, productVariants } from "@/lib/product-i18n";
import type { Locale } from "@/lib/messages";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

const schemaAvailability: Record<string, string> = {
  IN_STOCK: "https://schema.org/InStock",
  OUT_OF_STOCK: "https://schema.org/OutOfStock",
  ON_REQUEST: "https://schema.org/PreOrder"
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({ where: { slug, status: "PUBLISHED" }, select: { name: true, description: true, media: true } });
  if (!product) return { title: "Tecsecure" };
  const cover = coverMedia((await catalogMedia([product]))(product.media));
  const description = product.description.slice(0, 160);
  return {
    title: `${product.name} — Tecsecure`,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: { title: product.name, description, type: "website", images: cover?.mimeType.startsWith("image/") ? [`/api/media/${cover.id}`] : undefined }
  };
}

function maskName(name: string) {
  const [first, second] = name.trim().split(/\s+/);
  return second ? `${first} ${second[0]}.` : first;
}

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return <span className="shop-stars" role="img" aria-label={`${value.toFixed(1)} / 5`}>{[1, 2, 3, 4, 5].map((n) => <span key={n} className={n <= rounded ? "on" : ""}>★</span>)}</span>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({ where: { slug, status: "PUBLISHED" }, include: { category: true } });
  if (!product) notFound();
  const user = await getCurrentUser();
  const isCustomer = user?.role === "CUSTOMER";
  const canAnswer = Boolean(user && (user.role === "FOUNDER" || user.role === "ADMIN" || (user.role === "STAFF" && user.permissions.includes("PRODUCTS"))));

  const [related, reviews, questions, canReview, alreadyReviewed] = await Promise.all([
    product.categoryId ? prisma.product.findMany({
      where: { status: "PUBLISHED", id: { not: product.id }, categoryId: product.categoryId },
      include: { category: { select: { name: true, slug: true } } },
      take: 4
    }) : [],
    prisma.productReview.findMany({ where: { productId: product.id }, orderBy: { createdAt: "desc" }, take: 50, include: { user: { select: { name: true } } } }),
    prisma.productQuestion.findMany({
      where: { productId: product.id, ...(canAnswer ? {} : { OR: [{ answer: { not: null } }, ...(user ? [{ userId: user.id }] : [])] }) },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { name: true } } }
    }),
    isCustomer ? prisma.orderItem.findFirst({ where: { productId: product.id, order: { customerId: user.id, status: "DELIVERED" } }, select: { id: true } }) : null,
    isCustomer ? prisma.productReview.findUnique({ where: { productId_userId: { productId: product.id, userId: user.id } }, select: { id: true } }) : null
  ]);

  const getMedia = await catalogMedia([product, ...related]);
  const assets = getMedia(product.media);
  const text = productVariants(product);
  const names = perLocale((locale) => text[locale].name);
  const descriptions = perLocale((locale) => text[locale].description);
  const detailSpecsFor = (locale: Locale) => {
    const rows: [ReactNode, string][] = [...detailRows(text[locale].specifications)];
    if (product.brand) rows.unshift([<S id="brand" key="brand" />, product.brand]);
    if (product.model) rows.unshift([<S id="model" key="model" />, product.model]);
    if (product.sku) rows.push(["SKU", product.sku]);
    if (product.warrantyDescription) rows.push([<S id="warranty" key="warranty" />, product.warrantyDescription]);
    for (const [label, value] of detailRows(text[locale].compatibility)) rows.push([label || <S id="compatibility" key={value} />, value]);
    return rows;
  };
  const priced = product.priceMinor !== null;
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const distribution = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));
  const stockKey = product.stockStatus === "IN_STOCK" || product.stockStatus === "ON_REQUEST" || product.stockStatus === "OUT_OF_STOCK" ? product.stockStatus : "UNKNOWN";
  const cover = coverMedia(assets);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(cover?.mimeType.startsWith("image/") ? { image: `/api/media/${cover.id}` } : {}),
    ...(reviews.length ? { aggregateRating: { "@type": "AggregateRating", ratingValue: average.toFixed(1), reviewCount: reviews.length } } : {}),
    ...(priced ? { offers: { "@type": "Offer", price: (product.priceMinor as number) / 100, priceCurrency: product.currency, ...(schemaAvailability[stockKey] ? { availability: schemaAvailability[stockKey] } : {}) } } : {})
  };
  return <div className="container page-shell shop-page">
    {/* "<" is escaped so catalog text cannot close the script element. */}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <nav className="shop-crumbs" aria-label="Breadcrumb">
      <Link href="/products"><S id="catalog" /></Link><span>/</span>
      {product.category && <><Link href={`/products?category=${product.category.slug}`}><Localized values={perLocale((locale) => categoryName(product.category!.name, locale))} /></Link><span>/</span></>}
      <span aria-current="page"><Localized values={names} /></span>
    </nav>

    <CompareTray />
    <div className="shop-pdp">
      <div className="shop-pdp-media">
        <ProductGallery assets={assets} title={product.name} slug={product.slug} categorySlug={product.category?.slug} />
      </div>

      <div className="shop-pdp-info">
        {(product.brand || product.category) && <span className="shop-card-cat"><Localized values={perLocale((locale) => [product.brand, product.category ? categoryName(product.category.name, locale) : null].filter(Boolean).join(" · "))} /></span>}
        <h1><Localized values={names} /></h1>
        <div className="shop-meta-row">
          {reviews.length > 0 && <div className="shop-rating-link">
            <Stars value={average} />
            <strong>{average.toFixed(1)}</strong>
            <span className="muted">{reviews.length} <S id="reviews" /></span>
          </div>}
          {product.sku && <span className="muted">SKU: {product.sku}</span>}
        </div>
        <Localized values={perLocale((locale) => {
          const specs = detailRows(text[locale].specifications);
          return specs.length > 0
            ? <ul className="shop-highlights">
              {product.model && <li><span><S id="model" /></span><strong>{product.model}</strong></li>}
              {specs.slice(0, 5).map(([k, v], i) => <li key={`${k}-${i}`}><span>{k || "•"}</span><strong>{v}</strong></li>)}
            </ul>
            : <div className="shop-pdp-lead"><ExpandableText text={text[locale].description} /></div>;
        })} />
      </div>

      <aside className="shop-buybox" aria-label="Xarid">
        <div className={`shop-price${priced ? "" : " is-request"}`}>
          {priced ? <CurrencyPrice amountMinor={product.priceMinor!} currency={product.currency} /> : <S id="priceRequest" />}
        </div>
        <span className={`shop-stock ${stockKey === "IN_STOCK" ? "in" : stockKey === "OUT_OF_STOCK" ? "out" : stockKey === "ON_REQUEST" ? "req" : ""}`}><S id={stockKey} /></span>
        <AddToCartButton product={{ productId: product.id, name: product.name, slug: product.slug, categorySlug: product.category?.slug ?? null }} disabled={stockKey === "OUT_OF_STOCK"} />
        <ProductTrust />
        <Link className="button secondary" href={inquiryHref(product.name)}><S id="quote" /></Link>
        <CompareButton product={{ id: product.id, name: product.name, category: product.category?.slug ?? "" }} />
        <CurrencySelector />
      </aside>
    </div>

    <ProductDetailTabs tabs={[
      {
        id: "description",
        label: <S id="description" />,
        content: <section>
          <h2><S id="description" /></h2>
          <LocalizedText values={descriptions} />
        </section>
      },
      {
        id: "specs",
        label: <S id="specs" />,
        content: <section>
          <h2><S id="specs" /></h2>
          <LocalizedSpecs rows={perLocale(detailSpecsFor)} />
        </section>
      },
      {
        id: "reviews",
        label: <S id="reviews" />,
        count: reviews.length,
        content: <section>
          <h2><S id="reviews" /></h2>
          {reviews.length > 0 && <div className="shop-reviews-head">
            <div className="shop-score"><strong>{average.toFixed(1)}</strong><Stars value={average} /><span className="muted small">{reviews.length} <S id="reviews" /></span></div>
            <div className="shop-dist">
              {distribution.map(({ n, count }) => <div key={n}><span>{n} ★</span><div className="shop-bar"><i style={{ width: `${(count / reviews.length) * 100}%` }} /></div><span>{count}</span></div>)}
            </div>
          </div>}
          {isCustomer && canReview && !alreadyReviewed && <ReviewForm productId={product.id} />}
          {isCustomer && !canReview && <p className="small muted"><S id="reviewNote" /></p>}
          {!user && <p className="small muted"><Link href={`/login?next=${encodeURIComponent(`/products/${product.slug}`)}`}><S id="signInReview" /></Link></p>}
          {reviews.length === 0 ? <p className="muted"><S id="noReviews" /></p> : <div className="shop-review-list">
            {reviews.map((r) => <article key={r.id} className="shop-review">
              <header><strong>{maskName(r.user.name)}</strong><Stars value={r.rating} /><span className="muted small">{formatDate(r.createdAt)}</span><span className="shop-verified"><S id="verifiedBuyer" /></span></header>
              {r.pros && <p><b><S id="pros" />:</b> {r.pros}</p>}
              {r.cons && <p><b><S id="cons" />:</b> {r.cons}</p>}
              <p>{r.comment}</p>
            </article>)}
          </div>}
        </section>
      },
      {
        id: "questions",
        label: <S id="questions" />,
        count: questions.length,
        content: <section>
          <h2><S id="questions" /></h2>
          {isCustomer && <QuestionForm productId={product.id} />}
          {!user && <p className="small muted"><Link href={`/login?next=${encodeURIComponent(`/products/${product.slug}`)}`}><S id="signInQuestion" /></Link></p>}
          {questions.length === 0 ? <p className="muted"><S id="noQuestions" /></p> : <div className="shop-review-list">
            {questions.map((q) => <article key={q.id} className="shop-review">
              <header><strong>{maskName(q.user.name)}</strong><span className="muted small">{formatDate(q.createdAt)}</span></header>
              <p>{q.question}</p>
              {q.answer ? <p className="shop-answer"><b>Tecsecure:</b> {q.answer}</p> : canAnswer ? <AnswerForm productId={product.id} questionId={q.id} /> : <p className="small muted"><S id="awaitingAnswer" /></p>}
            </article>)}
          </div>}
        </section>
      }
    ]} />

    <ProductGuidance name={product.name} warranty={product.warrantyDescription} />
    {related.length > 0 && <section className="shop-section">
      <h2><S id="related" /></h2>
      <div className="shop-grid shop-grid-related">
        {related.map((item) => <ProductCard key={item.id} product={item} assets={getMedia(item.media)} />)}
      </div>
    </section>}
    <RecentlyViewed exclude={product.slug} />
    <TrackProductView product={{ slug: product.slug, name: product.name, imageId: cover?.mimeType.startsWith("image/") ? cover.id : null, priceMinor: product.priceMinor, currency: product.currency }} />
    <MobileBuyBar anchor=".shop-add-to-cart" line={{ productId: product.id, name: product.name, slug: product.slug, categorySlug: product.category?.slug ?? null }} priceMinor={product.priceMinor} currency={product.currency} available={stockKey !== "OUT_OF_STOCK"} />
  </div>;
}
