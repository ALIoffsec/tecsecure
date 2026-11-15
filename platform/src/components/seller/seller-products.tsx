"use client";

import { useEffect, useMemo, useState } from "react";
import { useSitePreferences } from "../site-preferences";
import { BottomActions, confirmAction, haptic, useBackButton } from "../tma-kit";
import { sellerAppCopy } from "@/lib/seller-app-copy";
import { formatDate, formatMinor } from "@/lib/format";
import { sellerApi, toMajor, toMinor, useSellerData } from "./seller-api";
import { SellerSkeleton } from "./seller-home";
import { productState, type ProductState, type SellerProduct } from "./seller-types";
import type { SellerNav } from "./seller-app";

type Filter = "all" | ProductState;
const filters: Filter[] = ["all", "sale", "review", "rejected", "hidden", "out"];
const stateClass: Record<ProductState, string> = { sale: "is-delivered", review: "is-new", rejected: "is-cancelled", hidden: "", out: "is-cancelled" };

const price = (product: Pick<SellerProduct, "priceMinor" | "currency">, locale: string) => product.priceMinor === null ? "—" : formatMinor(product.priceMinor, product.currency, locale);
const advertised = (product: Pick<SellerProduct, "promotedUntil">) => Boolean(product.promotedUntil && new Date(product.promotedUntil) > new Date());

export function SellerProducts({ nav }: { nav: SellerNav }) {
  const { locale } = useSitePreferences();
  const c = sellerAppCopy[locale];
  const { data, failed, reload } = useSellerData<{ products: SellerProduct[] }>("/api/shop/products");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const list = useMemo(() => (data?.products ?? []).filter(product => (filter === "all" || productState(product) === filter)
    && (!query.trim() || `${product.name} ${product.brand ?? ""} ${product.model ?? ""} ${product.sku ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()))), [data, filter, query]);
  if (failed && !data) return <div className="tma-empty"><p>{c.common.failed}</p><button type="button" className="tma-button secondary" onClick={reload}>{c.common.retry}</button></div>;
  if (!data) return <SellerSkeleton />;
  return <>
    <div className="tma-title-row"><h1 className="tma-title">{c.products.title}</h1><button type="button" className="tma-chip is-primary" onClick={() => nav.go({ kind: "editor", id: null })}>+ {c.products.add}</button></div>
    {data.products.length === 0 ? <div className="tma-empty"><p>{c.products.emptyAll}</p><button type="button" className="tma-button" onClick={() => nav.go({ kind: "editor", id: null })}>+ {c.products.add}</button></div> : <>
      <input className="tma-search" type="search" value={query} placeholder={c.products.search} onChange={event => setQuery(event.target.value)} />
      <div className="tma-segmented tma-chips-scroll" role="tablist">
        {filters.map(key => <button key={key} type="button" role="tab" aria-selected={filter === key} onClick={() => { haptic.select(); setFilter(key); }}>
          {c.products.filters[key]} · {key === "all" ? data.products.length : data.products.filter(product => productState(product) === key).length}
        </button>)}
      </div>
      {list.length === 0 ? <p className="tma-empty">{c.products.empty}</p> : <section className="tma-section tma-list">
        {list.map(product => {
          const state = productState(product);
          return <button type="button" className="tma-product-row" key={product.id} onClick={() => nav.go({ kind: "product", id: product.id })}>
            <span className="tma-thumb">{product.media?.[0] ? <img src={`/api/media/${product.media[0]}`} alt="" loading="lazy" /> : null}</span>
            <span className="tma-product-body">
              <strong>{product.name}</strong>
              <span className="tma-item-sub">{price(product, locale)} · {c.products.stock}: {product.stockQuantity ?? c.products.notCounted}</span>
              <span className="tma-item-meta">{product.sold} {c.products.sold} · {product.viewCount} {c.products.views}</span>
            </span>
            <span className="tma-product-tags">
              <span className={`tma-pill ${stateClass[state]}`}>{c.products.state[state]}</span>
              {advertised(product) && <span className="tma-pill is-ad">{c.products.ad}</span>}
            </span>
          </button>;
        })}
      </section>}
    </>}
  </>;
}

export function SellerProductDetail({ id, nav }: { id: string; nav: SellerNav }) {
  const { locale } = useSitePreferences();
  const c = sellerAppCopy[locale];
  const { data, failed, reload, setData } = useSellerData<{ product: SellerProduct }>(`/api/shop/products/${id}`);
  const promotion = useSellerData<{ promotion: { pricePerDayMinor: number | null; maxDays: number }; balanceMinor: number }>(`/api/shop/products/${id}/promote`);
  const [priceText, setPriceText] = useState("");
  const [stockText, setStockText] = useState("");
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  useBackButton(nav.back);
  const product = data?.product ?? null;
  useEffect(() => {
    if (!product) return;
    setPriceText(toMajor(product.priceMinor));
    setStockText(product.stockQuantity === null ? "" : String(product.stockQuantity));
  }, [product]);

  async function patch(body: object) {
    setBusy(true);
    const result = await sellerApi<{ product: SellerProduct }>(`/api/shop/products/${id}`, { method: "PATCH", body });
    setBusy(false);
    if (!result.ok) { haptic.error(); nav.error(result.error); return; }
    haptic.success();
    setData({ product: { ...result.data.product, sold: product?.sold ?? 0 } });
    nav.notice(c.common.done);
  }

  async function saveQuick() {
    const priceMinor = toMinor(priceText);
    const stock = stockText.trim() === "" ? null : Number(stockText);
    if (priceMinor === null || (stock !== null && (!Number.isInteger(stock) || stock < 0))) { nav.error(c.editor.required); return; }
    await patch({ priceMinor, stockQuantity: stock });
  }

  async function remove() {
    if (!(await confirmAction(c.products.removeConfirm))) return;
    setBusy(true);
    const result = await sellerApi(`/api/shop/products/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!result.ok) { nav.error(result.error); return; }
    nav.notice(c.common.done);
    nav.tab("products");
  }

  async function promote() {
    setBusy(true);
    const result = await sellerApi<{ promotedUntil: string; balanceMinor: number }>(`/api/shop/products/${id}/promote`, { method: "POST", body: { days } });
    setBusy(false);
    if (!result.ok) { haptic.error(); nav.error(result.error); return; }
    haptic.success();
    nav.notice(`${c.products.ad} · ${formatDate(result.data.promotedUntil)} ${c.products.adUntil}`);
    setShowPromo(false);
    reload();
    promotion.reload();
  }

  if (failed && !data) return <div className="tma-empty"><p>{c.common.failed}</p><button type="button" className="tma-button secondary" onClick={reload}>{c.common.retry}</button></div>;
  if (!product) return <SellerSkeleton />;
  const state = productState(product);
  const promo = promotion.data?.promotion;
  const cost = promo?.pricePerDayMinor ? promo.pricePerDayMinor * days : null;

  return <>
    <header className="tma-detail-head">
      <span className="tma-eyebrow">{product.category?.name ?? ""}</span>
      <h1>{product.name}</h1>
      <span className="tma-product-tags is-row"><span className={`tma-pill ${stateClass[state]}`}>{c.products.state[state]}</span>
        {advertised(product) && <span className="tma-pill is-ad">{c.products.ad} · {formatDate(product.promotedUntil!)} {c.products.adUntil}</span>}</span>
    </header>
    {state === "rejected" && product.moderationNote && <p className="tma-notice is-danger"><b>{c.products.reason}:</b> {product.moderationNote}</p>}
    {state === "review" && <p className="tma-notice">{c.editor.reviewNote}</p>}

    {product.media && product.media.length > 0 && <div className="tma-gallery">{product.media.map(mediaId => <img key={mediaId} src={`/api/media/${mediaId}`} alt="" loading="lazy" />)}</div>}

    <div className="tma-stats is-three">
      <div className="tma-stat"><strong>{price(product, locale)}</strong><span>{c.products.price}</span></div>
      <div className="tma-stat"><strong>{product.sold}</strong><span>{c.products.sold}</span></div>
      <div className="tma-stat"><strong>{product.viewCount}</strong><span>{c.products.views}</span></div>
    </div>

    <h2 className="tma-section-title">{c.products.quick}</h2>
    <section className="tma-section tma-form">
      <div className="tma-form-row">
        <div className="field"><label htmlFor="quick-price">{c.products.price} ({product.currency})</label><input id="quick-price" inputMode="decimal" value={priceText} onChange={event => setPriceText(event.target.value)} /></div>
        <div className="field"><label htmlFor="quick-stock">{c.products.stock}</label><input id="quick-stock" inputMode="numeric" value={stockText} placeholder={c.products.notCounted} onChange={event => setStockText(event.target.value.replace(/\D/g, ""))} /></div>
      </div>
      <button type="button" className="tma-button secondary" disabled={busy} onClick={() => void saveQuick()}>{c.products.saveQuick}</button>
    </section>

    {showPromo && <>
      <h2 className="tma-section-title">{c.products.promoteTitle}</h2>
      <section className="tma-section tma-form">
        {!promo?.pricePerDayMinor ? <p className="tma-hint tma-hint-flat">{c.products.promoteOff}</p>
          : state !== "sale" ? <p className="tma-hint tma-hint-flat">{c.products.promoteOnlySale}</p>
          : <>
            <p className="tma-hint tma-hint-flat">{c.products.promoteHint}</p>
            <div className="field"><label htmlFor="promo-days">{c.products.days}: {days}</label>
              <input id="promo-days" type="range" min={1} max={promo.maxDays} value={days} onChange={event => setDays(Number(event.target.value))} /></div>
            <dl className="tma-rows">
              <div><dt>{c.products.perDay}</dt><dd>{formatMinor(promo.pricePerDayMinor, "UZS", locale)}</dd></div>
              <div><dt>{c.products.total}</dt><dd><b>{cost !== null ? formatMinor(cost, "UZS", locale) : "—"}</b></dd></div>
              <div><dt>{c.home.balance}</dt><dd>{formatMinor(promotion.data?.balanceMinor ?? 0, "UZS", locale)}</dd></div>
            </dl>
            <button type="button" className="tma-button" disabled={busy || cost === null || (promotion.data?.balanceMinor ?? 0) < cost} onClick={() => void promote()}>
              {cost !== null && (promotion.data?.balanceMinor ?? 0) < cost ? c.products.balanceLow : c.products.buy}
            </button>
          </>}
      </section>
    </>}

    <section className="tma-section tma-list">
      {!showPromo && <button type="button" className="tma-row-button" onClick={() => setShowPromo(true)}>⬆ {c.products.promote}</button>}
      {product.moderation === "APPROVED" && <button type="button" className="tma-row-button" disabled={busy} onClick={() => void patch({ sellerHidden: !product.sellerHidden })}>{product.sellerHidden ? c.products.show : c.products.hide}</button>}
      {product.status === "PUBLISHED" && <a className="tma-row-button" href={`/products/${product.slug}`} target="_blank" rel="noreferrer">{c.products.onSite}</a>}
      <button type="button" className="tma-row-button is-danger" disabled={busy} onClick={() => void remove()}>{c.products.remove}</button>
    </section>
    <BottomActions main={{ text: c.products.edit, onClick: () => nav.go({ kind: "editor", id: product.id }) }} />
  </>;
}
