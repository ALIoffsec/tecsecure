"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";
import { formatDate, formatDateTime, formatMinor } from "@/lib/format";
import { customerRequestsCopy } from "@/lib/customer-requests-copy";
import { parseSomInput } from "@/lib/money-input";
import { translateMessage } from "@/lib/server-messages";
import type { CabinetInvoice } from "@/lib/cabinet-requests-data";
import type { CompanyRequisites } from "@/lib/payment-card";
import { StatusBadge } from "./sections";

/** A value with its own copy button; the result is said once, quietly. */
function Copyable({ value }: { value: string }) {
  const { locale } = useSitePreferences();
  const w = customerRequestsCopy[locale];
  const [copied, setCopied] = useState(false);
  return <span className="cab-copy">
    <span>{value}</span>
    <button type="button" className="button ghost cab-copy-button print-hide" onClick={() => { void navigator.clipboard?.writeText(value).then(() => setCopied(true)).catch(() => setCopied(false)); }}>
      <UiIcon name="copy" size={16} /><span className="sr-only">{w.copy}: {value}</span>
    </button>
    {copied && <span className="small muted" role="status">{w.copied}</span>}
  </span>;
}

/** "To‘lov uchun hisob": where and how much to pay, what is paid and checked, and the payment report. */
export function InvoiceView({ invoice, seller, backHref }: { invoice: CabinetInvoice; seller: CompanyRequisites | null; backHref: string }) {
  const { locale } = useSitePreferences();
  const w = customerRequestsCopy[locale];
  const router = useRouter();
  const money = (value: number) => formatMinor(value, invoice.currency, locale);
  const payable = ["ISSUED", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status) && invoice.sums.leftMinor > 0;
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  async function report() {
    const amountMinor = parseSomInput(amount);
    if (!amountMinor || amountMinor > invoice.sums.leftMinor) { setError(w.amountBad); return; }
    if (method !== "CASH" && reference.trim().length < 2) { setError(w.referenceShort); return; }
    setBusy(true); setError("");
    const response = await fetch(`/api/invoices/${invoice.id}/payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amountMinor, method, ...(method === "CASH" ? {} : { reference: reference.trim() }) }) }).catch(() => null);
    const data = await response?.json().catch(() => ({})) ?? {};
    setBusy(false);
    if (!response?.ok) { setError(typeof data.error === "string" && data.error ? translateMessage(data.error, locale) : w.failed); return; }
    setSent(true); setAmount(""); setReference("");
    router.refresh();
  }
  return <>
    <header className="cab-order-header">
      <h1 className="cab-title" tabIndex={-1}>{w.invoiceName} {invoice.number}</h1>
      <StatusBadge kind="invoice" code={invoice.status} />
      <small className="muted">{formatDate(invoice.issuedAt ?? invoice.createdAt)}</small>
    </header>
    {invoice.status === "PAID" && <p className="notice">{w.invoicePaid}</p>}
    {(invoice.status === "VOID" || invoice.status === "REFUNDED") && <p className="notice error">{w.invoiceVoid}</p>}

    <section className="panel-card" aria-labelledby="inv-sums">
      <h2 id="inv-sums">{invoice.quotation?.project.name ?? w.invoiceTitle}</h2>
      <ul className="cab-quote-lines">{invoice.items.map(item => <li key={item.id}>
        <span>{item.description}<small className="muted">{item.quantity} × {money(item.unitPriceMinor)}</small></span>
        <strong>{money(item.quantity * item.unitPriceMinor + item.taxMinor - item.discountMinor)}</strong>
      </li>)}</ul>
      <dl className="cab-facts">
        <dt>{w.total}</dt><dd><strong>{money(invoice.sums.totalMinor)}</strong></dd>
        <dt>{w.paid}</dt><dd>{money(invoice.sums.paidMinor)}</dd>
        {invoice.sums.checkingMinor > 0 && <><dt>{w.checking}</dt><dd>{money(invoice.sums.checkingMinor)}</dd></>}
        <dt>{w.left}</dt><dd>{money(invoice.sums.leftMinor)}</dd>
        {invoice.dueAt && <><dt>{w.due}</dt><dd>{formatDate(invoice.dueAt)}</dd></>}
      </dl>
    </section>

    {payable && <section className="panel-card" aria-labelledby="inv-requisites">
      <h2 id="inv-requisites">{w.requisites}</h2>
      {seller ? <dl className="cab-facts">
        <dt>{w.seller}</dt><dd><Copyable value={seller.legalName} /></dd>
        <dt>{w.tin}</dt><dd><Copyable value={seller.tin} /></dd>
        <dt>{w.bank}</dt><dd>{seller.bankName}</dd>
        <dt>{w.account}</dt><dd><Copyable value={seller.account} /></dd>
        <dt>{w.mfo}</dt><dd><Copyable value={seller.mfo} /></dd>
        {seller.address && <><dt>{w.address}</dt><dd>{seller.address}</dd></>}
      </dl> : <p className="muted">{w.noRequisites}</p>}
      <p className="small">{w.purpose(invoice.number)}</p>
    </section>}

    {payable && <section className="panel-card print-hide" aria-labelledby="inv-report">
      <h2 id="inv-report">{w.reportPayment}</h2>
      {sent && <p className="notice" role="status">{w.reportSent}</p>}
      <form className="form" onSubmit={event => { event.preventDefault(); void report(); }}>
        <div className="field"><label htmlFor="inv-amount">{w.amount}</label>
          <input id="inv-amount" inputMode="decimal" required value={amount} onChange={event => setAmount(event.target.value)} placeholder={String(Math.round(invoice.sums.leftMinor / 100))} aria-invalid={error ? true : undefined} aria-describedby={error ? "inv-error" : undefined} /></div>
        <div className="field"><label htmlFor="inv-method">{w.method}</label>
          <select id="inv-method" value={method} onChange={event => setMethod(event.target.value)}>
            <option value="BANK_TRANSFER">{w.bankTransfer}</option><option value="CASH">{w.cash}</option><option value="OTHER">{w.other}</option>
          </select></div>
        {method === "CASH"
          ? <p className="small muted">{w.referenceHint}</p>
          : <div className="field"><label htmlFor="inv-ref">{w.reference}</label><input id="inv-ref" required minLength={2} maxLength={160} value={reference} onChange={event => setReference(event.target.value)} /></div>}
        {error && <p className="notice error" role="alert" id="inv-error">{error}</p>}
        <button className="button" type="submit" disabled={busy}>{busy ? w.sending : w.reportSend}</button>
      </form>
    </section>}

    {invoice.payments.length > 0 && <section className="panel-card" aria-labelledby="inv-payments">
      <h2 id="inv-payments">{w.payments}</h2>
      <ul className="list">{invoice.payments.map(payment => <li className="list-row" key={payment.id}>
        <span><strong>{money(payment.amountMinor)}</strong><small className="muted"> · {payment.reference} · {formatDateTime(payment.createdAt)}</small></span>
        <span className={`order-status${payment.status === "VERIFIED" ? " is-done" : payment.status === "PENDING" ? " is-review" : payment.status === "REJECTED" ? " is-cancelled" : ""}`}>{w.paymentStatus[payment.status] ?? w.paymentStatus.PENDING}</span>
      </li>)}</ul>
    </section>}

    <div className="hero-actions print-hide">
      <button className="button secondary" type="button" onClick={() => window.print()}>{w.print}</button>
      <Link className="button ghost" href={backHref}>←</Link>
    </div>
  </>;
}
