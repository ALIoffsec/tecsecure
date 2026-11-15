"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ToastMessage } from "./toast-provider";
import { useSitePreferences } from "./site-preferences";
import { sellerCopy } from "@/lib/seller-copy";
import { siteCopy } from "@/lib/site-copy";
import { regionCodes, regionNames, type RegionCode } from "@/lib/delivery";
import { formatDateTime, formatMinor } from "@/lib/format";
import { shopStatuses } from "@/lib/shops";
import { AdminDisputes, AdminModeration, AdminPayoutHold, AdminPayouts, AdminPromotion } from "./admin-marketplace";

export type MarketplaceView = "shops" | "moderation" | "payouts" | "disputes" | "promotion";
const viewNames: Record<string, Record<MarketplaceView, string>> = {
  uz: { shops: "Do‘konlar", moderation: "Moderatsiya", payouts: "To‘lovlar", disputes: "Murojaatlar", promotion: "Sozlamalar" },
  ru: { shops: "Магазины", moderation: "Модерация", payouts: "Выплаты", disputes: "Претензии", promotion: "Настройки" },
  en: { shops: "Shops", moderation: "Moderation", payouts: "Payouts", disputes: "Complaints", promotion: "Settings" }
};

export type AdminShop = {
  id: string; slug: string; name: string; status: string; phone: string; telegram: string | null; instagram: string | null;
  region: string | null; city: string | null; address: string | null; description: string | null; legalName: string | null; tin: string | null;
  commissionPercent: number; referralCommissionPercent: number; balanceMinor: number; reviewNote: string | null; createdAt: Date | string;
  owner: { name: string; email: string; phone: string | null };
};

function ShopCard({ shop }: { shop: AdminShop }) {
  const { locale } = useSitePreferences();
  const c = sellerCopy[locale];
  const a = c.admin;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [note, setNote] = useState("");
  const [commission, setCommission] = useState(String(shop.commissionPercent));
  const [referral, setReferral] = useState(String(shop.referralCommissionPercent));

  async function act(action: "APPROVE" | "REJECT" | "SUSPEND" | "REACTIVATE" | "UPDATE") {
    if (action === "REJECT" && note.trim().length < 3) { setError(a.noteNeeded); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/shops/${shop.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...(note.trim() ? { note: note.trim() } : {}), commissionPercent: Number(commission), referralCommissionPercent: Number(referral) })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? siteCopy[locale].admin.failed);
      setNotice(a.done);
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : siteCopy[locale].admin.failed);
    } finally {
      setBusy(false);
    }
  }

  const region = shop.region && (regionCodes as readonly string[]).includes(shop.region) ? regionNames[locale][shop.region as RegionCode] : null;
  return <article className="panel-card order-card admin-shop-card">
    <div className="order-head">
      <div><h2>{shop.name}</h2><span className="small muted">{a.applied}: {formatDateTime(shop.createdAt)} · /s/{shop.slug}</span></div>
      <span className={`order-status${shop.status === "ACTIVE" ? " is-done" : shop.status === "REJECTED" || shop.status === "SUSPENDED" ? " is-cancelled" : ""}`}>{c.status[shop.status]?.title ?? shop.status}</span>
    </div>
    <div className="order-body">
      <p className="order-customer">
        <a href={`tel:${shop.phone.replace(/[^\d+]/g, "")}`}>{shop.phone}</a>
        {shop.telegram && <> · <a href={`https://t.me/${shop.telegram}`} target="_blank" rel="noreferrer">@{shop.telegram}</a></>}
        {shop.instagram && <> · <a href={`https://instagram.com/${shop.instagram}`} target="_blank" rel="noreferrer">IG @{shop.instagram}</a></>}<br />
        {[region, shop.city, shop.address].filter(Boolean).join(", ")}<br />
        <span className="small">{a.legal}: {shop.legalName} · STIR {shop.tin}</span><br />
        <span className="small muted">{a.owner}: {shop.owner.name} ({shop.owner.email})</span>
      </p>
      {shop.description && <p className="small">{shop.description}</p>}
      {shop.reviewNote && <p className="small"><strong>{c.reason}:</strong> {shop.reviewNote}</p>}
      {shop.status === "ACTIVE" && <p className="small">{c.balance}: <strong>{formatMinor(shop.balanceMinor, "UZS", locale)}</strong></p>}
      <div className="form-row admin-shop-rates">
        <div className="field"><label htmlFor={`commission-${shop.id}`}>{a.commission}</label><input id={`commission-${shop.id}`} inputMode="decimal" value={commission} onChange={event => setCommission(event.target.value)} /></div>
        <div className="field"><label htmlFor={`referral-${shop.id}`}>{a.referral}</label><input id={`referral-${shop.id}`} inputMode="decimal" value={referral} onChange={event => setReferral(event.target.value)} /></div>
      </div>
      {(shop.status === "PENDING" || shop.status === "ACTIVE") && <div className="field"><label htmlFor={`note-${shop.id}`}>{a.note}</label><input id={`note-${shop.id}`} value={note} maxLength={500} onChange={event => setNote(event.target.value)} /></div>}
      <ToastMessage message={error} variant="error" />
      <ToastMessage message={notice} variant="success" />
      <div className="order-actions">
        {(shop.status === "PENDING" || shop.status === "REJECTED") && <button className="button" type="button" disabled={busy} onClick={() => void act("APPROVE")}>{a.approve}</button>}
        {shop.status === "PENDING" && <button className="button danger" type="button" disabled={busy} onClick={() => void act("REJECT")}>{a.reject}</button>}
        {shop.status === "ACTIVE" && <button className="button danger" type="button" disabled={busy} onClick={() => void act("SUSPEND")}>{a.suspend}</button>}
        {shop.status === "SUSPENDED" && <button className="button" type="button" disabled={busy} onClick={() => void act("REACTIVATE")}>{a.reactivate}</button>}
        <button className="button secondary" type="button" disabled={busy} onClick={() => void act("UPDATE")}>{a.saveCommission}</button>
      </div>
    </div>
  </article>;
}

export function AdminShops({ shops, counts, status, view = "shops", waiting }: { shops: AdminShop[]; counts: Record<string, number>; status?: string; view?: MarketplaceView; waiting: { moderation: number; payouts: number; disputes: number } }) {
  const { locale } = useSitePreferences();
  const c = sellerCopy[locale];
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const names = viewNames[locale] ?? viewNames.uz;
  const badge = (key: MarketplaceView) => {
    const count = key === "moderation" || key === "payouts" || key === "disputes" ? waiting[key] : 0;
    return count ? ` · ${count}` : "";
  };
  return <div className="container page-shell admin-orders admin-shops">
    <Link className="small text-link" href="/admin">← {siteCopy[locale].admin.back}</Link>
    <h1 className="page-title">{c.admin.title}</h1>
    <nav className="admin-management-tabs admin-marketplace-tabs" aria-label={c.admin.title}>
      {(Object.keys(names) as MarketplaceView[]).map(key => <Link key={key} className={`admin-management-category${view === key ? " active" : ""}`} href={key === "shops" ? "/admin/shops" : `/admin/shops?view=${key}`}>{names[key]}{badge(key)}</Link>)}
    </nav>
    {view === "moderation" && <AdminModeration />}
    {view === "payouts" && <AdminPayouts />}
    {view === "disputes" && <AdminDisputes />}
    {view === "promotion" && <div className="admin-marketplace-settings"><AdminPromotion /><AdminPayoutHold /></div>}
    {view === "shops" && <>
    <nav className="shop-cats" aria-label={c.admin.title}>
      <Link className={`shop-chip${!status ? " is-active" : ""}`} href="/admin/shops">{c.admin.all} · {total}</Link>
      {shopStatuses.map(value => <Link className={`shop-chip${status === value ? " is-active" : ""}`} key={value} href={`/admin/shops?status=${value}`}>{c.status[value].title} · {counts[value] ?? 0}</Link>)}
    </nav>
    {shops.length === 0 && <div className="empty-state">{c.admin.empty}</div>}
    <div className="stack">{shops.map(shop => <ShopCard key={shop.id} shop={shop} />)}</div>
    </>}
  </div>;
}
