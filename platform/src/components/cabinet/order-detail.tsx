"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { SiteDialog } from "@/components/site-dialog";
import { addToCart, setQuantity, useCart } from "@/components/cart";
import { translateMessage } from "@/lib/server-messages";
import { OrderLines } from "@/components/order-views";
import { ReceiptReupload } from "@/components/order-refund-actions";
import { formatDateTime, formatMinor } from "@/lib/format";
import { statusText } from "@/lib/status-labels";
import { canDispute, isDisputeOpen } from "@/lib/marketplace";
import { checkoutCopy } from "@/lib/checkout-copy";
import { regionCodes, regionNames, type RegionCode } from "@/lib/delivery";
import { customerOrdersCopy } from "@/lib/customer-orders-copy";
import { ORDER_TRACK, PAYME_RECHECK, canAskToCancel, canCustomerCancel, isStatusMove, orderNextStep, orderTrack, selfCancelReason } from "@/lib/customer-orders";
import type { CabinetOrderDetail } from "@/lib/cabinet-data";
import { StatusBadge } from "./sections";
import { PaymentLine } from "./order-list";
import { StatusTrack } from "./status-track";

type Dialog = { kind: "cancel" | "ask" | "problem"; shopId?: string } | null;

async function send(url: string, body: unknown): Promise<{ error: string; code: string } | null> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  if (response?.ok) return null;
  const data = await response?.json().catch(() => ({})) ?? {};
  return { error: typeof data.error === "string" ? data.error : "", code: typeof data.code === "string" ? data.code : "" };
}

/**
 * One order, top to bottom: the next step, the progress line, the goods by seller, the amount, the payment,
 * the delivery, the history, and what the buyer can do. Only the history is folded away.
 */
export function OrderDetail({ order, fromPayme }: { order: CabinetOrderDetail; fromPayme: boolean }) {
  const { locale } = useSitePreferences();
  const w = customerOrdersCopy[locale];
  const d = checkoutCopy[locale];
  const router = useRouter();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [notice, setNotice] = useState("");
  const parts = order.shipments;
  const step = orderNextStep(order);
  const track = orderTrack(order.createdAt, order.history, order.status);
  const cancelled = order.status === "CANCELLED";
  const cancelNote = cancelled ? [...order.history].reverse().find(entry => entry.toStatus === "CANCELLED" && isStatusMove(entry))?.note ?? null : null;
  const ownItems = order.items.filter(item => !item.shopId);
  const region = order.region && (regionCodes as readonly string[]).includes(order.region) ? regionNames[locale][order.region as RegionCode] : null;
  const method = order.deliveryMethod === "EXPRESS" || order.deliveryMethod === "COURIER" || order.deliveryMethod === "PICKUP" ? d.delivery[order.deliveryMethod].title : order.deliveryMethod === "AGREED" ? d.agreedShort : null;
  const canCancel = canCustomerCancel(order, parts);
  const canAsk = canAskToCancel(order, parts, order.cancelAsked);
  const cancelled_ = selfCancelReason(cancelNote);
  const historyNote = (note: string) => {
    const parsed = selfCancelReason(note);
    return parsed.self ? (parsed.reason ? `${w.youCancelled} ${w.cancelledReason(parsed.reason)}` : w.youCancelled) : note;
  };
  // "Muammo bor" on every order: when no part can be disputed and there are no own lines (or it is cancelled), one order-wide button.
  const generalProblem = cancelled || (ownItems.length === 0 && !parts.some(part => canDispute(part)));
  const cart = useCart();
  const reordering = useRef(false);
  const money = (value: number) => formatMinor(value, order.currency, locale);

  /** Puts the order's lines in the cart at least once each: pressing it twice never doubles the quantities. */
  function reorder() {
    if (reordering.current) return;
    reordering.current = true;
    for (const line of order.reorder.lines) {
      const found = cart.find(item => item.productId === line.productId);
      if (found) setQuantity(line.productId, Math.max(found.quantity, line.quantity));
      else addToCart({ productId: line.productId, name: line.name, slug: line.slug, categorySlug: line.categorySlug }, line.quantity);
    }
    router.push("/cart");
  }

  return <>
    <header className="cab-order-header">
      <h1 className="cab-title" tabIndex={-1}>{w.order(order.reference)}</h1>
      <StatusBadge kind="order" code={order.status} />
      <small className="muted">{formatDateTime(order.createdAt)}</small>
    </header>
    {notice && <p className="notice" role="status">{notice}</p>}

    <section className="panel-card cab-next" aria-labelledby="order-next">
      <h2 id="order-next">{w.nextTitle}</h2>
      <p>{w.next[step]}</p>
      {step === "payPayme" && (fromPayme ? <PaymeReturn orderId={order.id} /> : <a className="button" href={`/api/orders/${order.id}/payme?l=${locale}`}>{w.pay}</a>)}
      {step === "payBank" && <Link className="button" href={`/portal/orders/${order.id}/invoice`}>{w.invoice}</Link>}
      {step === "reupload" && <a className="button" href="#receipt">{w.reupload}</a>}
      {cancelled
        ? <>
          {cancelled_.self && <p className="small muted">{w.youCancelled}</p>}
          {cancelled_.reason && <p className="small muted">{w.cancelledReason(cancelled_.reason)}</p>}
        </>
        : <StatusTrack label={w.track} doneText={w.done} current={track.current} steps={ORDER_TRACK.map((code, index) => ({ label: statusText("order", code, locale), at: track.dates[index] }))} />}
    </section>

    <section className="panel-card" aria-labelledby="order-products">
      <div className="portal-section-heading"><h2 id="order-products">{w.products}</h2>
        {generalProblem && <button type="button" className="button ghost" onClick={() => setDialog({ kind: "problem" })}>{w.problem}</button>}
      </div>
      {ownItems.length > 0 && <div className="cab-order-group">
        <div className="portal-section-heading"><h3>{w.tecsecure}</h3>
          {!generalProblem && <button type="button" className="button ghost" onClick={() => setDialog({ kind: "problem" })}>{w.problem}</button>}
        </div>
        <OrderLines items={ownItems} currency={order.currency} />
      </div>}
      {parts.map(part => <div className="cab-order-group" key={part.shopId}>
        <div className="portal-section-heading">
          <h3><Link href={`/s/${part.shop.slug}`}>{part.shop.name}</Link></h3>
          <StatusBadge kind="order" code={part.status} />
        </div>
        {part.sellerNote && <p className="small muted">{w.sellerNote}: {part.sellerNote}</p>}
        {isDisputeOpen(part) && <p className="small cab-warn-text">{w.disputeOpen}</p>}
        {part.disputeResolution === "RELEASED" && <p className="small muted">{w.disputeReleased}</p>}
        {part.disputeResolution === "REFUNDED" && <p className="small muted">{w.disputeRefunded}</p>}
        <OrderLines items={order.items.filter(item => item.shopId === part.shopId)} currency={order.currency} />
        {canDispute(part) && <button type="button" className="button ghost" onClick={() => setDialog({ kind: "problem", shopId: part.shopId })}>{w.problem}</button>}
      </div>)}
    </section>

    <section className="panel-card" aria-labelledby="order-sums">
      <h2 id="order-sums">{w.sums}</h2>
      {order.totalMinor === null ? <p className="muted">{w.pending}</p> : <dl className="cab-facts">
        {order.itemsTotalMinor != null && <><dt>{w.items}</dt><dd>{money(order.itemsTotalMinor)}</dd></>}
        {order.deliveryFeeMinor != null && <><dt>{w.delivery}</dt><dd>{order.deliveryFeeMinor === 0 ? d.free : money(order.deliveryFeeMinor)}</dd></>}
        <dt>{w.total}</dt><dd><strong>{money(order.totalMinor)}</strong></dd>
        {order.vatMinor != null && <><dt>{w.vat}</dt><dd>{money(order.vatMinor)}</dd></>}
      </dl>}
    </section>

    <section className="panel-card" aria-labelledby="order-payment" id="receipt">
      <h2 id="order-payment">{w.payment}</h2>
      <dl className="cab-facts">
        <dt>{w.paymentState}</dt><dd><PaymentLine method={order.paymentMethod} status={order.paymentStatus} /></dd>
      </dl>
      {order.paymentMethod === "BANK_TRANSFER" && <p><Link className="text-link" href={`/portal/orders/${order.id}/invoice`}>{w.invoice}</Link></p>}
      {step === "reupload" && <ReceiptReupload orderId={order.id} reason={order.receiptRefusal} />}
    </section>

    <section className="panel-card" aria-labelledby="order-shipping">
      <h2 id="order-shipping">{w.shipping}</h2>
      <dl className="cab-facts">
        <dt>{w.recipient}</dt><dd>{order.recipientName}</dd>
        <dt>{w.phone}</dt><dd>{order.phone}</dd>
        <dt>{w.address}</dt><dd>{[region, order.city, order.deliveryMethod === "PICKUP" ? null : order.address].filter(Boolean).join(", ")}{method && <><br /><span className="small muted">{method}</span></>}</dd>
      </dl>
      {order.latitude !== null && order.longitude !== null && <a className="small text-link" href={`https://yandex.uz/maps/?pt=${order.longitude},${order.latitude}&z=16&l=map`} target="_blank" rel="noreferrer">{w.map}</a>}
    </section>

    {order.history.length > 0 && <details className="panel-card">
      <summary>{w.history}</summary>
      <ul className="list">{order.history.map(entry => <li className="list-row" key={entry.id}>
        <span><strong>{isStatusMove(entry) || (entry.fromStatus === null && entry.toStatus === "NEW") ? statusText("order", entry.toStatus, locale) : w.historyEvent}</strong>{entry.note && <p className="small">{historyNote(entry.note)}</p>}</span>
        <small className="muted">{formatDateTime(entry.createdAt)}</small>
      </li>)}</ul>
    </details>}

    {(order.status === "DELIVERED" || canCancel || canAsk) && <div className="hero-actions cab-order-actions">
      {order.status === "DELIVERED" && (order.reorder.lines.length > 0
        ? <button type="button" className="button secondary" onClick={reorder} disabled={reordering.current}>{w.reorder}</button>
        : <p className="small muted">{w.reorderNone}</p>)}
      {order.status === "DELIVERED" && order.reorder.lines.length > 0 && order.reorder.missing.length > 0 && <p className="small muted">{w.reorderMissing(order.reorder.missing.join(", "))}</p>}
      {canCancel && <button type="button" className="button ghost" onClick={() => setDialog({ kind: "cancel" })}>{w.cancel}</button>}
      {canAsk && <button type="button" className="button ghost" onClick={() => setDialog({ kind: "ask" })}>{w.cancelAsk}</button>}
    </div>}

    {dialog && <OrderDialog orderId={order.id} dialog={dialog} onClose={done => {
      setDialog(null);
      if (done) { setNotice(dialog.kind === "problem" ? w.problemSent : w.next[dialog.kind === "cancel" ? "cancelled" : "cancelRequested"]); router.refresh(); }
    }} />}
  </>;
}

/** Back from Payme: the page looks at the stored payment a few times; if it is still unpaid, the normal page (with "Pay") returns. */
function PaymeReturn({ orderId }: { orderId: string }) {
  const { locale } = useSitePreferences();
  const w = customerOrdersCopy[locale];
  const router = useRouter();
  const [tries, setTries] = useState(0);
  useEffect(() => {
    if (tries >= PAYME_RECHECK.times) {
      // Dropping ?payme=1 brings the "Pay" button back, also after a reload.
      router.replace(`/portal/orders/${orderId}`, { scroll: false });
      return;
    }
    const timer = window.setTimeout(() => { router.refresh(); setTries(count => count + 1); }, PAYME_RECHECK.everyMs);
    return () => window.clearTimeout(timer);
  }, [tries, router, orderId]);
  if (tries < PAYME_RECHECK.times) return <p className="small" role="status" aria-busy="true">{w.checkingPayme}</p>;
  return <p className="small" role="status">{w.paymeNotYet} <button type="button" className="button ghost" onClick={() => setTries(0)}>{w.refresh}</button></p>;
}

function OrderDialog({ orderId, dialog, onClose }: { orderId: string; dialog: NonNullable<Dialog>; onClose: (done: boolean) => void }) {
  const { locale } = useSitePreferences();
  const w = customerOrdersCopy[locale];
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const problem = dialog.kind === "problem";
  const title = problem ? w.problemTitle : dialog.kind === "cancel" ? w.cancel : w.cancelAsk;
  async function submit() {
    if (problem && (text.trim().length < 5 || text.trim().length > (dialog.shopId ? 500 : 1000))) { setError(w.tooShort); return; }
    setBusy(true); setError("");
    const failure = problem
      ? dialog.shopId
        ? await send(`/api/orders/${orderId}/dispute`, { shopId: dialog.shopId, note: text.trim() })
        : await send(`/api/orders/${orderId}/contact`, { kind: "PROBLEM", message: text.trim() })
      : dialog.kind === "cancel"
        ? await send(`/api/orders/${orderId}/cancel`, { reason: text.trim() || undefined })
        : await send(`/api/orders/${orderId}/contact`, { kind: "CANCEL_REQUEST", message: text.trim() || undefined });
    setBusy(false);
    if (failure !== null) {
      const known = w.errors[failure.code as keyof typeof w.errors];
      setError(known ?? (failure.error ? translateMessage(failure.error, locale) : w.failed));
      return;
    }
    onClose(true);
  }
  const fieldId = `order-dialog-${dialog.kind}`;
  const limit = problem ? (dialog.shopId ? 500 : 1000) : 300;
  return <SiteDialog className="site-dialog cab-dialog" title={title} onClose={() => { if (!busy) onClose(false); }}>
    <form className="form" onSubmit={event => { event.preventDefault(); void submit(); }}>
      {!problem && <p>{dialog.kind === "cancel" ? w.cancelConfirm : w.cancelAskConfirm}</p>}
      <label htmlFor={fieldId}>{problem ? w.problemHint : w.cancelReason}</label>
      <textarea id={fieldId} rows={3} maxLength={limit} value={text} onChange={event => setText(event.target.value)}
        aria-invalid={error ? true : undefined} aria-describedby={error ? `${fieldId}-error` : undefined} />
      {error && <p className="notice error" role="alert" id={`${fieldId}-error`}>{error}</p>}
      <div className="hero-actions">
        <button type="submit" className={dialog.kind === "cancel" ? "button danger" : "button"} disabled={busy}>{busy ? w.sending : problem ? w.problemSend : dialog.kind === "cancel" ? w.cancelSend : w.cancelAskSend}</button>
        <button type="button" className="button ghost" disabled={busy} onClick={() => onClose(false)}>{w.close}</button>
      </div>
    </form>
  </SiteDialog>;
}
