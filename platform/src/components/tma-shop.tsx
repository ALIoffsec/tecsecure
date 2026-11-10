"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSitePreferences } from "./site-preferences";
import { ShopForm, type SellerShop } from "./seller-cabinet";
import { TabIcon, TmaShell, telegramApp } from "./tma-kit";
import { sellerCopy } from "@/lib/seller-copy";
import { tmaCopy } from "@/lib/tma-copy";
import { formatMinor } from "@/lib/format";

type Tab = "home" | "orders" | "products" | "balance";

/** The shop owner's cabinet inside the shop bot. Only the owner's own shop; staff accounts are turned away. */
export function ShopMiniApp({ shop, staff }: { shop: SellerShop | null; staff: boolean }) {
  const { locale } = useSitePreferences();
  const c = tmaCopy[locale].shop;
  const seller = sellerCopy[locale];
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const active = shop?.status === "ACTIVE";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    const app = telegramApp();
    if (app) app.close(); else window.location.assign("/");
  }

  if (staff) return <TmaShell app="shop"><p className="tma-empty">{c.staffAccount}</p><section className="tma-section tma-list"><button type="button" className="tma-row-button is-danger" onClick={() => void logout()}>{c.logout}</button></section></TmaShell>;

  if (!shop) return <TmaShell app="shop">
    <header className="tma-hello"><span className="tma-eyebrow">{seller.title}</span><h1>{c.applyTitle}</h1></header>
    <p className="tma-hint">{c.applyHint}</p>
    <ul className="tma-points">{seller.points.map(point => <li key={point}>{point}</li>)}</ul>
    <section className="tma-section tma-form"><ShopForm shop={null} onSaved={() => router.refresh()} /></section>
  </TmaShell>;

  const status = seller.status[shop.status] ?? seller.status.PENDING;
  const tabs = [
    { id: "home", label: c.tabs.home, icon: TabIcon.home },
    { id: "orders", label: c.tabs.orders, icon: TabIcon.orders },
    { id: "products", label: c.tabs.products, icon: TabIcon.products },
    { id: "balance", label: c.tabs.balance, icon: TabIcon.balance }
  ];

  return <TmaShell app="shop" tabs={tabs} active={tab} onTab={id => { setTab(id as Tab); window.scrollTo(0, 0); }}>
    {tab === "home" && <>
      <header className="tma-hello"><span className="tma-eyebrow">{seller.title}</span><h1>{shop.name}</h1></header>
      <section className={`tma-section tma-status is-${shop.status.toLowerCase()}`} role="status">
        <strong>{status.title}</strong>
        <p>{status.text}</p>
        {shop.reviewNote && (shop.status === "REJECTED" || shop.status === "SUSPENDED") && <p><strong>{seller.reason}:</strong> {shop.reviewNote}</p>}
      </section>
      {active && <div className="tma-stats">
        <button type="button" className="tma-stat" onClick={() => setTab("balance")}><strong>{formatMinor(shop.balanceMinor, "UZS", locale)}</strong><span>{c.balance}</span></button>
        <button type="button" className="tma-stat" onClick={() => setTab("balance")}><strong>{shop.commissionPercent}%</strong><span>{c.commission}</span></button>
      </div>}
      {shop.status !== "SUSPENDED" && <>
        <h2 className="tma-section-title">{c.profile}</h2>
        <details className="tma-section tma-form" open={shop.status === "REJECTED"}>
          <summary>{shop.legalName ?? shop.name}{shop.city ? ` · ${shop.city}` : ""}</summary>
          <ShopForm shop={shop} onSaved={() => router.refresh()} />
        </details>
      </>}
      <section className="tma-section tma-list"><button type="button" className="tma-row-button is-danger" onClick={() => void logout()}>{c.logout}</button></section>
    </>}

    {tab === "orders" && <>
      <h1 className="tma-title">{c.tabs.orders}</h1>
      <p className="tma-empty">{active ? c.ordersEmpty : c.afterApproval}</p>
    </>}

    {tab === "products" && <>
      <h1 className="tma-title">{c.tabs.products}</h1>
      {active ? <><p className="tma-empty">{c.productsEmpty}</p><p className="tma-hint">{c.productsSoon}</p></> : <p className="tma-empty">{c.afterApproval}</p>}
    </>}

    {tab === "balance" && <>
      <h1 className="tma-title">{c.tabs.balance}</h1>
      {!active ? <p className="tma-empty">{c.afterApproval}</p> : <>
        <section className="tma-section tma-balance">
          <span className="tma-eyebrow">{c.balance}</span>
          <strong>{formatMinor(shop.balanceMinor, "UZS", locale)}</strong>
          <p className="tma-hint">{c.balanceHint}</p>
        </section>
        <section className="tma-section">
          <dl className="tma-rows">
            <div><dt>{c.commission}</dt><dd><strong>{shop.commissionPercent}%</strong> · {c.commissionHint}</dd></div>
            <div><dt>{c.referral}</dt><dd><strong>{shop.referralCommissionPercent}%</strong> · {c.referralHint}</dd></div>
          </dl>
        </section>
        <h2 className="tma-section-title">{c.payouts}</h2>
        <p className="tma-hint">{c.payoutsHint}</p>
      </>}
    </>}
  </TmaShell>;
}
