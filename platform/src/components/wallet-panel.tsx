"use client";

import { useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";
import { formatNumber } from "@/lib/format";

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
    <ToastMessage message={error} variant="error" />
    {rows.length ? <div className="list">{rows.map((item) => <article className="list-row" key={item.id}>
      <div><strong>{item.user.name} · {item.user.email}</strong><p>{item.kind === "DEPOSIT" ? t("walletDeposit") : t("walletWithdrawal")} · {formatNumber(item.amountMinor / 100)} UZS</p><p className="small muted">{item.reference ?? item.details}</p>{item.proofMediaId && <a href={`/api/media/${item.proofMediaId}`} target="_blank" rel="noreferrer">{t("walletProof")}</a>}</div>
      <div className="hero-actions"><button className="button" disabled={busy === item.id} onClick={() => void review(item.id, "APPROVED")}>{t("walletApproved")}</button><button className="button danger" disabled={busy === item.id} onClick={() => void review(item.id, "REJECTED")}>{t("walletRejected")}</button></div>
    </article>)}</div> : <p className="muted">{t("walletNoRequests")}</p>}
  </section>;
}
