import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { MediaGallery } from "@/components/media-uploader";
import { AddToCartButton, CartFab } from "@/components/cart";
import { ProductVisual } from "@/components/product-visual";
import { AnswerForm, QuestionForm, ReviewForm } from "@/components/product-feedback";

export const dynamic = "force-dynamic";

const stockLabels: Record<string, string> = { IN_STOCK: "Omborda bor", ON_REQUEST: "So‘rov bo‘yicha", OUT_OF_STOCK: "Omborda yo‘q" };

function specRows(value: unknown): [string, string][] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string").map((v) => ["", v]);
  return Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => typeof v === "string" || typeof v === "number")
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
  const isStaff = !!user && !isCustomer;

  const [related, reviews, questions, canReview, alreadyReviewed] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLISHED", id: { not: product.id }, ...(product.categoryId ? { categoryId: product.categoryId } : {}) },
      select: { id: true, name: true, slug: true, priceMinor: true, currency: true },
      take: 4
    }),
    prisma.productReview.findMany({ where: { productId: product.id }, orderBy: { createdAt: "desc" }, take: 50, include: { user: { select: { name: true } } } }),
    prisma.productQuestion.findMany({ where: { productId: product.id }, orderBy: { createdAt: "desc" }, take: 50, include: { user: { select: { name: true } } } }),
    isCustomer ? prisma.orderItem.findFirst({ where: { productId: product.id, order: { customerId: user.id, status: "DELIVERED" } }, select: { id: true } }) : null,
    isCustomer ? prisma.productReview.findUnique({ where: { productId_userId: { productId: product.id, userId: user.id } }, select: { id: true } }) : null
  ]);

  const specs = specRows(product.specifications);
  const compatibility = specRows(product.compatibility);
  const hasMedia = Array.isArray(product.media) && product.media.length > 0;
  const priced = product.priceMinor !== null;
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const distribution = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }));
  const priceText = priced ? `${(product.priceMinor! / 100).toLocaleString("uz-UZ")} ${product.currency}` : "Narx so‘rov bo‘yicha";

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
          <a href="#reviews" className="shop-rating-link">
            <Stars value={average} />
            <strong>{reviews.length ? average.toFixed(1) : "—"}</strong>
            <span className="muted">{reviews.length ? `${reviews.length} ta sharh` : "Sharhlar yo‘q"}</span>
          </a>
          <a href="#questions" className="muted">{questions.length} ta savol</a>
          {product.sku && <span className="muted">Kod: {product.sku}</span>}
        </div>
        <ul className="shop-highlights">
          {product.brand && <li><span>Brend</span><strong>{product.brand}</strong></li>}
          {product.model && <li><span>Model</span><strong>{product.model}</strong></li>}
          {product.category && <li><span>Kategoriya</span><strong>{product.category.name}</strong></li>}
          {specs.slice(0, 4).map(([k, v], i) => <li key={`${k}-${i}`}><span>{k || "•"}</span><strong>{v}</strong></li>)}
        </ul>
        <p className="muted">{product.description.length > 220 ? `${product.description.slice(0, 220)}…` : product.description} <a href="#description">Batafsil</a></p>
      </div>

      <aside className="shop-buybox" aria-label="Xarid">
        <div className={`shop-price${priced ? "" : " is-request"}`} style={{ fontSize: "1.6rem" }}>{priceText}</div>
        <span className={`shop-stock ${product.stockStatus === "IN_STOCK" ? "in" : product.stockStatus === "OUT_OF_STOCK" ? "out" : "req"}`}>{stockLabels[product.stockStatus] ?? "Noma’lum"}</span>
        <AddToCartButton product={{ productId: product.id, name: product.name, slug: product.slug, categorySlug: product.category?.slug ?? null }} disabled={product.stockStatus === "OUT_OF_STOCK"} />
        <Link className="button ghost" href="/request-quote">Texnik taklif so‘rash</Link>
        <ul className="shop-perks">
          <li>{priced ? "Narx buyurtma tasdiqlanganda yakunlanadi" : "Narx va mavjudlik xodim tomonidan tasdiqlanadi"}</li>
          <li>Yetkazib berish: manzilni xaritada tanlaysiz</li>
          <li>{product.warrantyDescription ?? "Kafolat muddati taklifda ko‘rsatiladi"}</li>
          <li>Buyurtma holatini kuzatish mumkin</li>
        </ul>
      </aside>
    </div>

    <nav className="shop-tabs" aria-label="Bo‘limlar">
      <a href="#description">Tavsif</a>
      <a href="#specs">Xususiyatlar</a>
      <a href="#reviews">Sharhlar <span>{reviews.length}</span></a>
      <a href="#questions">Savol-javob <span>{questions.length}</span></a>
    </nav>

    <section id="description" className="shop-section">
      <h2>Mahsulot tavsifi</h2>
      <p style={{ whiteSpace: "pre-line" }}>{product.description}</p>
    </section>

    <section id="specs" className="shop-section">
      <h2>Xususiyatlari</h2>
      <table className="shop-specs">
        <tbody>
          {product.brand && <tr><th>Brend</th><td>{product.brand}</td></tr>}
          {product.model && <tr><th>Model</th><td>{product.model}</td></tr>}
          {product.sku && <tr><th>SKU</th><td>{product.sku}</td></tr>}
          {product.warrantyDescription && <tr><th>Kafolat</th><td>{product.warrantyDescription}</td></tr>}
          {specs.map(([k, v], i) => <tr key={`${k}-${i}`}><th>{k}</th><td>{v}</td></tr>)}
          {compatibility.map(([k, v], i) => <tr key={`compat-${k}-${i}`}><th>{k || "Moslik"}</th><td>{v}</td></tr>)}
        </tbody>
      </table>
    </section>

    <section id="reviews" className="shop-section">
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

    <section id="questions" className="shop-section">
      <h2>Savol-javob</h2>
      {user ? <QuestionForm productId={product.id} /> : <p className="small muted"><Link href="/login">Kiring</Link> — savol berish uchun.</p>}
      {questions.length === 0 ? <p className="muted">Savollar hali yo‘q.</p> : <div className="shop-review-list">
        {questions.map((q) => <article key={q.id} className="shop-review">
          <header><strong>{maskName(q.user.name)}</strong><span className="muted small">{q.createdAt.toLocaleDateString("uz-UZ")}</span></header>
          <p>{q.question}</p>
          {q.answer ? <p className="shop-answer"><b>Tecsecure:</b> {q.answer}</p> : isStaff ? <AnswerForm productId={product.id} questionId={q.id} /> : <p className="muted small">Javob kutilmoqda.</p>}
        </article>)}
      </div>}
    </section>

    {related.length > 0 && <section className="shop-section">
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
