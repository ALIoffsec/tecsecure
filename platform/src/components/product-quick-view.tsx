"use client";

import Link from "next/link";
import { useState } from "react";
import type { CatalogMedia } from "@/lib/catalog-utils";
import { shopCopy } from "@/lib/shop-copy";
import { useSitePreferences } from "./site-preferences";
import { SiteDialog } from "./site-dialog";
import { ProductGallery } from "./product-media";
import { CurrencyPrice } from "./currency-context";
import { AddToCartButton } from "./cart";
import { UiIcon } from "./ui-icon";

type Product = {
  id: string; slug: string; name: string; description: string;
  priceMinor: number | null; currency: string; categorySlug?: string;
  stockStatus: "IN_STOCK" | "ON_REQUEST" | "OUT_OF_STOCK" | "UNKNOWN";
  assets: CatalogMedia[]; specs: [string, string][];
};

export function ProductQuickView({ product, iconOnly = false }: { product: Product; iconOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const { locale } = useSitePreferences();
  const c = shopCopy[locale];
  return <>
    {iconOnly
      ? <button className="shop-icon-tool" type="button" aria-haspopup="dialog" aria-label={c.quickView} title={c.quickView} onClick={() => setOpen(true)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></svg></button>
      : <button className="shop-quick-view" type="button" aria-haspopup="dialog" onClick={() => setOpen(true)}><UiIcon name="layout" size={16} />{c.quickView}</button>}
    {open && <SiteDialog className="product-quick-dialog" title={product.name} onClose={() => setOpen(false)}>
      <div className="product-quick-layout">
        <ProductGallery assets={product.assets} title={product.name} slug={product.slug} categorySlug={product.categorySlug} />
        <div className="product-quick-info">
          <span className="shop-stock">{c[product.stockStatus]}</span>
          <div className="shop-price">{product.priceMinor === null ? c.priceRequest : <CurrencyPrice amountMinor={product.priceMinor} currency={product.currency} />}</div>
          <p>{product.description}</p>
          {product.specs.length > 0 && <dl>{product.specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
          <AddToCartButton product={{ productId: product.id, name: product.name, slug: product.slug, categorySlug: product.categorySlug }} disabled={product.stockStatus === "OUT_OF_STOCK"} />
          <Link className="button secondary" href={`/products/${product.slug}`} onClick={() => setOpen(false)}>{c.details}<span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </SiteDialog>}
  </>;
}
