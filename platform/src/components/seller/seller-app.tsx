"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSitePreferences } from "../site-preferences";
import { ToastMessage } from "../toast-provider";
import { ShopForm, type SellerShop } from "../seller-cabinet";
import { TabIcon, TmaShell, telegramApp } from "../tma-kit";
import { sellerCopy } from "@/lib/seller-copy";
import { sellerAppCopy } from "@/lib/seller-app-copy";
import type { Screen } from "./seller-types";
import { SellerHome } from "./seller-home";
import { SellerOrders, SellerOrderDetail } from "./seller-orders";
import { SellerProducts, SellerProductDetail } from "./seller-products";
import { SellerProductEditor } from "./seller-product-editor";
import { SellerBalance } from "./seller-balance";
import { SellerProfile } from "./seller-profile";

type Tab = "home" | "orders" | "products" | "balance";

/** What the screens need from the app: moving between screens and short messages. */
export type SellerNav = {
  go: (screen: Screen) => void;
  tab: (tab: Tab) => void;
  back: () => void;
  notice: (text: string) => void;
  error: (text: string) => void;
  variant: "telegram" | "web";
};

async function signOut() {
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
  const app = telegramApp();
  if (app) app.close(); else window.location.assign("/");
}

/**
 * The seller's own app, the same in the shop bot's Mini App and in a browser at /shop: home, orders,
 * products and balance, with a profile behind the home screen. Before the shop is active it shows the
 * application and its status only.
 */
export function SellerApp({ shop, staff, variant, initialOpen }: { shop: SellerShop | null; staff: boolean; variant: "telegram" | "web"; initialOpen?: string | null }) {
  const { locale } = useSitePreferences();
  const c = sellerAppCopy[locale];
  const seller = sellerCopy[locale];
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [stack, setStack] = useState<Screen[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // A link from a bot message opens straight on its screen: ?open=order:<id>, product:<id>, orders, balance.
  useEffect(() => {
    if (!initialOpen) return;
    const [kind, id] = initialOpen.split(":");
    if (kind === "order" && id) setStack([{ kind: "order", id }]);
    else if (kind === "product" && id) setStack([{ kind: "product", id }]);
    else if (kind === "orders" || kind === "balance" || kind === "products") setTab(kind);
  }, [initialOpen]);

  const nav: SellerNav = {
    go: useCallback((screen: Screen) => { setStack(current => [...current, screen]); window.scrollTo(0, 0); }, []),
    tab: useCallback((next: Tab) => { setStack([]); setTab(next); window.scrollTo(0, 0); }, []),
    back: useCallback(() => setStack(current => current.slice(0, -1)), []),
    notice: useCallback((text: string) => { setError(""); setNotice(text); }, []),
    error: useCallback((text: string) => { setNotice(""); setError(text || c.common.failed); }, [c.common.failed]),
    variant
  };

  const toasts = <><ToastMessage message={error} variant="error" /><ToastMessage message={notice} variant="success" /></>;

  if (staff) return <TmaShell app="shop" variant={variant}>{toasts}<p className="tma-empty">{c.apply.staff}</p>
    <section className="tma-section tma-list"><button type="button" className="tma-row-button is-danger" onClick={() => void signOut()}>{c.profile.logout}</button></section></TmaShell>;

  if (!shop) return <TmaShell app="shop" variant={variant}>
    {toasts}
    <header className="tma-hello"><span className="tma-eyebrow">{seller.title}</span><h1>{c.apply.title}</h1></header>
    <p className="tma-hint">{c.apply.hint}</p>
    <ul className="tma-points">{seller.points.map(point => <li key={point}>{point}</li>)}</ul>
    <section className="tma-section tma-form"><ShopForm shop={null} onSaved={() => router.refresh()} /></section>
  </TmaShell>;

  if (shop.status !== "ACTIVE") {
    const status = seller.status[shop.status] ?? seller.status.PENDING;
    return <TmaShell app="shop" variant={variant}>
      {toasts}
      <header className="tma-hello"><span className="tma-eyebrow">{seller.title}</span><h1>{shop.name}</h1></header>
      <section className={`tma-section tma-status is-${shop.status.toLowerCase()}`} role="status">
        <strong>{status.title}</strong><p>{status.text}</p>
        {shop.reviewNote && <p><strong>{seller.reason}:</strong> {shop.reviewNote}</p>}
      </section>
      {shop.status !== "SUSPENDED" && <><h2 className="tma-section-title">{seller.profile}</h2>
        <details className="tma-section tma-form" open={shop.status === "REJECTED"}><summary>{shop.legalName ?? shop.name}</summary><ShopForm shop={shop} onSaved={() => router.refresh()} /></details></>}
      <section className="tma-section tma-list"><button type="button" className="tma-row-button is-danger" onClick={() => void signOut()}>{c.profile.logout}</button></section>
    </TmaShell>;
  }

  const screen = stack[stack.length - 1];
  if (screen) {
    return <TmaShell app="shop" variant={variant}>
      {toasts}
      {screen.kind === "order" && <SellerOrderDetail id={screen.id} nav={nav} />}
      {screen.kind === "product" && <SellerProductDetail id={screen.id} nav={nav} />}
      {screen.kind === "editor" && <SellerProductEditor id={screen.id} nav={nav} />}
      {screen.kind === "profile" && <SellerProfile shop={shop} nav={nav} onSignOut={() => void signOut()} onSaved={() => router.refresh()} />}
    </TmaShell>;
  }

  const tabs = [
    { id: "home", label: c.tabs.home, icon: TabIcon.home },
    { id: "orders", label: c.tabs.orders, icon: TabIcon.orders },
    { id: "products", label: c.tabs.products, icon: TabIcon.products },
    { id: "balance", label: c.tabs.balance, icon: TabIcon.balance }
  ];
  return <TmaShell app="shop" variant={variant} tabs={tabs} active={tab} onTab={id => nav.tab(id as Tab)}>
    {toasts}
    {tab === "home" && <SellerHome nav={nav} />}
    {tab === "orders" && <SellerOrders nav={nav} />}
    {tab === "products" && <SellerProducts nav={nav} />}
    {tab === "balance" && <SellerBalance nav={nav} />}
  </TmaShell>;
}
