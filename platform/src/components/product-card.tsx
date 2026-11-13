import Link from "next/link";
import { AddToCartButton } from "@/components/cart";
import { CurrencyPrice } from "@/components/currency-context";
import { CompareButton } from "@/components/product-compare";
import { ProductMedia } from "@/components/product-media";
import { ProductQuickView } from "@/components/product-quick-view";
import { ShopText as S } from "@/components/shop-text";
import { Localized } from "@/components/localized";
import { detailRows, type CatalogMedia } from "@/lib/catalog-utils";
import { categoryName, perLocale, productVariants } from "@/lib/product-i18n";

const stockValues = ["IN_STOCK", "ON_REQUEST", "OUT_OF_STOCK", "UNKNOWN"] as const;
const stockClass = { IN_STOCK: "in", OUT_OF_STOCK: "out", ON_REQUEST: "req", UNKNOWN: "" } as const;

export type ProductCardRecord = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  model: string | null;
  description: string;
  priceMinor: number | null;
  currency: string;
  stockStatus: string;
  specifications: unknown;
  translations?: unknown;
  category: { name: string; slug: string } | null;
};

export function ProductCard({ product, assets }: { product: ProductCardRecord; assets: CatalogMedia[] }) {
  const stock = stockValues.find(value => value === product.stockStatus) ?? "UNKNOWN";
  const text = productVariants(product);
  const href = `/products/${product.slug}`;
  const eyebrow = perLocale(locale => [product.brand, product.category ? categoryName(product.category.name, locale) : null].filter(Boolean).join(" · ") || "Tecsecure");
  return <article className="shop-card is-clickable-card">
    <div className="shop-card-stage">
      <Link className="shop-card-media" href={href} aria-label={product.name} tabIndex={-1}>
        <ProductMedia assets={assets} title={product.name} slug={product.slug} categorySlug={product.category?.slug} />
      </Link>
      <div className="shop-card-tools">
        <ProductQuickView iconOnly text={text} product={{ id: product.id, slug: product.slug, name: product.name, priceMinor: product.priceMinor, currency: product.currency, stockStatus: stock, categorySlug: product.category?.slug, assets}} />
        <CompareButton iconOnly product={{ id: product.id, name: product.name, category: product.category?.slug ?? "" }} />
      </div>
    </div>
    <div className="shop-card-body">
      <span className="shop-card-cat"><Localized values={eyebrow} /></span>
      <h2><Link className="card-link" href={href}><Localized values={perLocale(locale => text[locale].name)} /></Link></h2>
      {product.model && <span className="shop-card-model">{product.model}</span>}
      <Localized values={perLocale(locale => {
        const specs = detailRows(text[locale].specifications);
        return specs.length > 0
          ? <ul className="shop-card-specs">{specs.slice(0, 3).map(([key, value], index) => <li key={index} title={key ? `${key}: ${value}` : value}>{key && <span>{key}</span>}<b>{value}</b></li>)}</ul>
          : <p className="shop-card-desc">{text[locale].description}</p>;
      })} />
      <div className="shop-card-foot">
        <div className="shop-card-price">
          <div className={`shop-price${product.priceMinor === null ? " is-request" : ""}`}>{product.priceMinor === null ? <S id="priceRequest" /> : <CurrencyPrice amountMinor={product.priceMinor} currency={product.currency} />}</div>
          <span className={`shop-stock ${stockClass[stock]}`}><S id={stock} /></span>
        </div>
        <AddToCartButton product={{ productId: product.id, name: product.name, slug: product.slug, categorySlug: product.category?.slug }} disabled={stock === "OUT_OF_STOCK"} />
      </div>
    </div>
  </article>;
}
