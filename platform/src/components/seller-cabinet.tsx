"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ToastMessage } from "./toast-provider";
import { useSitePreferences } from "./site-preferences";
import { sellerCopy } from "@/lib/seller-copy";
import { regionCodes, regionNames } from "@/lib/delivery";
import { formatMinor } from "@/lib/format";

export type SellerShop = {
  id: string; slug: string; name: string; status: string; phone: string; telegram: string | null; instagram: string | null;
  region: string | null; city: string | null; address: string | null; description: string | null; legalName: string | null; tin: string | null;
  commissionPercent: number; referralCommissionPercent: number; balanceMinor: number; reviewNote: string | null;
};

/** The application, and later the profile: the same fields, so a rejected application is fixed in place. */
function ShopForm({ shop, onSaved }: { shop: SellerShop | null; onSaved: () => void }) {
  const { locale } = useSitePreferences();
  const c = sellerCopy[locale];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/shop", { method: shop ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? c.failed);
      setNotice(c.saved);
      onSaved();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : c.failed);
    } finally {
      setBusy(false);
    }
  }

  const f = c.form;
  return <form className="form seller-form" onSubmit={submit}>
    <ToastMessage message={error} variant="error" />
    <ToastMessage message={notice} variant="success" />
    <div className="form-row">
      <div className="field"><label htmlFor="shop-name">{f.name}</label><input id="shop-name" name="name" required minLength={2} maxLength={60} defaultValue={shop?.name ?? ""} autoComplete="organization" /></div>
      <div className="field"><label htmlFor="shop-phone">{f.phone}</label><input id="shop-phone" name="phone" required minLength={7} maxLength={30} type="tel" inputMode="tel" placeholder="+998 90 123 45 67" defaultValue={shop?.phone ?? ""} /></div>
    </div>
    <div className="form-row">
      <div className="field"><label htmlFor="shop-telegram">{f.telegram}</label><input id="shop-telegram" name="telegram" maxLength={80} placeholder="@dokon" defaultValue={shop?.telegram ? `@${shop.telegram}` : ""} /></div>
      <div className="field"><label htmlFor="shop-instagram">{f.instagram}</label><input id="shop-instagram" name="instagram" maxLength={80} placeholder="@dokon" defaultValue={shop?.instagram ? `@${shop.instagram}` : ""} /></div>
    </div>
    <div className="form-row">
      <div className="field"><label htmlFor="shop-region">{f.region}</label>
        <select id="shop-region" name="region" required defaultValue={shop?.region ?? ""}>
          <option value="">{f.chooseRegion}</option>
          {regionCodes.map(code => <option key={code} value={code}>{regionNames[locale][code]}</option>)}
        </select>
      </div>
      <div className="field"><label htmlFor="shop-city">{f.city}</label><input id="shop-city" name="city" required minLength={2} maxLength={80} defaultValue={shop?.city ?? ""} /></div>
    </div>
    <div className="field"><label htmlFor="shop-address">{f.address}</label><input id="shop-address" name="address" required minLength={5} maxLength={300} defaultValue={shop?.address ?? ""} /></div>
    <div className="field"><label htmlFor="shop-description">{f.description}</label><textarea id="shop-description" name="description" maxLength={600} rows={3} defaultValue={shop?.description ?? ""} /></div>
    <p className="small muted">{f.legalHint}</p>
    <div className="form-row">
      <div className="field"><label htmlFor="shop-legal">{f.legalName}</label><input id="shop-legal" name="legalName" required minLength={2} maxLength={160} defaultValue={shop?.legalName ?? ""} /></div>
      <div className="field"><label htmlFor="shop-tin">{f.tin}</label><input id="shop-tin" name="tin" required inputMode="numeric" pattern="[0-9]{9}|[0-9]{14}" maxLength={14} defaultValue={shop?.tin ?? ""} /></div>
    </div>
    <div><button className="button" disabled={busy}>{busy ? (shop ? c.saving : c.applying) : shop?.status === "REJECTED" ? c.resubmit : shop ? c.save : c.apply}</button></div>
  </form>;
}

export function SellerCabinet({ shop, staff = false, siteUrl }: { shop: SellerShop | null; staff?: boolean; siteUrl: string }) {
  const { locale } = useSitePreferences();
  const c = sellerCopy[locale];
  const router = useRouter();
  const refresh = () => router.refresh();

  if (staff) return <div className="container page-shell seller-page"><h1 className="page-title">{c.title}</h1><p className="empty-state">{c.staffAccount}</p></div>;

  if (!shop) return <div className="container page-shell seller-page">
    <span className="eyebrow">{c.title}</span>
    <h1 className="page-title">{c.introTitle}</h1>
    <p className="muted seller-intro">{c.intro}</p>
    <ul className="seller-points">{c.points.map(point => <li key={point}>{point}</li>)}</ul>
    <section className="panel-card"><ShopForm shop={null} onSaved={refresh} /></section>
  </div>;

  const status = c.status[shop.status] ?? c.status.PENDING;
  const link = `${siteUrl.replace(/\/$/, "")}/s/${shop.slug}`;
  return <div className="container page-shell seller-page">
    <span className="eyebrow">{c.title}</span>
    <h1 className="page-title">{shop.name}</h1>
    <section className={`panel-card seller-status is-${shop.status.toLowerCase()}`} role="status">
      <strong>{status.title}</strong>
      <p>{status.text}</p>
      {shop.reviewNote && (shop.status === "REJECTED" || shop.status === "SUSPENDED") && <p><strong>{c.reason}:</strong> {shop.reviewNote}</p>}
    </section>
    {shop.status === "ACTIVE" && <div className="seller-stats">
      <div className="panel-card"><span className="small muted">{c.balance}</span><strong>{formatMinor(shop.balanceMinor, "UZS", locale)}</strong><span className="small muted">{c.balanceHint}</span></div>
      <div className="panel-card"><span className="small muted">{c.commission}</span><strong>{shop.commissionPercent}%</strong><span className="small muted">{c.referral}: {shop.referralCommissionPercent}%</span></div>
      <div className="panel-card"><span className="small muted">{c.link}</span><strong className="seller-link">{link.replace(/^https?:\/\//, "")}</strong></div>
    </div>}
    {shop.status !== "SUSPENDED" && <details className="admin-records-accordion" open={shop.status === "REJECTED"}>
      <summary>{c.profile}</summary>
      <ShopForm shop={shop} onSaved={refresh} />
    </details>}
  </div>;
}
