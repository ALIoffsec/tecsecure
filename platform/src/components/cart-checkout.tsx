"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DeliveryMap } from "@/components/delivery-map";
import { clearCart, setQuantity, useCart } from "@/components/cart";
import { ProductMedia } from "@/components/product-media";
import { ToastMessage } from "@/components/toast-provider";
import { CurrencyPrice } from "./currency-context";
import { useSitePreferences } from "./site-preferences";
import { shopCopy } from "@/lib/shop-copy";
import { journeyCopy } from "@/lib/journey-copy";
import type { CatalogMedia, QuotedProduct } from "@/lib/catalog-utils";
import { checkoutCopy } from "@/lib/checkout-copy";
import { OriginalOrderButton } from "./original-order-button";
import { startOrderMotion, type ButtonMotion } from "@/lib/button-motion";

type PreviewProduct = QuotedProduct & { name: string; slug: string; category: { slug: string } | null; assets: CatalogMedia[] };

function Steps({ current }: { current: 1 | 2 | 3 }) {
  const { locale } = useSitePreferences();
  const items = checkoutCopy[locale].steps;
  return <ol className="shop-steps" aria-label="Bosqichlar">
    {items.map((label, i) => <li key={label} className={i + 1 === current ? "is-active" : i + 1 < current ? "is-done" : ""}><span>{label}</span></li>)}
  </ol>;
}

export function CartCheckout({ canOrder = false }: { canOrder?: boolean }) {
  const { locale } = useSitePreferences();
  const c = shopCopy[locale];
  const d = checkoutCopy[locale];
  const journey = journeyCopy[locale];
  const lines = useCart();
  const [form, setForm] = useState({ recipientName: "", phone: "", city: "Toshkent", address: "", note: "" });
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewProduct[] | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [version, setVersion] = useState(0);
  const orderButton = useRef<HTMLButtonElement>(null);
  const animation = useRef<ButtonMotion | null>(null);
  useEffect(() => () => animation.current?.cancel(), []);
  const ids = lines.map(line => line.productId).join(",");
  useEffect(() => {
    if (!ids) { setPreview(null); return; }
    const controller = new AbortController();
    setPreview(null);
    setPreviewError("");
    fetch("/api/orders/preview", { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal, body: JSON.stringify({ ids: ids.split(",") }) })
      .then(async response => {
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.products)) throw new Error(data.error ?? journey.mediaError);
        if (!controller.signal.aborted) setPreview(data.products);
      }).catch((issue: unknown) => {
        if (!controller.signal.aborted) setPreviewError(issue instanceof Error ? issue.message : journey.mediaError);
      });
    return () => controller.abort();
  }, [ids, version, journey.mediaError]);
  const update = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const byId = new Map(preview?.map(product => [product.id, product]));
  const unavailable = preview !== null && lines.some(line => !byId.has(line.productId) || byId.get(line.productId)?.stockStatus === "OUT_OF_STOCK");
  const subtotals = new Map<string, number>();
  for (const line of lines) {
    const product = byId.get(line.productId);
    if (product && product.priceMinor !== null) subtotals.set(product.currency, (subtotals.get(product.currency) ?? 0) + product.priceMinor * line.quantity);
  }
  const unpriced = preview?.some(product => product.priceMinor === null);

  async function submit(event: { preventDefault: () => void }) {
    event.preventDefault();
    if (busy) return;
    if (!canOrder || !preview || unavailable) { setError(c.changed); return; }
    setBusy(true);
    setError("");
    try {
      if (orderButton.current) animation.current = startOrderMotion(orderButton.current);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          expectedProducts: preview.map(({ id, priceMinor, currency, stockStatus }) => ({ id, priceMinor, currency, stockStatus })),
          latitude: coords?.[0] ?? null,
          longitude: coords?.[1] ?? null,
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity }))
        })
      });
      const data = await response.json();
      if (response.status === 401) { setError(c.signInOrder); return; }
      if (!response.ok) { setError(data.code === "CATALOG_CHANGED" ? c.changed : data.error ?? d.fail); if (response.status === 409) setVersion(value => value + 1); return; }
      if (typeof data.order?.reference !== "string" || !data.order.reference.trim()) { setError(d.fail); return; }
      await animation.current?.complete();
      clearCart();
      setDone(data.order.reference);
    } catch {
      setError(d.network);
    } finally {
      animation.current?.cancel();
      animation.current = null;
      setBusy(false);
    }
  }

  if (done) {
    return <>
      <Steps current={3} />
      <div className="panel-card stack" style={{ textAlign: "center", justifyItems: "center", padding: 40 }}>
        <svg className="order-accepted-mark" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" /><path d="m11 20 6 6 12-13" /></svg>
        <h2>{d.accepted}</h2>
        <p>{d.reference}: <strong>{done}</strong></p>
        <p className="muted" style={{ maxWidth: 460 }}>{d.nextStep}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <Link className="button" href="/portal/orders">{d.track}</Link>
          <Link className="button ghost" href="/products">{d.continue}</Link>
        </div>
      </div>
    </>;
  }
  if (lines.length === 0) {
    return <div className="empty-state" style={{ textAlign: "center", padding: 48 }}>
      <p><strong>{d.empty}</strong></p>
      <p>{d.emptyHint}</p>
      <Link className="button" href="/products">{c.back}</Link>
    </div>;
  }
  return <>
    <Steps current={coords || form.recipientName || form.address ? 2 : 1} />
    {!canOrder && <div className="shop-price-notice"><p>{c.signInOrder}</p><Link className="button" href="/login?next=%2Fcart">{locale === "uz" ? "Hisobga kirish" : locale === "ru" ? "Войти" : "Sign in"}</Link></div>}
    <form onSubmit={submit} className="shop-checkout">
      <fieldset disabled={busy} className="stack" style={{ gap: 18, padding: 0, border: 0, margin: 0, minWidth: 0 }}>
        <section className="panel-card">
          <h2>{d.products} ({count})</h2>
          {lines.map((line) => <div className="shop-line" key={line.productId}>
            <ProductMedia assets={byId.get(line.productId)?.assets ?? []} title={line.name} slug={line.slug} categorySlug={line.categorySlug} />
            <div>
              <Link href={`/products/${line.slug}`}>{line.name}</Link>
              <div className="small muted">{byId.get(line.productId)?.priceMinor != null ? <CurrencyPrice amountMinor={byId.get(line.productId)!.priceMinor! * line.quantity} currency={byId.get(line.productId)!.currency} /> : c.priceRequest}</div>
              {preview && (!byId.has(line.productId) || byId.get(line.productId)?.stockStatus === "OUT_OF_STOCK") && <p role="status">{c.OUT_OF_STOCK}</p>}
              <button type="button" className="small cart-remove" onClick={() => setQuantity(line.productId, 0)}>{c.remove}</button>
            </div>
            <div className="shop-qty">
              <button type="button" onClick={() => setQuantity(line.productId, line.quantity - 1)} aria-label={`${d.decrease}: ${line.name}`}>−</button>
              <output>{line.quantity}</output>
              <button type="button" onClick={() => setQuantity(line.productId, line.quantity + 1)} aria-label={`${d.increase}: ${line.name}`}>+</button>
            </div>
          </div>)}
        </section>

        <section className="panel-card stack shop-address-card">
          <div>
            <span className="eyebrow">01</span>
            <h2>{d.addressTitle}</h2>
            <p className="small muted">{d.addressHint}</p>
          </div>
          <DeliveryMap value={coords} address={form.address} onChange={(c, address) => { setCoords(c); setForm((f) => ({ ...f, address: address ?? "" })); }} />
          <div className="shop-field-row">
            <label className="shop-field"><span>{d.city}</span><input required value={form.city} onChange={update("city")} maxLength={80} autoComplete="address-level1" /></label>
            <label className="shop-field"><span>{d.address}</span><input placeholder={d.addressPlaceholder} value={form.address} onChange={update("address")} maxLength={300} autoComplete="street-address" /></label>
          </div>
        </section>

        <section className="panel-card stack shop-contact-card">
          <div>
            <span className="eyebrow">02</span>
            <h2>{d.contactTitle}</h2>
            <p className="small muted">{d.contactHint}</p>
          </div>
          <div className="shop-field-row">
            <label className="shop-field"><span>{d.name}</span><input required minLength={2} value={form.recipientName} onChange={update("recipientName")} maxLength={120} autoComplete="name" /></label>
            <label className="shop-field"><span>{d.phone}</span><input required minLength={7} type="tel" placeholder="+998 90 123 45 67" value={form.phone} onChange={update("phone")} maxLength={30} inputMode="tel" autoComplete="tel" /></label>
          </div>
          <label className="shop-field"><span>{d.note}</span><textarea value={form.note} onChange={update("note")} maxLength={500} rows={3} /></label>
        </section>
      </fieldset>

      <aside className="shop-summary">
        <h2>{d.summary}</h2>
        <div className="row"><span>{d.count}</span><strong>{count}</strong></div>
        <div className="row"><span>{d.location}</span><strong>{coords ? d.chosen : form.address ? d.manual : "—"}</strong></div>
        {preview && [...subtotals].map(([currency, total]) => <div className="row" key={currency}><span>{c.subtotal} ({currency})</span><strong><CurrencyPrice amountMinor={total} currency={currency} /></strong></div>)}
        {unpriced && <p className="small">{c.pendingPrice}</p>}
        {!preview && !previewError && <p role="status">{d.sending}</p>}
        <p className="small muted">{c.shipping}</p>
        <p className="small muted">{journey.deliveryNote}</p>
        <Link className="text-link small" href="/terms">{journey.terms}</Link>
        {previewError && <p role="alert">{previewError}</p>}
        {unavailable && <p role="alert">{c.OUT_OF_STOCK}</p>}
        <button className="button secondary" type="button" disabled={busy} onClick={() => setVersion(value => value + 1)}>{c.refresh}</button>
        <ToastMessage message={error} variant="error" />
        <OriginalOrderButton ref={orderButton} busy={busy} disabled={busy || !preview || unavailable || !canOrder} label={d.submit} pending={d.sending} success={d.accepted} />
        <Link className="button ghost" href="/products">← {c.back}</Link>
      </aside>
    </form>
  </>;
}
