"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { DeliveryMap } from "@/components/delivery-map";
import { clearCart, setQuantity, useCart } from "@/components/cart";
import { ProductMedia } from "@/components/product-media";
import { ToastMessage } from "@/components/toast-provider";
import { CurrencyPrice } from "./currency-context";
import { MediaUploader } from "./media-uploader";
import { useSitePreferences } from "./site-preferences";
import { UiIcon, type IconName } from "./ui-icon";
import { shopCopy } from "@/lib/shop-copy";
import { journeyCopy } from "@/lib/journey-copy";
import { siteCopy } from "@/lib/site-copy";
import type { CatalogMedia, QuotedProduct } from "@/lib/catalog-utils";
import { checkoutCopy } from "@/lib/checkout-copy";
import { formatMinor } from "@/lib/format";
import { OriginalOrderButton } from "./original-order-button";
import { startOrderMotion, type ButtonMotion } from "@/lib/button-motion";

type PreviewProduct = QuotedProduct & { name: string; slug: string; category: { slug: string } | null; assets: CatalogMedia[] };
type Method = "CASH" | "CARD_ON_DELIVERY" | "CARD_TRANSFER" | "WALLET";
export type PaymentCard = { number: string; holder: string; bank: string };

const REMEMBER_KEY = "tecsecure-checkout";

function Steps({ current, reached, onSelect, label }: { current: number; reached: number; onSelect: (step: 1 | 2 | 3) => void; label: string }) {
  const { locale } = useSitePreferences();
  const items = checkoutCopy[locale].steps;
  return <ol className="shop-steps" aria-label={label}>
    {items.map((name, i) => {
      const step = (i + 1) as 1 | 2 | 3;
      return <li key={name} className={step === current ? "is-active" : step < current ? "is-done" : ""} aria-current={step === current ? "step" : undefined}>
        <button type="button" disabled={step > reached || step === current} onClick={() => onSelect(step)}><span>{name}</span></button>
      </li>;
    })}
  </ol>;
}

export function CartCheckout({ canOrder = false, signedIn = false, customer, walletBalance = 0, paymentCard = null }: {
  canOrder?: boolean;
  signedIn?: boolean;
  customer?: { name: string; phone: string | null } | null;
  walletBalance?: number;
  paymentCard?: PaymentCard | null;
}) {
  const { locale } = useSitePreferences();
  const c = shopCopy[locale];
  const d = checkoutCopy[locale];
  const copy = siteCopy[locale];
  const journey = journeyCopy[locale];
  const lines = useCart();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reached, setReached] = useState(1);
  const [form, setForm] = useState({ recipientName: customer?.name ?? "", phone: customer?.phone ?? "", city: "Toshkent", address: "", note: "" });
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [method, setMethod] = useState<Method>("CASH");
  const [proof, setProof] = useState<string[]>([]);
  const [paymentReference, setPaymentReference] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ reference: string; method: Method } | null>(null);
  const [preview, setPreview] = useState<PreviewProduct[] | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [version, setVersion] = useState(0);
  const orderButton = useRef<HTMLButtonElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const animation = useRef<ButtonMotion | null>(null);
  useEffect(() => () => animation.current?.cancel(), []);

  // Returning customers should not retype where they live.
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(REMEMBER_KEY) ?? "null") as Partial<typeof form> | null;
      if (saved) setForm(current => ({ ...current, phone: current.phone || saved.phone || "", city: saved.city || current.city, address: saved.address || "" }));
    } catch { /* storage may be unavailable; the form simply starts empty */ }
  }, []);

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
  const unpriced = Boolean(preview?.some(product => product.priceMinor === null));
  const singleTotal = !unpriced && subtotals.size === 1 ? [...subtotals][0] : null;
  const canPrepay = singleTotal !== null;
  const walletTotal = singleTotal && singleTotal[0] === "UZS" ? singleTotal[1] : null;
  const walletEnough = walletTotal !== null && walletBalance >= walletTotal;
  const transferReady = method !== "CARD_TRANSFER" || proof.length > 0;
  const hasLocation = Boolean(coords) || form.address.trim().length >= 5 || form.note.trim().length >= 5;

  // A method can stop being valid when the cart changes while the customer is on the last step.
  useEffect(() => {
    if ((method === "CARD_TRANSFER" && (!canPrepay || !paymentCard)) || (method === "WALLET" && !walletEnough)) setMethod("CASH");
  }, [method, canPrepay, paymentCard, walletEnough]);

  function goTo(next: 1 | 2 | 3) {
    setError("");
    setStep(next);
    setReached(value => Math.max(value, next));
    top.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (step === 1) { if (preview && !unavailable) goTo(2); return; }
    if (step === 2) {
      if (!hasLocation) { setError(d.locationNeeded); return; }
      goTo(3);
      return;
    }
    if (busy) return;
    if (!canOrder || !preview || unavailable) { setError(c.changed); return; }
    if (!transferReady) { setError(d.receiptRequired); return; }
    setBusy(true);
    setError("");
    try {
      if (orderButton.current) animation.current = startOrderMotion(orderButton.current);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod: method,
          paymentReference: method === "CARD_TRANSFER" ? paymentReference : undefined,
          paymentProofMediaId: method === "CARD_TRANSFER" ? proof[0] : undefined,
          expectedProducts: preview.map(({ id, priceMinor, currency, stockStatus }) => ({ id, priceMinor, currency, stockStatus })),
          latitude: coords?.[0] ?? null,
          longitude: coords?.[1] ?? null,
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity }))
        })
      });
      const data = await response.json();
      if (response.status === 401) { setError(c.signInOrder); return; }
      if (!response.ok) {
        setError(data.code === "CATALOG_CHANGED" ? c.changed : data.code === "WALLET_BALANCE_TOO_LOW" ? d.walletShort : data.error ?? d.fail);
        if (response.status === 409) setVersion(value => value + 1);
        return;
      }
      if (typeof data.order?.reference !== "string" || !data.order.reference.trim()) { setError(d.fail); return; }
      await animation.current?.complete();
      try { window.localStorage.setItem(REMEMBER_KEY, JSON.stringify({ phone: form.phone, city: form.city, address: form.address })); } catch { /* optional convenience */ }
      clearCart();
      setDone({ reference: data.order.reference, method });
    } catch {
      setError(d.network);
    } finally {
      animation.current?.cancel();
      animation.current = null;
      setBusy(false);
    }
  }

  async function copyCard() {
    if (!paymentCard) return;
    try {
      await navigator.clipboard.writeText(paymentCard.number.replace(/\s/g, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { setCopied(false); }
  }

  if (done) {
    return <>
      <Steps current={4} reached={0} onSelect={() => {}} label={d.stepsLabel} />
      <div className="panel-card stack checkout-done">
        <svg className="order-accepted-mark" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" /><path d="m11 20 6 6 12-13" /></svg>
        <h2>{d.accepted}</h2>
        <p>{d.reference}: <strong>{done.reference}</strong></p>
        <p className="muted">{d.next[done.method]}</p>
        <div className="checkout-done-actions">
          <Link className="button" href="/portal/orders">{d.track}</Link>
          <Link className="button ghost" href="/products">{d.continue}</Link>
        </div>
      </div>
    </>;
  }
  if (lines.length === 0) {
    return <div className="empty-state checkout-empty">
      <UiIcon name="box" size={40} />
      <p><strong>{d.empty}</strong></p>
      <p>{d.emptyHint}</p>
      <Link className="button" href="/products">{c.back}</Link>
    </div>;
  }

  const methods: { id: Method; icon: IconName; title: string; hint: string; disabled?: boolean; note?: string }[] = [
    { id: "CASH", icon: "wallet", title: d.methods.cash.title, hint: d.methods.cash.hint },
    { id: "CARD_ON_DELIVERY", icon: "creditCard", title: d.methods.terminal.title, hint: d.methods.terminal.hint },
    { id: "CARD_TRANSFER", icon: "send", title: d.methods.transfer.title, hint: d.methods.transfer.hint, disabled: !canPrepay || !paymentCard, note: !paymentCard ? d.transferOff : !canPrepay ? d.prepayNeedsPrice : undefined },
    { id: "WALLET", icon: "wallet", title: d.methods.wallet.title, hint: `${d.balance}: ${formatMinor(walletBalance, "UZS", locale)}`, disabled: !walletEnough, note: walletTotal === null ? d.prepayNeedsPrice : !walletEnough ? d.walletShort : undefined }
  ];
  const chosen = methods.find(item => item.id === method);

  return <div ref={top} className="checkout">
    <Steps current={step} reached={reached} onSelect={goTo} label={d.stepsLabel} />
    {!canOrder && <div className="shop-price-notice">
      <p>{signedIn ? d.staffCannotOrder : c.signInOrder}</p>
      {!signedIn && <Link className="button" href="/login?next=%2Fcart">{locale === "uz" ? "Hisobga kirish" : locale === "ru" ? "Войти" : "Sign in"}</Link>}
    </div>}
    <form onSubmit={submit} className="shop-checkout">
      <div className="checkout-main" key={step}>
        {step === 1 && <section className="panel-card">
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
              <span aria-live="polite">{line.quantity}</span>
              <button type="button" onClick={() => setQuantity(line.productId, line.quantity + 1)} aria-label={`${d.increase}: ${line.name}`}>+</button>
            </div>
          </div>)}
        </section>}

        {step === 2 && <>
          <section className="panel-card stack shop-address-card">
            <div><h2>{d.addressTitle}</h2><p className="small muted">{d.addressHint}</p></div>
            <DeliveryMap value={coords} address={form.address} onChange={(point, address) => { setCoords(point); setForm((f) => ({ ...f, address: address ?? f.address })); }} />
            <div className="shop-field-row">
              <label className="shop-field"><span>{d.city}</span><input required minLength={2} value={form.city} onChange={update("city")} maxLength={80} autoComplete="address-level1" /></label>
              <label className="shop-field"><span>{d.address}</span><input placeholder={d.addressPlaceholder} value={form.address} onChange={update("address")} maxLength={300} autoComplete="street-address" /></label>
            </div>
          </section>
          <section className="panel-card stack shop-contact-card">
            <div><h2>{d.contactTitle}</h2><p className="small muted">{d.contactHint}</p></div>
            <div className="shop-field-row">
              <label className="shop-field"><span>{d.name}</span><input required minLength={2} value={form.recipientName} onChange={update("recipientName")} maxLength={120} autoComplete="name" /></label>
              <label className="shop-field"><span>{d.phone}</span><input required minLength={7} type="tel" placeholder="+998 90 123 45 67" value={form.phone} onChange={update("phone")} maxLength={30} inputMode="tel" autoComplete="tel" /></label>
            </div>
            <label className="shop-field"><span>{d.note}</span><textarea value={form.note} onChange={update("note")} maxLength={500} rows={3} /></label>
          </section>
        </>}

        {step === 3 && <section className="panel-card stack checkout-payment">
          <div><h2>{d.paymentTitle}</h2><p className="small muted">{d.paymentHint}</p></div>
          <div className="pay-methods" role="radiogroup" aria-label={d.paymentTitle}>
            {methods.map(item => <label className="pay-method" key={item.id} data-selected={method === item.id} data-disabled={item.disabled ? "true" : undefined}>
              <input type="radio" name="paymentMethod" value={item.id} checked={method === item.id} disabled={item.disabled} onChange={() => { setMethod(item.id); setError(""); }} />
              <span className="pay-method-icon"><UiIcon name={item.icon} size={22} /></span>
              <span className="pay-method-text"><strong>{item.title}</strong><span>{item.note ?? item.hint}</span></span>
              <span className="pay-method-dot" aria-hidden="true" />
            </label>)}
            <div className="pay-method" data-disabled="true" aria-disabled="true">
              <span className="pay-method-icon"><UiIcon name="creditCard" size={22} /></span>
              <span className="pay-method-text"><strong>{d.methods.online.title}</strong><span>{d.methods.online.hint}</span></span>
              <span className="pay-method-soon">{d.soon}</span>
            </div>
          </div>

          {method === "CARD_TRANSFER" && paymentCard && <div className="pay-transfer">
            <ol className="pay-transfer-steps">{d.transferSteps.map(item => <li key={item}>{item}</li>)}</ol>
            <div className="pay-card">
              <span className="pay-card-bank">{paymentCard.bank || "Tecsecure"}</span>
              <strong className="pay-card-number">{paymentCard.number}</strong>
              <div className="pay-card-foot">
                <span>{paymentCard.holder}</span>
                <button type="button" className="button secondary" onClick={() => void copyCard()}>{copied ? copy.common.copied : copy.common.copy}</button>
              </div>
            </div>
            {singleTotal && <p className="pay-amount">{d.toTransfer}: <strong>{formatMinor(singleTotal[1], singleTotal[0], locale)}</strong></p>}
            <MediaUploader scope="WALLET" value={proof} onChange={setProof} />
            <label className="shop-field"><span>{d.transferNote}</span><input value={paymentReference} onChange={event => setPaymentReference(event.target.value)} maxLength={160} placeholder={d.transferNotePlaceholder} /></label>
          </div>}

          {method === "WALLET" && walletTotal !== null && <p className="pay-amount">{d.afterPayment}: <strong>{formatMinor(walletBalance - walletTotal, "UZS", locale)}</strong></p>}
          {!walletEnough && <Link className="text-link small" href="/portal/profile?section=wallet">{d.topUp}</Link>}

          <ToastMessage message={error} variant="error" />
          <OriginalOrderButton ref={orderButton} busy={busy} disabled={busy || !preview || unavailable || !canOrder || !transferReady} label={d.submit} pending={d.sending} success={d.accepted} />
          {!transferReady && <p className="small muted checkout-hint">{d.receiptRequired}</p>}
        </section>}

        {step !== 3 && <ToastMessage message={error} variant="error" />}
      </div>

      <aside className="shop-summary">
        <h2>{d.summary}</h2>
        <div className="row"><span>{d.count}</span><strong>{count}</strong></div>
        {step > 1 && <div className="row"><span>{d.location}</span><strong>{coords ? d.chosen : form.address ? d.manual : "—"}</strong></div>}
        {step === 3 && chosen && <div className="row"><span>{copy.orders.payment}</span><strong>{chosen.title}</strong></div>}
        {preview && [...subtotals].map(([currency, total]) => <div className="row checkout-total" key={currency}><span>{c.subtotal}</span><strong><CurrencyPrice amountMinor={total} currency={currency} /></strong></div>)}
        {unpriced && <p className="small">{c.pendingPrice}</p>}
        {!preview && !previewError && <p role="status" className="small muted">{d.sending}</p>}
        <p className="small muted">{journey.deliveryNote}</p>
        <Link className="text-link small" href="/terms">{journey.terms}</Link>
        {previewError && <><p role="alert">{previewError}</p><button className="button secondary" type="button" onClick={() => setVersion(value => value + 1)}>{c.refresh}</button></>}
        {unavailable && <p role="alert">{c.OUT_OF_STOCK}</p>}
        <div className="checkout-actions">
          {step > 1 && <button className="button ghost" type="button" onClick={() => goTo((step - 1) as 1 | 2)}>← {d.back}</button>}
          {step === 1 && <Link className="button ghost" href="/products">← {c.back}</Link>}
          {step < 3 && <button className="button" type="submit" disabled={!preview || unavailable || (!canOrder && step === 1 && !signedIn)}>{step === 1 ? d.toDelivery : d.toPayment}</button>}
        </div>
      </aside>
    </form>
  </div>;
}
