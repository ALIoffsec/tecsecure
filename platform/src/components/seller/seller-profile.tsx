"use client";

import { useState } from "react";
import { useSitePreferences } from "../site-preferences";
import { ShopForm, type SellerShop } from "../seller-cabinet";
import { haptic, useBackButton } from "../tma-kit";
import { sellerAppCopy } from "@/lib/seller-app-copy";
import { sellerCopy } from "@/lib/seller-copy";
import { sellerApi, useSellerData } from "./seller-api";
import type { SellerOverview } from "./seller-types";
import type { SellerNav } from "./seller-app";

/** Shop settings: Telegram messages, the shop's details, its page, QR code and visit card, and sign-out. */
export function SellerProfile({ shop, nav, onSignOut, onSaved }: { shop: SellerShop; nav: SellerNav; onSignOut: () => void; onSaved: () => void }) {
  const { locale } = useSitePreferences();
  const c = sellerAppCopy[locale];
  const seller = sellerCopy[locale];
  const overview = useSellerData<SellerOverview>("/api/shop/overview");
  const [notify, setNotify] = useState<boolean | null>(null);
  useBackButton(nav.back);
  const notifyOn = notify ?? overview.data?.shop.notifyOrders ?? true;

  async function toggleNotify() {
    const next = !notifyOn;
    setNotify(next);
    const result = await sellerApi("/api/shop/settings", { method: "PATCH", body: { notifyOrders: next } });
    if (!result.ok) { setNotify(!next); nav.error(result.error); return; }
    haptic.select();
  }

  return <>
    <header className="tma-detail-head"><span className="tma-eyebrow">{seller.title}</span><h1>{c.profile.title}</h1></header>
    <section className="tma-section tma-list">
      <label className="tma-switch-row">
        <span><strong>{c.profile.notify}</strong><small>{c.profile.notifyHint}</small></span>
        <input type="checkbox" role="switch" checked={notifyOn} onChange={() => void toggleNotify()} />
      </label>
    </section>
    <section className="tma-section tma-list">
      <a className="tma-row-button" href={`/s/${shop.slug}`} target="_blank" rel="noreferrer">{c.profile.storefront}</a>
      <a className="tma-row-button" href={`/api/shops/${shop.slug}/qr?size=1600`} download={`tecsecure-${shop.slug}-qr.png`}>{c.profile.qr}</a>
      <a className="tma-row-button" href={`/s/${shop.slug}/card`} target="_blank" rel="noreferrer">{c.profile.card}</a>
      {nav.variant === "telegram" && <a className="tma-row-button" href="/shop" target="_blank" rel="noreferrer">{c.profile.web}</a>}
    </section>
    <h2 className="tma-section-title">{c.profile.info}</h2>
    <details className="tma-section tma-form"><summary>{shop.legalName ?? shop.name}{shop.city ? ` · ${shop.city}` : ""}</summary><ShopForm shop={shop} onSaved={onSaved} /></details>
    <section className="tma-section tma-list"><button type="button" className="tma-row-button is-danger" onClick={onSignOut}>{c.profile.logout}</button></section>
  </>;
}
