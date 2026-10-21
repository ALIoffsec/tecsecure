import { LocalizedText } from "@/components/site-preferences";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getProductStockMessageKey } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      brand: true,
      model: true,
      priceMinor: true,
      currency: true,
      stockStatus: true,
      warrantyDescription: true,
      category: { select: { name: true } }
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }]
  });
  return <div className="container page-shell">
    <span className="eyebrow"><LocalizedText id="products" /></span>
    <h1 className="page-title"><LocalizedText id="productsPageTitle" /></h1>
    <p className="page-intro"><LocalizedText id="verifiedCatalog" /></p>
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
        <Link className="button secondary" href={`/products/${product.slug}`}><LocalizedText id="details" /></Link>
      </article>)}
    </div> : <div className="empty-state"><p><LocalizedText id="noProducts" /></p></div>}
  </div>;
}
