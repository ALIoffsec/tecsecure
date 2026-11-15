"use client";

import { useSitePreferences } from "../site-preferences";
import { haptic, telegramApp } from "../tma-kit";
import { sellerAppCopy } from "@/lib/seller-app-copy";
import { formatMinor } from "@/lib/format";
import { useSellerData } from "./seller-api";
import type { SellerOverview } from "./seller-types";
import type { SellerNav } from "./seller-app";

/** The seller's first screen: what to do now, money, and how the listings are doing. */
export function SellerHome({ nav }: { nav: SellerNav }) {
  const { locale } = useSitePreferences();
  const c = sellerAppCopy[locale];
  const { data, failed, reload } = useSellerData<SellerOverview>("/api/shop/overview");
  if (failed && !data) return <div className="tma-empty"><p>{c.common.failed}</p><button type="button" className="tma-button secondary" onClick={reload}>{c.common.retry}</button></div>;
  if (!data) return <SellerSkeleton />;
  const money = (minor: number) => formatMinor(minor, "UZS", locale);
  const link = typeof window === "undefined" ? `/s/${data.shop.slug}` : `${window.location.origin}/s/${data.shop.slug}`;
  const todo = [
    { label: c.home.toAccept, value: data.orders.toAccept, urgent: true },
    { label: c.home.toShip, value: data.orders.toShip, urgent: true },
    { label: c.home.awaitingPayment, value: data.orders.awaitingPayment, urgent: false },
    { label: c.home.shipped, value: data.orders.shipped, urgent: false }
  ];
  const nothingToDo = data.orders.toAccept + data.orders.toShip === 0;

  function share() {
    haptic.tap();
    const app = telegramApp();
    if (app) { app.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(data!.shop.name)}`); return; }
    void navigator.clipboard?.writeText(link).then(() => nav.notice(c.common.copied)).catch(() => undefined);
  }

  return <>
    <header className="tma-hello">
      <span className="tma-eyebrow">{c.home.hello}</span>
      <h1>{data.shop.name}</h1>
    </header>

    <h2 className="tma-section-title">{c.home.todo}</h2>
    {(data.orders.disputes ?? 0) > 0 && <button type="button" className="tma-notice is-warning tma-notice-button" onClick={() => nav.tab("orders")}>⚠️ {c.home.disputes(data.orders.disputes ?? 0)}</button>}
    <div className="tma-stats">
      {todo.map(item => <button type="button" key={item.label} className={`tma-stat${item.urgent && item.value > 0 ? " is-urgent" : ""}`} onClick={() => nav.tab("orders")}>
        <strong>{item.value}</strong><span>{item.label}</span>
      </button>)}
    </div>
    {nothingToDo && <p className="tma-hint">{c.home.allClear}</p>}

    <h2 className="tma-section-title">{c.home.money}</h2>
    <button type="button" className="tma-section tma-money" onClick={() => nav.tab("balance")}>
      <span className="tma-eyebrow">{c.home.balance}</span>
      <strong>{money(data.money.balanceMinor)}</strong>
      <span className="tma-money-row"><span>{c.home.pending}</span><b>{money(data.money.pendingMinor)}</b></span>
      <span className="tma-money-row"><span>{c.home.earned30}</span><b>{money(data.money.earned30Minor)}</b></span>
    </button>

    <h2 className="tma-section-title">{c.home.listings}</h2>
    <div className="tma-stats is-three">
      <button type="button" className="tma-stat" onClick={() => nav.tab("products")}><strong>{data.products.onSale}</strong><span>{c.home.onSale}</span></button>
      <button type="button" className="tma-stat" onClick={() => nav.tab("products")}><strong>{data.products.inReview}</strong><span>{c.home.inReview}</span></button>
      <button type="button" className={`tma-stat${data.products.rejected > 0 ? " is-urgent" : ""}`} onClick={() => nav.tab("products")}><strong>{data.products.rejected}</strong><span>{c.home.rejected}</span></button>
      <div className="tma-stat"><strong>{data.products.views}</strong><span>{c.home.views}</span></div>
      <div className="tma-stat"><strong>{data.products.advertised}</strong><span>{c.home.advertised}</span></div>
      <div className="tma-stat"><strong>{data.orders.delivered}</strong><span>{c.home.delivered}</span></div>
    </div>

    {(data.products.lowStock.length > 0 || data.products.outOfStock.length > 0) && <>
      <h2 className="tma-section-title">{c.home.lowStock}</h2>
      <section className="tma-section tma-list">
        {data.products.outOfStock.map(item => <button type="button" className="tma-item" key={item.id} onClick={() => nav.go({ kind: "product", id: item.id })}>
          <span className="tma-item-top"><strong>{item.name}</strong><span className="tma-pill is-cancelled">{c.home.outOfStock}</span></span>
        </button>)}
        {data.products.lowStock.map(item => <button type="button" className="tma-item" key={item.id} onClick={() => nav.go({ kind: "product", id: item.id })}>
          <span className="tma-item-top"><strong>{item.name}</strong><span className="tma-pill">{item.left} {c.common.pcs}</span></span>
        </button>)}
      </section>
    </>}

    {data.products.topSold.length > 0 && <>
      <h2 className="tma-section-title">{c.home.topSold}</h2>
      <section className="tma-section tma-list">{data.products.topSold.map(item => <button type="button" className="tma-item" key={item.id} onClick={() => nav.go({ kind: "product", id: item.id })}>
        <span className="tma-item-top"><strong>{item.name}</strong><span className="tma-item-meta">{item.sold} {c.common.pcs}</span></span>
      </button>)}</section>
    </>}
    {data.products.topViewed.length > 0 && <>
      <h2 className="tma-section-title">{c.home.topViewed}</h2>
      <section className="tma-section tma-list">{data.products.topViewed.map(item => <button type="button" className="tma-item" key={item.id} onClick={() => nav.go({ kind: "product", id: item.id })}>
        <span className="tma-item-top"><strong>{item.name}</strong><span className="tma-item-meta">{item.views}</span></span>
      </button>)}</section>
    </>}

    <h2 className="tma-section-title">{c.home.share}</h2>
    <section className="tma-section">
      <p className="tma-hint tma-hint-flat">{c.home.shareHint} <b>{data.shop.referralCommissionPercent}%</b> ({c.home.commission.toLowerCase()} {data.shop.commissionPercent}%)</p>
      <code className="tma-link-box">{link}</code>
    </section>
    <section className="tma-section tma-list">
      <button type="button" className="tma-row-button" onClick={() => nav.go({ kind: "editor", id: null })}>+ {c.home.addProduct}</button>
      <button type="button" className="tma-row-button" onClick={share}>{c.home.share}</button>
      <a className="tma-row-button" href={`/s/${data.shop.slug}`} target={nav.variant === "telegram" ? "_blank" : undefined} rel="noreferrer">{c.home.storefront}</a>
      <a className="tma-row-button" href={`/s/${data.shop.slug}/card`} target="_blank" rel="noreferrer">{c.home.visitCard}</a>
      <button type="button" className="tma-row-button" onClick={() => nav.go({ kind: "profile" })}>{c.home.settings}</button>
    </section>
  </>;
}

/** Grey blocks while the first data loads, so the screen does not jump. */
export function SellerSkeleton() {
  return <div className="tma-skeleton" aria-busy="true">
    <span className="tma-skel is-title" />
    <div className="tma-stats"><span className="tma-skel is-tile" /><span className="tma-skel is-tile" /><span className="tma-skel is-tile" /><span className="tma-skel is-tile" /></div>
    <span className="tma-skel is-block" /><span className="tma-skel is-block" />
  </div>;
}
