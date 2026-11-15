"use client";

import { useEffect, useState } from "react";
import { useSitePreferences } from "../site-preferences";
import { haptic } from "../tma-kit";
import { sellerAppCopy } from "@/lib/seller-app-copy";
import { formatDateTime, formatMinor } from "@/lib/format";
import { sellerApi, toMajor, toMinor, useSellerData } from "./seller-api";
import { SellerSkeleton } from "./seller-home";
import type { SellerNav } from "./seller-app";

type Details = { payoutBankName: string | null; payoutAccount: string | null; payoutMfo: string | null; payoutRecipient: string | null };
type Balance = {
  balanceMinor: number; pendingMinor: number; commissionPercent: number; referralCommissionPercent: number;
  ledger: { id: string; kind: string; amountMinor: number; balanceAfterMinor: number; note: string | null; createdAt: string }[];
  payouts: { id: string; amountMinor: number; status: string; reviewNote: string | null; paymentReference: string | null; createdAt: string }[];
  details: Details;
};

/** Money: what can be withdrawn, what is on the way, every movement, payout requests and bank details. */
export function SellerBalance({ nav }: { nav: SellerNav }) {
  const { locale } = useSitePreferences();
  const c = sellerAppCopy[locale];
  const b = c.balance;
  const { data, failed, reload } = useSellerData<Balance>("/api/shop/balance");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState({ payoutBankName: "", payoutAccount: "", payoutMfo: "", payoutRecipient: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!data) return;
    setDetails({ payoutBankName: data.details.payoutBankName ?? "", payoutAccount: data.details.payoutAccount ?? "", payoutMfo: data.details.payoutMfo ?? "", payoutRecipient: data.details.payoutRecipient ?? "" });
  }, [data]);

  if (failed && !data) return <div className="tma-empty"><p>{c.common.failed}</p><button type="button" className="tma-button secondary" onClick={reload}>{c.common.retry}</button></div>;
  if (!data) return <SellerSkeleton />;
  const money = (minor: number) => formatMinor(minor, "UZS", locale);
  const hasDetails = Boolean(data.details.payoutBankName && data.details.payoutAccount && data.details.payoutMfo && data.details.payoutRecipient);
  const openPayout = data.payouts.some(payout => payout.status === "REQUESTED");

  async function requestPayout() {
    const amountMinor = toMinor(amount);
    if (amountMinor === null || amountMinor > data!.balanceMinor) { haptic.error(); nav.error(c.products.balanceLow); return; }
    setBusy(true);
    const result = await sellerApi("/api/shop/payouts", { method: "POST", body: { amountMinor } });
    setBusy(false);
    if (!result.ok) { haptic.error(); nav.error(result.error); return; }
    haptic.success();
    nav.notice(b.requested);
    setAmount("");
    reload();
  }

  async function saveDetails() {
    setBusy(true);
    const result = await sellerApi("/api/shop/balance", { method: "PUT", body: details });
    setBusy(false);
    if (!result.ok) { haptic.error(); nav.error(result.error); return; }
    haptic.success();
    nav.notice(c.common.done);
    reload();
  }

  return <>
    <h1 className="tma-title">{b.title}</h1>
    <section className="tma-section tma-balance">
      <span className="tma-eyebrow">{b.available}</span>
      <strong>{money(data.balanceMinor)}</strong>
      <span className="tma-money-row"><span>{b.pending}</span><b>{money(data.pendingMinor)}</b></span>
      <p className="tma-hint tma-hint-flat">{b.pendingHint}</p>
      <span className="tma-money-row"><span>{b.commission}</span><b>{data.commissionPercent}% · {b.referral} {data.referralCommissionPercent}%</b></span>
    </section>

    <h2 className="tma-section-title">{b.payout}</h2>
    <section className="tma-section tma-form">
      <p className="tma-hint tma-hint-flat">{b.payoutHint}</p>
      {!hasDetails ? <p className="tma-notice is-warning">{b.needDetails}</p> : openPayout ? <p className="tma-notice">{b.payoutStatus.REQUESTED}</p> : <>
        <div className="tma-form-row is-tight">
          <div className="field"><label htmlFor="payout-amount">{b.amount}</label><input id="payout-amount" inputMode="decimal" value={amount} onChange={event => setAmount(event.target.value)} /></div>
          <button type="button" className="tma-chip" onClick={() => setAmount(toMajor(data.balanceMinor))}>{b.all}</button>
        </div>
        <button type="button" className="tma-button" disabled={busy || data.balanceMinor <= 0} onClick={() => void requestPayout()}>{b.request}</button>
      </>}
    </section>

    {data.payouts.length > 0 && <>
      <h2 className="tma-section-title">{b.payouts}</h2>
      <section className="tma-section tma-list">{data.payouts.map(payout => <div className="tma-item is-static" key={payout.id}>
        <span className="tma-item-top"><strong>{money(payout.amountMinor)}</strong><span className={`tma-pill ${payout.status === "PAID" ? "is-delivered" : payout.status === "REJECTED" ? "is-cancelled" : "is-new"}`}>{b.payoutStatus[payout.status]}</span></span>
        <span className="tma-item-meta">{formatDateTime(payout.createdAt)}{payout.paymentReference ? ` · № ${payout.paymentReference}` : ""}</span>
        {payout.reviewNote && <span className="tma-item-sub">{payout.reviewNote}</span>}
      </div>)}</section>
    </>}

    <h2 className="tma-section-title">{b.history}</h2>
    {data.ledger.length === 0 ? <p className="tma-empty">{b.noHistory}</p> : <section className="tma-section tma-list">
      {data.ledger.map(entry => <div className="tma-item is-static" key={entry.id}>
        <span className="tma-item-top"><strong>{b.kinds[entry.kind] ?? entry.kind}</strong><strong className={entry.amountMinor > 0 ? "tma-plus" : "tma-minus"}>{entry.amountMinor > 0 ? "+" : "−"}{money(Math.abs(entry.amountMinor))}</strong></span>
        <span className="tma-item-sub">{entry.note ?? ""}</span>
        <span className="tma-item-meta">{formatDateTime(entry.createdAt)} · {c.home.balance}: {money(entry.balanceAfterMinor)}</span>
      </div>)}
    </section>}

    <h2 className="tma-section-title">{b.details}</h2>
    <section className="tma-section tma-form">
      <p className="tma-hint tma-hint-flat">{b.detailsHint}</p>
      <div className="field"><label htmlFor="d-recipient">{b.recipient}</label><input id="d-recipient" value={details.payoutRecipient} maxLength={160} onChange={event => setDetails({ ...details, payoutRecipient: event.target.value })} /></div>
      <div className="field"><label htmlFor="d-bank">{b.bank}</label><input id="d-bank" value={details.payoutBankName} maxLength={120} onChange={event => setDetails({ ...details, payoutBankName: event.target.value })} /></div>
      <div className="field"><label htmlFor="d-account">{b.account}</label><input id="d-account" inputMode="numeric" value={details.payoutAccount} maxLength={24} onChange={event => setDetails({ ...details, payoutAccount: event.target.value.replace(/[^\d ]/g, "") })} /></div>
        <div className="field"><label htmlFor="d-mfo">{b.mfo}</label><input id="d-mfo" inputMode="numeric" value={details.payoutMfo} maxLength={5} onChange={event => setDetails({ ...details, payoutMfo: event.target.value.replace(/\D/g, "") })} /></div>
      <button type="button" className="tma-button secondary" disabled={busy} onClick={() => void saveDetails()}>{b.saveDetails}</button>
    </section>
  </>;
}
