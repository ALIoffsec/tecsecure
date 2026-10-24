import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LocalizedText } from "@/components/site-preferences";
import { AddToCartButton } from "@/components/cart";
import { MediaGallery } from "@/components/media-uploader";
import { getProductStockMessageKey } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({ where: { slug, status: "PUBLISHED" } });
  if (!product) notFound();
  return <article className="container page-shell" style={{ maxWidth: 850 }}>
    <span className="eyebrow">{product.brand ?? <LocalizedText id="product" />}</span><h1 className="page-title">{product.name}</h1>
    <p className="page-intro">{product.description}</p>
    <MediaGallery media={product.media} title={product.name} />
    <div className="panel-card stack">
      <p><LocalizedText id="modelLabel" />: {product.model ?? <LocalizedText id="notProvided" />} · SKU: {product.sku ?? <LocalizedText id="notProvided" />}</p>
      <p><LocalizedText id="priceOnRequest" />: {product.priceMinor === null ? <LocalizedText id="technicalProposal" /> : `${(product.priceMinor / 100).toLocaleString("uz-UZ")} ${product.currency}`}</p>
      <p><LocalizedText id="stockLabel" />: <LocalizedText id={getProductStockMessageKey(product.stockStatus)} /></p>
      <p><LocalizedText id="guarantee" />: {product.warrantyDescription ?? <LocalizedText id="guaranteeNotProvided" />}</p>
      <p className="muted"><LocalizedText id="specificationsNotice" /></p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <AddToCartButton product={{ productId: product.id, name: product.name, slug: product.slug }} disabled={product.stockStatus === "OUT_OF_STOCK"} />
        <Link className="button secondary" href="/cart">Savat</Link>
        <Link className="button secondary" href="/request-quote"><LocalizedText id="addToProject" /></Link>
      </div>
    </div>
  </article>;
}
