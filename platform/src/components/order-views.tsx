"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSitePreferences } from "./site-preferences";
import { ToastMessage } from "./toast-provider";
import { siteCopy } from "@/lib/site-copy";
import { formatDateTime, formatMinor } from "@/lib/format";
import { nextStatuses, orderStatuses, type OrderStatusValue } from "@/lib/orders";

type OrderItem = { id: string; name: string; sku?: string | null; quantity: number; unitPriceMinor?: number | null };
type OrderBase = {
  id: string; reference: string; status: string; recipientName: string; phone: string; city: string; address: string;
  latitude: number | null; longitude: number | null; note: string | null; totalMinor: number | null; currency: string; createdAt: Date | string;
  paymentMethod: string; paymentStatus: string; paymentReference: string | null; paymentProofMediaId: string | null;
  items: OrderItem[];
};
export type CustomerOrder = OrderBase & { history: { id: string; toStatus: string; createdAt: Date | string; note: string | null }[] };
export type AdminOrder = OrderBase & { customer: { name: string; email: string } };

const flow: OrderStatusValue[] = ["NEW", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"];

function PaymentBadge({ order }: { order: OrderBase }) {
  const { locale } = useSitePreferences();
  const c = siteCopy[locale].orders;
  const settled = order.paymentStatus === "PAID";
  return <span className={`pay-badge${settled ? " is-paid" : order.paymentStatus === "AWAITING_CONFIRMATION" ? " is-review" : ""}`}>
    {c.method[order.paymentMethod] ?? order.paymentMethod} · {c.paymentStatus[order.paymentStatus] ?? order.paymentStatus}
  </span>;
}

export function CustomerOrders({ orders }: { orders: CustomerOrder[] }) {
  const { locale } = useSitePreferences();
  const c = siteCopy[locale].orders;
  return <div className="container page-shell customer-orders">
    <span className="eyebrow">{c.eyebrow}</span>
    <h1 className="page-title">{c.title}</h1>
    {orders.length === 0 && <div className="empty-state checkout-empty">
      <p><strong>{c.empty}</strong></p>
      <Link className="button" href="/products">{c.browse}</Link>
    </div>}
    <div className="stack" style={{ gap: 18 }}>
      {orders.map((order) => {
        const status = order.status as OrderStatusValue;
        const index = flow.indexOf(status);
        const cancelled = status === "CANCELLED";
        const progress = index <= 0 ? 0 : (index / (flow.length - 1)) * 80;
        return <article className="order-card" key={order.id}>
          <div className="order-head">
            <div>
              <h2>{order.reference}</h2>
              <span className="small muted">{formatDateTime(order.createdAt)}</span>
            </div>
            <span className={`order-status${status === "DELIVERED" ? " is-done" : cancelled ? " is-cancelled" : ""}`}>{c.status[status] ?? status}</span>
          </div>
          <div className="order-body">
            {cancelled
              ? <p className="order-cancelled">{c.cancelled}</p>
              : <ol className="order-track" aria-label={c.trackLabel}>
                <span className="bar" style={{ width: `${progress}%` }} />
                {flow.map((step, i) => <li key={step} className={`${i <= index ? "is-reached" : ""}${i === index ? " is-current" : ""}`}>
                  <i>{i < index || step === "DELIVERED" ? "✓" : i + 1}</i>{c.status[step]}
                </li>)}
              </ol>}
            <div className="order-meta">
              <div><h3>{c.delivery}</h3><p>{order.recipientName} · {order.phone}<br />{[order.city, order.address].filter(Boolean).join(", ")}</p>
                {order.latitude !== null && order.longitude !== null && <a className="small text-link" href={`https://yandex.uz/maps/?pt=${order.longitude},${order.latitude}&z=16&l=map`} target="_blank" rel="noreferrer">{c.map}</a>}
              </div>
              <div><h3>{c.total}</h3><p><strong>{order.totalMinor === null ? c.totalPending : formatMinor(order.totalMinor, order.currency, locale)}</strong></p></div>
              <div><h3>{c.payment}</h3><PaymentBadge order={order} /></div>
            </div>
            <ul className="order-items">{order.items.map((item) => <li key={item.id}><span>{item.name}</span><strong>× {item.quantity}</strong></li>)}</ul>
            <details>
              <summary className="small">{c.history}</summary>
              <ul className="stack small" style={{ marginTop: 8 }}>{order.history.map((entry) => <li key={entry.id}>{formatDateTime(entry.createdAt)} — <strong>{c.status[entry.toStatus] ?? entry.toStatus}</strong>{entry.note ? ` · ${entry.note}` : ""}</li>)}</ul>
            </details>
          </div>
        </article>;
      })}
    </div>
  </div>;
}

function AdminOrderActions({ order }: { order: AdminOrder }) {
  const { locale } = useSitePreferences();
  const copy = siteCopy[locale];
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function send(body: unknown) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/orders/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) { setError((await response.json().catch(() => ({}))).error ?? copy.admin.failed); return; }
      router.refresh();
    } catch {
      setError(copy.admin.failed);
    } finally {
      setBusy(false);
    }
  }
  const options = nextStatuses(order.status as OrderStatusValue);
  return <div className="order-actions">
    {order.paymentStatus === "AWAITING_CONFIRMATION" && <button type="button" className="button" disabled={busy} onClick={() => void send({ paymentStatus: "PAID" })}>{copy.admin.confirmPayment}</button>}
    {options.map((next) => <button key={next} type="button" className={next === "CANCELLED" ? "button danger" : "button secondary"} disabled={busy} onClick={() => void send({ status: next })}>{copy.orders.status[next]}</button>)}
    <ToastMessage message={error} variant="error" />
  </div>;
}

export function AdminOrders({ orders, counts, total, status }: { orders: AdminOrder[]; counts: Record<string, number>; total: number; status?: string }) {
  const { locale } = useSitePreferences();
  const copy = siteCopy[locale];
  const c = copy.orders;
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return orders;
    return orders.filter(order => [order.reference, order.recipientName, order.phone, order.customer.name, order.customer.email].join(" ").toLocaleLowerCase().includes(needle));
  }, [orders, query]);
  return <div className="container page-shell admin-orders">
    <Link className="small text-link" href="/admin">← {copy.admin.back}</Link>
    <h1 className="page-title">{copy.admin.ordersTitle}</h1>
    <nav className="shop-cats" aria-label={copy.admin.byStatus}>
      <Link className={`shop-chip${!status ? " is-active" : ""}`} href="/admin/orders">{copy.admin.all} · {total}</Link>
      {orderStatuses.map((value) => <Link className={`shop-chip${status === value ? " is-active" : ""}`} key={value} href={`/admin/orders?status=${value}`}>{c.status[value]} · {counts[value] ?? 0}</Link>)}
    </nav>
    <input className="admin-orders-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={copy.admin.search} aria-label={copy.admin.search} />
    {visible.length === 0 && <div className="empty-state">{copy.admin.noOrders}</div>}
    <div className="stack">
      {visible.map((order) => <article className="order-card panel-card" key={order.id}>
        <div className="order-head">
          <div>
            <h2>{order.reference}</h2>
            <span className="small muted">{formatDateTime(order.createdAt)}</span>
          </div>
          <span className={`order-status${order.status === "DELIVERED" ? " is-done" : order.status === "CANCELLED" ? " is-cancelled" : ""}`}>{c.status[order.status] ?? order.status}</span>
        </div>
        <div className="order-body">
          <p className="order-customer">
            <strong>{order.recipientName}</strong> · <a href={`tel:${order.phone.replace(/[^\d+]/g, "")}`}>{order.phone}</a><br />
            {[order.city, order.address].filter(Boolean).join(", ")}<br />
            <span className="small muted">{c.account}: {order.customer.name} ({order.customer.email})</span>
          </p>
          {order.latitude !== null && order.longitude !== null && <a className="small text-link" href={`https://yandex.uz/maps/?pt=${order.longitude},${order.latitude}&z=16&l=map`} target="_blank" rel="noreferrer">{c.map}</a>}
          <ul className="order-items">{order.items.map((item) => <li key={item.id}>
            <span>{item.name}{item.sku ? <span className="small muted"> · {item.sku}</span> : null}</span>
            <strong>× {item.quantity}{item.unitPriceMinor != null ? ` · ${formatMinor(item.unitPriceMinor, order.currency, locale)}` : ""}</strong>
          </li>)}</ul>
          <p className="order-total">{order.totalMinor !== null ? <>{c.total}: <strong>{formatMinor(order.totalMinor, order.currency, locale)}</strong></> : <span className="muted">{c.totalPending}</span>}</p>
          <div className="order-payment">
            <PaymentBadge order={order} />
            {order.paymentReference && <span className="small muted">{order.paymentReference}</span>}
            {order.paymentProofMediaId && <a className="small text-link" href={`/api/media/${order.paymentProofMediaId}`} target="_blank" rel="noreferrer">{copy.admin.viewProof}</a>}
          </div>
          {order.note && <p className="small">{c.note}: {order.note}</p>}
          <AdminOrderActions order={order} />
        </div>
      </article>)}
    </div>
  </div>;
}
