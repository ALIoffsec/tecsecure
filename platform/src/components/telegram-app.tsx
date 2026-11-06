"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSitePreferences } from "./site-preferences";
import { ToastMessage } from "./toast-provider";
import { growthCopy } from "@/lib/growth-copy";
import { siteCopy } from "@/lib/site-copy";
import { translateMessage } from "@/lib/server-messages";
import { formatDateTime, formatMinor } from "@/lib/format";
import { nextStatuses, type OrderStatusValue } from "@/lib/orders";

type TelegramWebApp = {
  initData: string;
  colorScheme?: "dark" | "light";
  ready: () => void;
  expand: () => void;
  BackButton: { show: () => void; hide: () => void; onClick: (fn: () => void) => void; offClick: (fn: () => void) => void };
};
const SCRIPT_URL = "https://telegram.org/js/telegram-web-app.js";
const SESSION_KEY = "tecsecure-tma";
const webApp = () => (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;

/** The Mini App's front door: proves who opened it, then hands over to the normal site. */
export function TelegramEntry({ app }: { app: "customer" | "staff" }) {
  const { locale } = useSitePreferences();
  const c = growthCopy[locale].tma;
  const router = useRouter();
  const [state, setState] = useState<"loading" | "outside" | "account" | "failed">("loading");
  const [error, setError] = useState("");

  const signIn = useCallback(async (create = false) => {
    const telegram = webApp();
    if (!telegram?.initData) { setState("outside"); return; }
    telegram.ready();
    telegram.expand();
    setState("loading");
    setError("");
    try {
      const response = await fetch("/api/telegram/webapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ initData: telegram.initData, app, create }) });
      const data = await response.json();
      if (response.ok && data.needsAccount) { setState("account"); return; }
      if (!response.ok || !data.next) { setError(data.error ? translateMessage(data.error, locale) : c.failed); setState("failed"); return; }
      document.documentElement.dataset.tma = app;
      try { sessionStorage.setItem(SESSION_KEY, app); } catch { /* only the back button depends on it */ }
      router.replace(data.next);
      router.refresh();
    } catch {
      setError(c.failed);
      setState("failed");
    }
  }, [app, c.failed, locale, router]);

  return <div className="container page-shell tma-entry">
    <Script src={SCRIPT_URL} strategy="afterInteractive" onReady={() => void signIn()} onError={() => setState("outside")} />
    <section className="panel-card tma-card">
      <img src="/icon-192.png" width="72" height="72" alt="" />
      {state === "loading" && <p role="status">{c.loading}</p>}
      {state === "outside" && <><p>{c.outside}</p><Link className="button secondary" href="/">{c.openSite}</Link></>}
      {state === "account" && <><h1>{c.welcome}</h1><p className="muted">{c.welcomeHint}</p><button className="button" type="button" onClick={() => void signIn(true)}>{c.create}</button></>}
      {state === "failed" && <><p role="alert">{error}</p><button className="button secondary" type="button" onClick={() => void signIn()}>{c.retry}</button></>}
    </section>
  </div>;
}

/** Inside Telegram the system back button replaces the page's own, on every page after the first. */
export function TelegramBridge() {
  const pathname = usePathname();
  const router = useRouter();
  const [inApp, setInApp] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const entry = pathname.startsWith("/tg");
  useEffect(() => {
    try { setInApp(sessionStorage.getItem(SESSION_KEY) !== null); } catch { /* an ordinary browser */ }
  }, [pathname]);
  useEffect(() => {
    const telegram = webApp();
    if (entry || !telegram?.initData) return;
    document.documentElement.dataset.tma = pathname.startsWith("/admin") ? "staff" : "customer";
    const back = () => router.back();
    if (pathname === "/products" || pathname === "/admin/app") {
      telegram.BackButton.hide();
      return;
    }
    telegram.BackButton.show();
    telegram.BackButton.onClick(back);
    return () => telegram.BackButton.offClick(back);
  }, [entry, loaded, pathname, router]);
  return inApp && !entry ? <Script src={SCRIPT_URL} strategy="afterInteractive" onReady={() => setLoaded(value => value + 1)} /> : null;
}

export type StaffOrder = { id: string; reference: string; status: string; recipientName: string; phone: string; createdAt: Date | string; totalMinor: number | null; currency: string; paymentMethod: string; paymentStatus: string; paymentProofMediaId: string | null };
export type StaffWallet = { id: string; kind: string; amountMinor: number; reference: string | null; details: string | null; proofMediaId: string | null; createdAt: Date | string; user: { name: string; email: string } };
export type StaffRequest = { id: string; reference: string; name: string; phone: string | null; description: string; createdAt: Date | string };

export function StaffApp({ orders, wallet, requests }: { orders: StaffOrder[] | null; wallet: StaffWallet[] | null; requests: StaffRequest[] | null }) {
  const { locale } = useSitePreferences();
  const c = growthCopy[locale].staffApp;
  const copy = siteCopy[locale];
  const router = useRouter();
  const tabs = ([["orders", c.orders, orders], ["wallet", c.wallet, wallet], ["requests", c.requests, requests]] as const).filter(([, , list]) => list !== null);
  const [tab, setTab] = useState<string>(tabs[0]?.[0] ?? "orders");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(url: string, body: object) {
    setBusy(true); setError("");
    try {
      const response = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) { setError((await response.json().catch(() => ({}))).error ?? c.failed); return; }
      router.refresh();
    } catch {
      setError(c.failed);
    } finally {
      setBusy(false);
    }
  }

  return <div className="container page-shell staff-app">
    <h1>{c.title}</h1>
    <ToastMessage message={error} variant="error" />
    <nav className="segmented staff-app-tabs" aria-label={c.title}>
      {tabs.map(([id, label, list]) => <button type="button" key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>{label} · {list?.length ?? 0}</button>)}
    </nav>

    {tab === "orders" && orders && <div className="stack">
      {orders.length === 0 && <p className="empty-state">{c.empty}</p>}
      {orders.map(order => <article className="panel-card staff-item" key={order.id}>
        <header><strong>{order.reference}</strong><span className="order-status">{copy.orders.status[order.status] ?? order.status}</span></header>
        <p>{order.recipientName} · <a href={`tel:${order.phone.replace(/[^\d+]/g, "")}`}>{order.phone}</a></p>
        <p className="small muted">{formatDateTime(order.createdAt)} · {order.totalMinor !== null ? formatMinor(order.totalMinor, order.currency, locale) : copy.orders.totalPending}</p>
        <p className="small muted">{copy.orders.method[order.paymentMethod] ?? order.paymentMethod} · {copy.orders.paymentStatus[order.paymentStatus] ?? order.paymentStatus}</p>
        <div className="staff-actions">
          {order.paymentProofMediaId && <a className="button ghost" href={`/api/media/${order.paymentProofMediaId}`} target="_blank" rel="noreferrer">{c.proof}</a>}
          {(order.paymentStatus === "AWAITING_CONFIRMATION" || (order.paymentStatus === "AWAITING_PAYMENT" && order.paymentMethod === "BANK_TRANSFER")) && <button className="button" type="button" disabled={busy} onClick={() => void send(`/api/orders/${order.id}`, { paymentStatus: "PAID" })}>{copy.admin.confirmPayment}</button>}
          {nextStatuses(order.status as OrderStatusValue).map(next => <button className={next === "CANCELLED" ? "button danger" : "button secondary"} type="button" disabled={busy} key={next} onClick={() => void send(`/api/orders/${order.id}`, { status: next })}>{copy.orders.statusAction[next]}</button>)}
        </div>
      </article>)}
    </div>}

    {tab === "wallet" && wallet && <div className="stack">
      {wallet.length === 0 && <p className="empty-state">{c.empty}</p>}
      {wallet.map(item => <article className="panel-card staff-item" key={item.id}>
        <header><strong>{item.kind === "DEPOSIT" ? c.deposit : c.withdrawal}</strong><strong>{formatMinor(item.amountMinor, "UZS", locale)}</strong></header>
        <p>{item.user.name}</p>
        <p className="small muted">{formatDateTime(item.createdAt)}{item.reference ? ` · ${item.reference}` : ""}{item.details ? ` · ${item.details}` : ""}</p>
        <div className="staff-actions">
          {item.proofMediaId && <a className="button ghost" href={`/api/media/${item.proofMediaId}`} target="_blank" rel="noreferrer">{c.proof}</a>}
          <button className="button" type="button" disabled={busy} onClick={() => void send("/api/admin/wallet", { id: item.id, status: "APPROVED" })}>{c.approve}</button>
          <button className="button danger" type="button" disabled={busy} onClick={() => void send("/api/admin/wallet", { id: item.id, status: "REJECTED" })}>{c.reject}</button>
        </div>
      </article>)}
    </div>}

    {tab === "requests" && requests && <div className="stack">
      {requests.length === 0 && <p className="empty-state">{c.empty}</p>}
      {requests.map(item => <article className="panel-card staff-item" key={item.id}>
        <header><strong>{item.reference}</strong><span className="small muted">{formatDateTime(item.createdAt)}</span></header>
        <p>{item.name}</p>
        <p className="small muted">{item.description.slice(0, 180)}</p>
        <div className="staff-actions">
          {item.phone && <a className="button secondary" href={`tel:${item.phone.replace(/[^\d+]/g, "")}`}>{c.call}</a>}
          <button className="button secondary" type="button" disabled={busy} onClick={() => void send(`/api/requests/${item.id}`, { status: "UNDER_REVIEW" })}>{c.take}</button>
        </div>
      </article>)}
    </div>}

    <Link className="text-link small staff-app-full" href="/admin">{c.full} →</Link>
  </div>;
}
