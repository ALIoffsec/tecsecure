"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { MediaUploader } from "@/components/media-uploader";
import { useSitePreferences } from "@/components/site-preferences";

type WalletRecord = {
  id: string;
  kind: string;
  status: string;
  amountMinor: number;
  reference: string | null;
  details: string | null;
  proofMediaId: string | null;
  createdAt: Date;
};

export function WalletPanel({ initialBalance, initialPoints, transactions }: {
  initialBalance: number;
  initialPoints: number;
  transactions: WalletRecord[];
}) {
  const router = useRouter();
  const { locale, t } = useSitePreferences();
  const [kind, setKind] = useState<"DEPOSIT" | "WITHDRAWAL">("DEPOSIT");
  const [proof, setProof] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const rank = initialPoints >= 2000 ? t("rankGold") : initialPoints >= 500 ? t("rankSilver") : t("rankStarter");
  const numberLocale = locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const amountMinor = Math.round(Number(data.get("amount")) * 100);
    if (kind === "WITHDRAWAL" && amountMinor > initialBalance) {
      setError(t("walletRequestTooLarge")); setBusy(false); return;
    }
    const payload = kind === "DEPOSIT"
      ? { kind, amountMinor, reference: data.get("reference"), proofMediaId: proof[0] }
      : { kind, amountMinor, details: data.get("details") };
    try {
      const response = await fetch("/api/wallet", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      setNotice(t("walletRequestSubmitted")); setProof([]);
      form.reset();
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setBusy(false);
    }
  }


  return <section className="panel-card">
    <h2>{t("wallet")}</h2>
    <div className="dashboard-grid">
      <div className="metric"><strong>{(initialBalance / 100).toLocaleString(numberLocale)} UZS</strong><span>{t("walletBalance")}</span></div>
      <div className="metric"><strong>{initialPoints.toLocaleString(numberLocale)}</strong><span>{t("rewardPoints")}</span></div>
      <div className="metric"><strong>{rank}</strong><span>{t("rewardRank")}</span></div>
    </div>
    <p className="small muted">{t("tecEarnRate")}</p>
    <p className="small muted">{t("rankPerks")}</p>
    <div className="panel-card wallet-tec-purchase">
      <h3>{t("tecPurchaseTitle")}</h3>
      <p className="small muted">{t("tecPurchaseDescription")}</p>
      <Link className="button" href="/store">{t("learningStore")}</Link>
    </div>
    <div className="hero-actions">
      <button className={`button ${kind === "DEPOSIT" ? "" : "ghost"}`} type="button" onClick={() => { setKind("DEPOSIT"); setError(""); }}>{t("depositRequest")}</button>
      <button className={`button ${kind === "WITHDRAWAL" ? "" : "ghost"}`} type="button" onClick={() => { setKind("WITHDRAWAL"); setError(""); }}>{t("withdrawalRequest")}</button>
    </div>
    <form className="form" onSubmit={submit}>
      <div className="field"><label htmlFor="wallet-amount">{t("walletAmount")}</label><input id="wallet-amount" name="amount" type="number" min="1" max="20000000" step="0.01" required /></div>
      {kind === "DEPOSIT" ? <>
        <div className="field"><label htmlFor="wallet-reference">{t("walletReference")}</label><input id="wallet-reference" name="reference" minLength={2} maxLength={160} required /></div>
        <MediaUploader scope="WALLET" value={proof} onChange={setProof} />
      </> : <div className="field"><label htmlFor="wallet-details">{t("walletPayoutDetails")}</label><textarea id="wallet-details" name="details" minLength={10} maxLength={2000} required /></div>}
      {error && <div className="notice error" role="alert">{error}</div>}
      {notice && <div className="notice success" role="status">{notice}</div>}
      <button className="button" type="submit" disabled={busy || (kind === "DEPOSIT" && !proof.length)}>{busy ? t("saving") : t("submitWalletRequest")}</button>
    </form>
    <h3 style={{ marginTop: 26 }}>{t("wallet")}</h3>
    {transactions.length ? <div className="list">{transactions.map((item) => <div className="list-row" key={item.id}>
      <div><strong>{item.kind === "DEPOSIT" ? t("walletDeposit") : item.kind === "TEC_PURCHASE" ? t("tecPurchaseHistory") : t("walletWithdrawal")} · {(item.amountMinor / 100).toLocaleString(numberLocale)} UZS</strong><p className="small muted">{item.reference ?? item.details} · {new Date(item.createdAt).toLocaleDateString(numberLocale)}</p></div>
      <span className={`status ${item.status}`}>{item.status === "PENDING" ? t("walletPending") : item.status === "APPROVED" ? t("walletApproved") : t("walletRejected")}</span>
    </div>)}</div> : <p className="muted">{t("walletNoRequests")}</p>}
  </section>;
}

type ReviewRecord = {
  id: string;
  kind: string;
  amountMinor: number;
  reference: string | null;
  details: string | null;
  proofMediaId: string | null;
  createdAt: Date;
  user: { name: string; email: string; walletBalanceMinor: number };
};

export function WalletReviewManager({ transactions }: { transactions: ReviewRecord[] }) {
  const { locale, t } = useSitePreferences();
  const [rows, setRows] = useState(transactions);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function review(id: string, status: "APPROVED" | "REJECTED") {
    setBusy(id); setError("");
    try {
      const response = await fetch("/api/admin/wallet", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      setRows(rows.filter((row) => row.id !== id));
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setBusy("");
    }
  }

  return <section className="panel-card">
    <h2>{t("walletReview")}</h2>
    {error && <div className="notice error" role="alert">{error}</div>}
    {rows.length ? <div className="list">{rows.map((item) => <article className="list-row" key={item.id}>
      <div><strong>{item.user.name} · {item.user.email}</strong><p>{item.kind === "DEPOSIT" ? t("walletDeposit") : t("walletWithdrawal")} · {(item.amountMinor / 100).toLocaleString(locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US")} UZS</p><p className="small muted">{item.reference ?? item.details}</p>{item.proofMediaId && <a href={`/api/media/${item.proofMediaId}`} target="_blank" rel="noreferrer">{t("walletProof")}</a>}</div>
      <div className="hero-actions"><button className="button" disabled={busy === item.id} onClick={() => void review(item.id, "APPROVED")}>{t("walletApproved")}</button><button className="button danger" disabled={busy === item.id} onClick={() => void review(item.id, "REJECTED")}>{t("walletRejected")}</button></div>
    </article>)}</div> : <p className="muted">{t("walletNoRequests")}</p>}
  </section>;
}
