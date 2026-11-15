"use client";

import { useState } from "react";
import { useSitePreferences } from "../site-preferences";
import { BottomActions, callNumber, confirmAction, haptic, useBackButton } from "../tma-kit";
import { sellerAppCopy } from "@/lib/seller-app-copy";
import { siteCopy } from "@/lib/site-copy";
import { formatDateTime, formatMinor } from "@/lib/format";
import { creditDueAt, isDisputeOpen } from "@/lib/marketplace";
import { nextStatuses, type OrderStatusValue } from "@/lib/orders";
import { regionNames, type RegionCode } from "@/lib/delivery";
import { sellerApi, useSellerData } from "./seller-api";
import { SellerSkeleton } from "./seller-home";
import type { SellerOrder } from "./seller-types";
import type { SellerNav } from "./seller-app";

type Filter = "active" | "new" | "ship" | "road" | "done" | "cancelled";
const inFilter: Record<Filter, (order: SellerOrder) => boolean> = {
  active: order => ["NEW", "CONFIRMED", "PREPARING", "SHIPPED"].includes(order.status),
  new: order => order.status === "NEW",
  ship: order => order.status === "CONFIRMED" || order.status === "PREPARING",
  road: order => order.status === "SHIPPED",
  done: order => order.status === "DELIVERED",
  cancelled: order => order.status === "CANCELLED"
};

export function SellerOrders({ nav }: { nav: SellerNav }) {
  const { locale } = useSitePreferences();
  const c = sellerAppCopy[locale];
  const { data, failed, reload } = useSellerData<{ orders: SellerOrder[] }>("/api/shop/orders");
  const [filter, setFilter] = useState<Filter>("active");
  if (failed && !data) return <div className="tma-empty"><p>{c.common.failed}</p><button type="button" className="tma-button secondary" onClick={reload}>{c.common.retry}</button></div>;
  if (!data) return <SellerSkeleton />;
  const list = data.orders.filter(inFilter[filter]);
  return <>
    <h1 className="tma-title">{c.orders.title}</h1>
    <div className="tma-segmented tma-chips-scroll" role="tablist">
      {(Object.keys(inFilter) as Filter[]).map(key => <button key={key} type="button" role="tab" aria-selected={filter === key} onClick={() => { haptic.select(); setFilter(key); }}>
        {c.orders.filters[key]} · {data.orders.filter(inFilter[key]).length}
      </button>)}
    </div>
    {list.length === 0 ? <p className="tma-empty">{c.orders.empty}</p> : <section className="tma-section tma-list">
      {list.map(order => <button type="button" className="tma-item" key={order.id} onClick={() => nav.go({ kind: "order", id: order.order.id })}>
        <span className="tma-item-top"><strong>{order.order.reference}</strong><span className={`tma-pill is-${order.status.toLowerCase()}`}>{c.orders.status[order.status]}</span></span>
        <span className="tma-item-text">{order.order.items.map(item => `${item.name} × ${item.quantity}`).join(", ")}</span>
        <span className="tma-item-sub">{order.order.recipientName} · {order.order.city}{order.payoutMinor !== null ? ` · ${formatMinor(order.payoutMinor, "UZS", locale)}` : ""}</span>
        <span className="tma-item-meta">{formatDateTime(order.createdAt)}{order.status === "NEW" && order.order.paymentStatus !== "PAID" ? ` · ${c.home.awaitingPayment}` : ""}{isDisputeOpen(order) ? ` · ⚠️ ${c.orders.disputeShort}` : ""}</span>
      </button>)}
    </section>}
  </>;
}

export function SellerOrderDetail({ id, nav }: { id: string; nav: SellerNav }) {
  const { locale } = useSitePreferences();
  const c = sellerAppCopy[locale];
  const site = siteCopy[locale];
  const { data, failed, reload } = useSellerData<{ orders: SellerOrder[]; payoutHoldDays?: number | null }>("/api/shop/orders");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  useBackButton(nav.back);
  const part = data?.orders.find(order => order.order.id === id) ?? null;

  async function move(status: OrderStatusValue) {
    if (!part || busy) return;
    const text = (note ?? "").trim();
    if (status === "CANCELLED") {
      if (text.length < 3) { nav.error(c.orders.reasonNeeded); return; }
      if (!(await confirmAction(c.common.confirm))) return;
    }
    setBusy(true);
    const result = await sellerApi(`/api/shop/orders/${id}`, { method: "PATCH", body: { status, ...(text ? { note: text } : {}) } });
    setBusy(false);
    if (!result.ok) { haptic.error(); nav.error(result.error); return; }
    haptic.success();
    nav.notice(c.common.done);
    setNote(null);
    setCancelling(false);
    reload();
  }

  if (failed && !data) return <div className="tma-empty"><p>{c.common.failed}</p><button type="button" className="tma-button secondary" onClick={reload}>{c.common.retry}</button></div>;
  if (!data) return <SellerSkeleton />;
  if (!part) return <p className="tma-empty">{c.orders.empty}</p>;

  const order = part.order;
  const paid = order.paymentStatus === "PAID";
  const forward = nextStatuses(part.status as OrderStatusValue).filter(status => status !== "CANCELLED")[0];
  const canCancel = nextStatuses(part.status as OrderStatusValue).includes("CANCELLED");
  const money = (minor: number | null) => minor === null ? "—" : formatMinor(minor, "UZS", locale);
  const region = order.region ? regionNames[locale][order.region as RegionCode] : null;
  const mapUrl = order.latitude !== null && order.longitude !== null ? `https://yandex.uz/maps/?pt=${order.longitude},${order.latitude}&z=16&l=map` : `https://yandex.uz/maps/?text=${encodeURIComponent([region, order.city, order.address].filter(Boolean).join(", "))}`;
  const steps: [string, string | null][] = [["NEW", part.createdAt], ["CONFIRMED", part.confirmedAt], ["SHIPPED", part.shippedAt], ["DELIVERED", part.deliveredAt]];
  const main = cancelling
    ? { text: c.orders.action.CANCELLED, busy, tone: "danger" as const, onClick: () => void move("CANCELLED") }
    : forward && (paid || part.status !== "NEW") ? { text: c.orders.action[forward], busy, onClick: () => void move(forward) } : null;

  return <>
    <header className="tma-detail-head">
      <span className="tma-eyebrow">{formatDateTime(order.createdAt)}</span>
      <h1>{order.reference}</h1>
      <span className={`tma-pill is-${part.status.toLowerCase()}`}>{c.orders.status[part.status]}</span>
    </header>
    {part.status === "NEW" && !paid && <p className="tma-notice is-warning">{c.orders.notPaid}</p>}
    {isDisputeOpen(part) && <p className="tma-notice is-warning"><b>{c.orders.disputeTitle}</b> {part.disputeNote}<br />{c.orders.disputeHint}</p>}
    {part.disputeResolution && <p className="tma-notice">{c.orders.disputeDone[part.disputeResolution] ?? part.disputeResolution}</p>}

    <h2 className="tma-section-title">{c.orders.items}</h2>
    <section className="tma-section tma-list">
      {order.items.map(item => <div className="tma-line" key={item.id}>
        <span className="tma-line-name">{item.name}</span>
        <span className="tma-line-qty">× {item.quantity}</span>
        <span className="tma-line-sum">{item.unitPriceMinor !== null ? money(item.unitPriceMinor * item.quantity) : "—"}</span>
      </div>)}
    </section>

    <h2 className="tma-section-title">{c.orders.buyer}</h2>
    <section className="tma-section">
      <dl className="tma-rows">
        <div><dt>{c.orders.buyer}</dt><dd>{order.recipientName}<br /><a href={`tel:${order.phone.replace(/[^\d+]/g, "")}`}>{order.phone}</a></dd></div>
        <div><dt>{c.orders.address}</dt><dd>{[region, order.city, order.address].filter(Boolean).join(", ")}<br /><a href={mapUrl} target="_blank" rel="noreferrer">{c.orders.map} →</a></dd></div>
        {order.deliveryMethod && <div><dt>{c.orders.delivery}</dt><dd>{c.orders.methods[order.deliveryMethod] ?? order.deliveryMethod}</dd></div>}
        <div><dt>{site.orders.payment}</dt><dd>{site.orders.method[order.paymentMethod] ?? order.paymentMethod} · {paid ? c.orders.paid : site.orders.paymentStatus[order.paymentStatus] ?? order.paymentStatus}</dd></div>
        {order.note && <div><dt>{c.orders.note}</dt><dd>{order.note}</dd></div>}
        {part.sellerNote && <div><dt>{c.orders.sellerNoteSaved}</dt><dd>{part.sellerNote}</dd></div>}
      </dl>
    </section>

    <h2 className="tma-section-title">{c.orders.money}</h2>
    <section className="tma-section tma-list">
      <div className="tma-line is-sub"><span className="tma-line-name">{c.orders.goods}</span><span className="tma-line-sum">{money(part.itemsTotalMinor)}</span></div>
      <div className="tma-line is-sub"><span className="tma-line-name">{c.orders.commission} ({part.commissionPercent}%)</span><span className="tma-line-sum">−{money(part.commissionMinor)}</span></div>
      {part.deliveryShareMinor !== null && part.deliveryShareMinor > 0 && <div className="tma-line is-sub"><span className="tma-line-name">{c.orders.deliveryShare}</span><span className="tma-line-sum">+{money(part.deliveryShareMinor)}</span></div>}
      <div className="tma-line is-total"><span className="tma-line-name">{c.orders.youGet}</span><span className="tma-line-sum">{money(part.payoutMinor)}</span></div>
      <p className="tma-hint tma-hint-pad">{part.creditedAt ? `${c.orders.credited} · ${formatDateTime(part.creditedAt)}`
        : part.status === "DELIVERED" && part.deliveredAt && data?.payoutHoldDays ? `${c.orders.creditOn} ${formatDateTime(creditDueAt(new Date(part.deliveredAt), data.payoutHoldDays) as Date)}`
        : data?.payoutHoldDays ? `${c.orders.notCredited} ${c.orders.holdNote(data.payoutHoldDays)}` : c.orders.notCredited}</p>
    </section>

    <h2 className="tma-section-title">{c.orders.timeline}</h2>
    <section className="tma-section">
      <ol className="tma-timeline">{steps.map(([status, at]) => <li key={status} className={at ? "is-done" : ""}><span>{c.orders.status[status]}</span>{at && <small>{formatDateTime(at)}</small>}</li>)}
        {part.cancelledAt && <li className="is-cancelled"><span>{c.orders.status.CANCELLED}</span><small>{formatDateTime(part.cancelledAt)}</small></li>}</ol>
    </section>

    {(forward || canCancel) && <section className="tma-section tma-form">
      <div className="field">
        <label htmlFor="seller-note">{cancelling ? c.orders.cancelReason : c.orders.sellerNote}</label>
        <textarea id="seller-note" rows={2} maxLength={500} value={note ?? ""} onChange={event => setNote(event.target.value)} />
      </div>
    </section>}
    <section className="tma-section tma-list">
      <button type="button" className="tma-row-button" onClick={() => callNumber(order.phone)}>{c.orders.call}</button>
      {canCancel && !cancelling && <button type="button" className="tma-row-button is-danger" onClick={() => setCancelling(true)}>{c.orders.action.CANCELLED}…</button>}
      {cancelling && <button type="button" className="tma-row-button" onClick={() => setCancelling(false)}>{c.common.back}</button>}
    </section>
    <BottomActions main={main} />
  </>;
}
