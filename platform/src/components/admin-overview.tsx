"use client";

import Link from "next/link";
import { useSitePreferences } from "./site-preferences";
import { UiIcon, type IconName } from "./ui-icon";
import { siteCopy } from "@/lib/site-copy";
import { formatDateTime, formatMinor, formatNumber } from "@/lib/format";
import { growthCopy } from "@/lib/growth-copy";
import { TelegramLinkCard } from "./code-sign-in";

export type AdminOverviewData = {
  newOrders: number | null;
  pendingWallet: number | null;
  newRequests: number | null;
  pendingPayments: number | null;
  customers: number | null;
  monthRevenueMinor: number | null;
  botConfigured: boolean | null;
  recentErrors: { id: string; source: string; message: string; path: string | null; count: number; lastSeenAt: Date | string }[] | null;
  telegramLinked: boolean;
};

export function AdminOverview({ data, onOpen }: { data: AdminOverviewData; onOpen: (section: "requests" | "wallet" | "payments" | "users" | "products" | "portfolio" | "system") => void }) {
  const { locale } = useSitePreferences();
  const c = siteCopy[locale].admin;
  const tiles: { key: string; label: string; value: number; icon: IconName; open?: () => void; href?: string }[] = [];
  if (data.newOrders !== null) tiles.push({ key: "orders", label: c.newOrders, value: data.newOrders, icon: "box", href: "/admin/orders?status=NEW" });
  if (data.pendingWallet !== null) tiles.push({ key: "wallet", label: c.pendingWallet, value: data.pendingWallet, icon: "wallet", open: () => onOpen("wallet") });
  if (data.newRequests !== null) tiles.push({ key: "requests", label: c.openRequests, value: data.newRequests, icon: "clipboard", open: () => onOpen("requests") });
  if (data.pendingPayments !== null) tiles.push({ key: "payments", label: c.pendingPayments, value: data.pendingPayments, icon: "creditCard", open: () => onOpen("payments") });
  const waiting = tiles.reduce((sum, tile) => sum + tile.value, 0);

  return <section className="panel-card admin-overview">
    <div className="admin-overview-head">
      <div><h2>{c.overview}</h2><p className="small muted">{c.overviewHint}</p></div>
      {waiting === 0 && <span className="pay-badge is-paid">{c.allClear}</span>}
    </div>

    {data.botConfigured === false && <div className="admin-alert" role="status">
      <div><strong>{c.botOff}</strong><span>{c.botOffHint}</span></div>
      <button className="button secondary" type="button" onClick={() => onOpen("system")}>{c.openIntegrations}</button>
    </div>}

    <TelegramLinkCard staff />

    {data.recentErrors && data.recentErrors.length > 0 && <details className="admin-errors">
      <summary>{growthCopy[locale].errors.recent} · {data.recentErrors.reduce((sum, item) => sum + item.count, 0)}</summary>
      <ul>{data.recentErrors.map(item => <li key={item.id}><strong>{item.source}{item.path ? ` · ${item.path}` : ""}</strong><span>{item.message.slice(0, 200)}</span><small>{formatDateTime(item.lastSeenAt)} · × {item.count}</small></li>)}</ul>
    </details>}

    <div className="admin-tiles">
      {tiles.map(tile => {
        const body = <>
          <span className="admin-tile-icon"><UiIcon name={tile.icon} size={20} /></span>
          <strong>{formatNumber(tile.value, 0)}</strong>
          <span>{tile.label}</span>
        </>;
        return tile.href
          ? <Link className="admin-tile" data-busy={tile.value > 0} href={tile.href} key={tile.key}>{body}</Link>
          : <button className="admin-tile" data-busy={tile.value > 0} type="button" onClick={tile.open} key={tile.key}>{body}</button>;
      })}
      {data.customers !== null && <button className="admin-tile" type="button" onClick={() => onOpen("users")}>
        <span className="admin-tile-icon"><UiIcon name="users" size={20} /></span>
        <strong>{formatNumber(data.customers, 0)}</strong>
        <span>{c.customers}</span>
      </button>}
      {data.monthRevenueMinor !== null && <Link className="admin-tile" href="/admin/orders?status=DELIVERED">
        <span className="admin-tile-icon"><UiIcon name="receipt" size={20} /></span>
        <strong>{formatMinor(data.monthRevenueMinor, "UZS", locale)}</strong>
        <span>{c.revenue}</span>
        <small>{c.revenueHint}</small>
      </Link>}
    </div>

    <h3>{c.quick}</h3>
    <div className="admin-quick">
      {data.newOrders !== null && <Link className="button secondary" href="/admin/orders">{c.openOrders}</Link>}
      {data.newOrders !== null && <button className="button secondary" type="button" onClick={() => onOpen("products")}>{c.addProduct}</button>}
      <button className="button secondary" type="button" onClick={() => onOpen("portfolio")}>{c.addWork}</button>
    </div>
  </section>;
}
