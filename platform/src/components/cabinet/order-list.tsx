"use client";

import Image from "next/image";
import Link from "next/link";
import { useSitePreferences } from "@/components/site-preferences";
import { formatDate, formatMinor } from "@/lib/format";
import { statusText } from "@/lib/status-labels";
import { siteCopy } from "@/lib/site-copy";
import { customerOrdersCopy } from "@/lib/customer-orders-copy";
import { ORDER_FILTERS, orderNextStep, orderTitle, rowAction, type OrderFilter } from "@/lib/customer-orders";
import type { CabinetOrderList } from "@/lib/cabinet-data";
import { CabinetTitle, StatusBadge } from "./sections";

/** The payment line as a badge in words: method and state. */
export function PaymentLine({ method, status }: { method: string; status: string }) {
  const { locale } = useSitePreferences();
  const methods = siteCopy[locale].orders.method;
  const tone = status === "PAID" ? " is-paid" : status === "AWAITING_CONFIRMATION" || status === "AWAITING_PAYMENT" ? " is-review" : status === "REFUND_DUE" ? " is-refund" : "";
  return <span className={`pay-badge${tone}`}>{methods[method] ?? methods.UNSPECIFIED} · {statusText("payment", status, locale)}</span>;
}

/** "My orders": tabs, then one card per order with its photos, first product, amount, status and one action. */
export function OrderList({ data }: { data: CabinetOrderList }) {
  const { locale } = useSitePreferences();
  const w = customerOrdersCopy[locale];
  const href = (filter: OrderFilter, page?: number) => `/portal/orders?status=${filter}${page && page > 1 ? `&page=${page}` : ""}`;
  return <>
    <CabinetTitle section="orders" />
    {data.counts.all > 0 && <nav className="shop-cats cab-filters" aria-label={w.filtersLabel}>
      {ORDER_FILTERS.map(filter => <Link key={filter} className={`shop-chip${data.filter === filter ? " is-active" : ""}`} href={href(filter)} aria-current={data.filter === filter ? "true" : undefined}>
        {w.filters[filter]} · {data.counts[filter]}
      </Link>)}
    </nav>}
    {data.orders.length === 0 && <div className="empty-state checkout-empty">
      <p><strong>{data.counts.all === 0 ? w.emptyAll : w.emptyFilter}</strong></p>
      {data.counts.all === 0 && <Link className="button" href="/products">{w.browse}</Link>}
    </div>}
    {data.orders.length > 0 && <ul className="cab-orders">
      {data.orders.map(order => {
        const step = orderNextStep(order);
        const action = rowAction(step);
        const title = orderTitle(order.items);
        return <li key={order.id} className="cab-order-row is-clickable-card">
          {order.images.length > 0 && <span className="cab-order-photos" aria-hidden="true">
            {order.images.map(id => <Image key={id} src={`/api/media/${id}`} alt="" width={48} height={48} sizes="48px" />)}
          </span>}
          <span className="cab-order-main">
            <Link className="card-link cab-order-title" href={`/portal/orders/${order.id}`}>
              {title.first ?? order.reference}{title.more > 0 && <span className="muted"> · {w.more(title.more)}</span>}
            </Link>
            <small className="muted">{order.reference} · {formatDate(order.createdAt)}</small>
            {order.cancelRequested && order.status !== "CANCELLED" && <small className="cab-warn-text">{w.cancelRequested}</small>}
          </span>
          <span className="cab-order-side">
            <StatusBadge kind="order" code={order.status} />
            <strong>{order.totalMinor === null ? w.pending : formatMinor(order.totalMinor, order.currency, locale)}</strong>
            <PaymentLine method={order.paymentMethod} status={order.paymentStatus} />
          </span>
          {action && <span className="cab-order-action">
            {action === "pay" && <a className="button" href={`/api/orders/${order.id}/payme?l=${locale}`}>{w.pay}<span className="sr-only"> · {w.details(order.reference)}</span></a>}
            {action === "invoice" && <Link className="button secondary" href={`/portal/orders/${order.id}/invoice`}>{w.invoice}<span className="sr-only"> · {w.details(order.reference)}</span></Link>}
            {action === "reupload" && <Link className="button secondary" href={`/portal/orders/${order.id}#receipt`}>{w.reupload}<span className="sr-only"> · {w.details(order.reference)}</span></Link>}
          </span>}
        </li>;
      })}
    </ul>}
    {data.hasMore && <p><Link className="button ghost" href={href(data.filter, data.page + 1)}>{w.showMore}</Link></p>}
    {data.capped && <p className="small muted">{w.capped}</p>}
  </>;
}
