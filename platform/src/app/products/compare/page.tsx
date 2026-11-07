import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { comparisonIds, detailRows } from "@/lib/catalog-utils";
import { catalogMedia } from "@/lib/catalog-media";
import { ShopText as S } from "@/components/shop-text";
import { ProductMedia } from "@/components/product-media";
import { CurrencyPrice } from "@/components/currency-context";
import { CompareTray } from "@/components/product-compare";
import { AddToCartButton } from "@/components/cart";
import { Localized } from "@/components/localized";
import { perLocale, productVariants } from "@/lib/product-i18n";

export const dynamic = "force-dynamic";
export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const raw = (await searchParams).ids;
  const ids = comparisonIds(typeof raw === "string" ? raw : undefined);
  const products = ids.length ? await prisma.product.findMany({ where: { id: { in: ids }, status: "PUBLISHED" }, include: { category: true } }) : [];
  products.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  const valid = products.length === ids.length && products.length >= 2 && new Set(products.map(product => product.categoryId)).size === 1;
  const getMedia = await catalogMedia(products);
  const rowsOf = (product: typeof products[number], locale: "uz" | "ru" | "en") => detailRows(productVariants(product)[locale].specifications);
  return <div className="container page-shell">
    <nav className="shop-crumbs"><Link href="/products"><S id="catalog" /></Link><span>/</span><span aria-current="page"><S id="compare" /></span></nav>
    <h1 className="page-title" id="compare-heading"><S id="compareTitle" /></h1><p className="page-intro"><S id="compareHint" /></p>
    <CompareTray />
    {!valid ? <div className="panel-card"><p role="status"><S id={ids.length < 2 ? "compareEmpty" : "compareInvalid"} /></p><Link className="button" href="/products"><S id="back" /></Link></div> : <div className="compare-scroll" tabIndex={0} role="region" aria-labelledby="compare-heading">
      <table className="compare-table">
        <caption className="sr-only"><S id="compareTitle" /></caption>
        <thead><tr><th scope="col"><S id="specs" /></th>{products.map(product => <th scope="col" key={product.id}><Link href={`/products/${product.slug}`}><Localized values={perLocale(locale => productVariants(product)[locale].name)} /></Link></th>)}</tr></thead>
        <tbody>
          <tr><th scope="row"><S id="photo" /></th>{products.map(product => <td key={product.id}><ProductMedia assets={getMedia(product.media)} title={product.name} slug={product.slug} categorySlug={product.category?.slug} /></td>)}</tr>
          <tr><th scope="row"><S id="price" /></th>{products.map(product => <td key={product.id}>{product.priceMinor === null ? <S id="priceRequest" /> : <CurrencyPrice amountMinor={product.priceMinor} currency={product.currency} />}</td>)}</tr>
          <tr><th scope="row"><S id="stock" /></th>{products.map(product => <td key={product.id}><S id={product.stockStatus === "IN_STOCK" ? "IN_STOCK" : product.stockStatus === "ON_REQUEST" ? "ON_REQUEST" : product.stockStatus === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "UNKNOWN"} /></td>)}</tr>
          <tr><th scope="row"><S id="brand" /> / <S id="model" /></th>{products.map(product => <td key={product.id}>{[product.brand, product.model].filter(Boolean).join(" / ") || "—"}</td>)}</tr>
          <Localized values={perLocale(locale => [...new Set(products.flatMap(product => rowsOf(product, locale).map(([key]) => key)))].map(key => {
            const values = products.map(product => rowsOf(product, locale).find(([name]) => name === key)?.[1] ?? "—");
            const different = new Set(values).size > 1;
            return <tr key={key} className={different ? "compare-difference" : undefined}><th scope="row">{key}{different && " ≠"}</th>{values.map((value, index) => <td key={products[index].id}>{value}</td>)}</tr>;
          }))} />
          <tr><th scope="row"><S id="compatibility" /></th>{products.map(product => <td key={product.id}><Localized values={perLocale(locale => detailRows(productVariants(product)[locale].compatibility).map(([key, value]) => `${key ? `${key}: ` : ""}${value}`).join("; ") || "—")} /></td>)}</tr>
          <tr><th scope="row"><S id="warranty" /></th>{products.map(product => <td key={product.id}>{product.warrantyDescription || "—"}</td>)}</tr>
          <tr><th scope="row"><S id="purchase" /></th>{products.map(product => <td key={product.id}><AddToCartButton product={{ productId: product.id, name: product.name, slug: product.slug, categorySlug: product.category?.slug }} disabled={product.stockStatus === "OUT_OF_STOCK"} /></td>)}</tr>
        </tbody>
      </table>
    </div>}
  </div>;
}
