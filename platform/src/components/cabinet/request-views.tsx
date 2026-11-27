"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { SiteDialog } from "@/components/site-dialog";
import { ProjectRequestForm } from "@/components/project-request-form";
import { formatDate, formatDateTime, formatMinor } from "@/lib/format";
import { statusText } from "@/lib/status-labels";
import { translateMessage } from "@/lib/server-messages";
import { customerRequestsCopy } from "@/lib/customer-requests-copy";
import { PROJECT_STAGES, QUOTE_REASON, REQUEST_STAGES, canCancelRequest, invoiceSums, projectTrack, quoteExpired, quoteTotalMinor, requestTrack } from "@/lib/customer-requests";
import type { CabinetRequestDetail, RequestRow } from "@/lib/cabinet-requests-data";
import { CabinetTitle, StatusBadge } from "./sections";
import { StatusTrack } from "./status-track";

async function send(url: string, method: "POST" | "PATCH", body: unknown): Promise<string | null> {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  if (response?.ok) return null;
  const data = await response?.json().catch(() => ({})) ?? {};
  return typeof data.error === "string" ? data.error : "";
}

function RowView({ row, waiting }: { row: RequestRow; waiting?: boolean }) {
  const { locale, t } = useSitePreferences();
  const w = customerRequestsCopy[locale];
  const title = row.title ?? t("technicalAdvice");
  return <li className="list-row is-clickable-card cab-request-row">
    <span className="cab-request-main">
      <Link className="card-link cab-order-title" href={`/portal/requests/${row.id}`}>{title}</Link>
      <small className="muted">{row.reference} · {w.changed(formatDate(row.changedAt))}</small>
    </span>
    <span className="cab-order-side">
      {waiting && row.quoteIssued ? <span className="order-status is-review">{w.quoteCame}</span>
        : waiting && row.invoiceId ? <span className="order-status is-review">{w.invoiceDue}</span>
        : <StatusBadge kind={row.badge.kind} code={row.badge.code} />}
      {waiting && row.quoteIssued && <Link className="button secondary" href={`/portal/requests/${row.id}#quote`}>{w.viewQuote}<span className="sr-only"> · {w.open(title)}</span></Link>}
      {waiting && !row.quoteIssued && row.invoiceId && <Link className="button secondary" href={`/portal/invoices/${row.invoiceId}`}>{w.openInvoice}<span className="sr-only"> · {w.open(title)}</span></Link>}
    </span>
  </li>;
}

/** "My requests": what waits on the buyer first, then what is moving, then the finished ones folded away. */
export function RequestList({ rows, catalog }: { rows: RequestRow[]; catalog: { id: string; name: string; kind: "product" | "service" }[] }) {
  const { locale } = useSitePreferences();
  const w = customerRequestsCopy[locale];
  const waiting = rows.filter(row => row.group === "waiting");
  const active = rows.filter(row => row.group === "active");
  const done = rows.filter(row => row.group === "done");
  return <>
    <div className="cab-order-header cab-title-row">
      <CabinetTitle section="requests" />
      <Link className="button" href="/request-service">+ {w.newRequest}</Link>
    </div>
    {rows.length === 0 && <div className="empty-state checkout-empty"><p><strong>{w.empty}</strong></p><p>{w.emptyHint}</p></div>}
    {waiting.length > 0 && <section aria-labelledby="req-waiting"><h2 id="req-waiting" className="cab-h2">{w.waiting}</h2><ul className="list">{waiting.map(row => <RowView key={row.id} row={row} waiting />)}</ul></section>}
    {active.length > 0 && <section aria-labelledby="req-active"><h2 id="req-active" className="cab-h2">{w.active}</h2><ul className="list">{active.map(row => <RowView key={row.id} row={row} />)}</ul></section>}
    {done.length > 0 && <details className="panel-card"><summary>{w.done(done.length)}</summary><ul className="list">{done.map(row => <RowView key={row.id} row={row} />)}</ul></details>}
    <details className="panel-card">
      <summary>{w.askPrice}</summary>
      <p className="small muted">{w.askPriceHint}</p>
      <ProjectRequestForm catalog={catalog} />
    </details>
  </>;
}

type Dialog = "accept" | "changes" | "reject" | "cancel" | null;

/**
 * One request: the next step, its quote (before the line when there is one to answer), the progress line,
 * the invoice, what the buyer asked for, the history, and cancelling while the work has not started.
 */
export function RequestDetail({ data }: { data: CabinetRequestDetail }) {
  const { locale, t } = useSitePreferences();
  const w = customerRequestsCopy[locale];
  const router = useRouter();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [notice, setNotice] = useState("");
  const { request, project } = data;
  const quotes = project?.quotations ?? [];
  const quote = quotes[0] ?? null;
  const older = quotes.slice(1);
  const invoice = quotes.flatMap(item => item.invoices)[0] ?? null;
  const sums = invoice ? invoiceSums(invoice) : null;
  const firstQuoteAt = quotes.length ? quotes[quotes.length - 1].createdAt : null;
  const answering = quote?.status === "ISSUED";
  const expired = quote ? quoteExpired(quote) : false;
  const payable = invoice && ["ISSUED", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status) && (sums?.leftMinor ?? 0) > 0;
  const title = request ? request.service?.name ?? t("technicalAdvice") : project!.name;
  const stopped = request && (request.status === "REJECTED" || request.status === "CANCELLED");
  const track = request
    ? requestTrack({ status: request.status, createdAt: request.createdAt, history: request.history, projectStatus: project?.status ?? null, firstQuoteAt })
    : projectTrack(project!.status, project!.createdAt, firstQuoteAt);
  const steps = request
    ? REQUEST_STAGES.map((stage, index) => ({ label: w.stages[stage], at: track.dates[index] }))
    : PROJECT_STAGES.map((stage, index) => ({ label: w.projectStages[stage], at: track.dates[index] }));
  const nextText = answering ? w.nextQuote : payable ? w.nextInvoice : request ? w.next[request.status] ?? w.nextFallback : w.nextFallback;
  const quoteBlock = quote && <QuoteBlock quote={quote} answering={answering} expired={expired} onAsk={setDialog} />;

  return <>
    <header className="cab-order-header">
      <h1 className="cab-title" tabIndex={-1}>{title}</h1>
      {request ? <StatusBadge kind="request" code={request.status} /> : <StatusBadge kind="project" code={project!.status} />}
      <small className="muted">{request?.reference ?? project!.reference}</small>
    </header>
    {notice && <p className="notice" role="status">{notice}</p>}

    <section className="panel-card cab-next" aria-labelledby="req-next">
      <h2 id="req-next">{w.nextTitle}</h2>
      <p>{nextText}</p>
      {answering && <a className="button" href="#quote">{w.viewQuote}</a>}
      {!answering && payable && <Link className="button" href={`/portal/invoices/${invoice.id}`}>{w.openInvoice}</Link>}
    </section>

    {answering && quoteBlock}

    {!stopped && track.current >= 0 && <section className="panel-card" aria-label={w.track}>
      <StatusTrack label={w.track} doneText={w.done_} current={track.current} steps={steps} />
    </section>}

    {!answering && quoteBlock}

    {invoice && sums && <section className="panel-card" aria-labelledby="req-invoice">
      <div className="portal-section-heading"><h2 id="req-invoice">{w.invoiceTitle} {invoice.number}</h2><StatusBadge kind="invoice" code={invoice.status} /></div>
      <dl className="cab-facts">
        <dt>{w.total}</dt><dd><strong>{formatMinor(sums.totalMinor, invoice.currency, locale)}</strong></dd>
        <dt>{w.paid}</dt><dd>{formatMinor(sums.paidMinor, invoice.currency, locale)}</dd>
        {sums.checkingMinor > 0 && <><dt>{w.checking}</dt><dd>{formatMinor(sums.checkingMinor, invoice.currency, locale)}</dd></>}
        <dt>{w.left}</dt><dd>{formatMinor(sums.leftMinor, invoice.currency, locale)}</dd>
        {invoice.dueAt && <><dt>{w.due}</dt><dd>{formatDate(invoice.dueAt)}</dd></>}
      </dl>
      <p><Link className={payable ? "button secondary" : "text-link"} href={`/portal/invoices/${invoice.id}`}>{w.openInvoice}</Link></p>
    </section>}

    {(request || project?.notes) && <section className="panel-card" aria-labelledby="req-yours">
      <h2 id="req-yours">{w.yourRequest}</h2>
      <dl className="cab-facts">
        {(request?.description || project?.notes) && <><dt>{w.description}</dt><dd className="cab-pre">{request?.description ?? project?.notes}</dd></>}
        {(request?.city || request?.location || project?.city) && <><dt>{w.place}</dt><dd>{[request?.city ?? project?.city, request?.location].filter(Boolean).join(", ")}</dd></>}
      </dl>
    </section>}

    {((request?.history.length ?? 0) > 0 || older.length > 0) && <details className="panel-card">
      <summary>{w.history}</summary>
      {request && <ul className="list">{request.history.map(entry => <li className="list-row" key={entry.id}>
        <span><strong>{entry.fromStatus === entry.toStatus ? w.event : statusText("request", entry.toStatus, locale)}</strong>{entry.note && <p className="small">{entry.note}</p>}</span>
        <small className="muted">{formatDateTime(entry.createdAt)}</small>
      </li>)}</ul>}
      {older.length > 0 && <>
        <h3>{w.oldQuotes}</h3>
        <ul className="list">{older.map(item => <li className="list-row" key={item.id}>
          <span><strong>{item.number}</strong><small className="muted"> · {formatDate(item.createdAt)}</small></span>
          <span className="cab-order-side"><StatusBadge kind="quote" code={item.status} /><span>{formatMinor(quoteTotalMinor(item.items), item.currency, locale)}</span></span>
        </li>)}</ul>
      </>}
    </details>}

    {request && canCancelRequest(request.status) && <div className="hero-actions cab-order-actions">
      <button type="button" className="button ghost" onClick={() => setDialog("cancel")}>{w.cancelRequest}</button>
    </div>}

    {dialog && <RequestDialog kind={dialog} quoteId={quote?.id ?? null} requestId={request?.id ?? null} totalText={quote ? formatMinor(quoteTotalMinor(quote.items), quote.currency, locale) : null} expired={expired}
      onClose={done => {
        const kind = dialog;
        setDialog(null);
        if (!done) return;
        setNotice(kind === "accept" ? w.sentAccept : kind === "reject" ? w.sentReject : kind === "changes" ? w.sentChanges : w.cancelled);
        router.refresh();
      }} />}
  </>;
}

type QuoteData = CabinetRequestDetail["project"] extends infer P ? P extends { quotations: (infer Q)[] } ? Q : never : never;

/** The quote as the buyer must see it before answering: every line, the total, what is and is not included, the expiry. */
function QuoteBlock({ quote, answering, expired, onAsk }: { quote: QuoteData; answering: boolean; expired: boolean; onAsk: (kind: Dialog) => void }) {
  const { locale } = useSitePreferences();
  const w = customerRequestsCopy[locale];
  const money = (value: number) => formatMinor(value, quote.currency, locale);
  return <section className="panel-card" id="quote" aria-labelledby="req-quote">
    <div className="portal-section-heading"><h2 id="req-quote">{w.quoteTitle(quote.number)}</h2><StatusBadge kind="quote" code={quote.status} /></div>
    <ul className="cab-quote-lines">{quote.items.map(item => <li key={item.id}>
      <span>{item.description}<small className="muted">{item.quantity} × {money(item.unitPriceMinor)}{item.discountMinor > 0 ? ` − ${money(item.discountMinor)}` : ""}</small></span>
      <strong>{money(item.quantity * item.unitPriceMinor - item.discountMinor)}</strong>
    </li>)}</ul>
    <p className="cab-quote-total"><span>{w.total}</span><strong>{money(quoteTotalMinor(quote.items))}</strong></p>
    <dl className="cab-facts">
      {quote.assumptions && <><dt>{w.includes}</dt><dd className="cab-pre">{quote.assumptions}</dd></>}
      {quote.exclusions && <><dt>{w.excludes}</dt><dd className="cab-pre">{quote.exclusions}</dd></>}
      {quote.validUntil && <><dt>{w.validUntil}</dt><dd>{formatDate(quote.validUntil)}{expired && <> · <strong>{w.expired}</strong></>}</dd></>}
    </dl>
    {answering && (expired
      ? <div className="hero-actions"><button type="button" className="button secondary" onClick={() => onAsk("changes")}>{w.askRenewal}</button></div>
      : <div className="hero-actions">
        <button type="button" className="button" onClick={() => onAsk("accept")}>{w.accept}</button>
        <button type="button" className="button secondary" onClick={() => onAsk("changes")}>{w.changes}</button>
        <button type="button" className="text-link" onClick={() => onAsk("reject")}>{w.reject}</button>
      </div>)}
  </section>;
}

function RequestDialog({ kind, quoteId, requestId, totalText, expired, onClose }: {
  kind: NonNullable<Dialog>; quoteId: string | null; requestId: string | null; totalText: string | null; expired: boolean; onClose: (done: boolean) => void;
}) {
  const { locale } = useSitePreferences();
  const w = customerRequestsCopy[locale];
  const [text, setText] = useState(expired && kind === "changes" ? w.askRenewal : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const needsReason = kind === "changes" || kind === "reject";
  const title = kind === "accept" ? w.acceptTitle : kind === "changes" ? w.changesTitle : kind === "reject" ? w.rejectTitle : w.cancelRequest;
  async function submit() {
    if (needsReason && text.trim().length < QUOTE_REASON.min) { setError(w.reasonShort); return; }
    setBusy(true); setError("");
    const failure = kind === "cancel"
      ? await send(`/api/requests/${requestId}`, "PATCH", { status: "CANCELLED" })
      : await send(`/api/quotations/${quoteId}`, "PATCH", kind === "accept" ? { status: "ACCEPTED" } : kind === "reject" ? { status: "REJECTED", reason: text.trim() } : { action: "CHANGES", reason: text.trim() });
    setBusy(false);
    if (failure !== null) { setError(failure ? translateMessage(failure, locale) : w.failed); return; }
    onClose(true);
  }
  const fieldId = `req-dialog-${kind}`;
  return <SiteDialog className="site-dialog cab-dialog" title={title} onClose={() => { if (!busy) onClose(false); }}>
    <form className="form" onSubmit={event => { event.preventDefault(); void submit(); }}>
      {kind === "accept" && <><p>{w.acceptText}</p>{totalText && <p><strong>{w.total}: {totalText}</strong></p>}</>}
      {kind === "cancel" && <p>{w.cancelText}</p>}
      {needsReason && <>
        <label htmlFor={fieldId}>{kind === "reject" ? w.rejectHint : w.changesHint}</label>
        <textarea id={fieldId} rows={3} required minLength={QUOTE_REASON.min} maxLength={QUOTE_REASON.max} value={text} onChange={event => setText(event.target.value)}
          aria-invalid={error ? true : undefined} aria-describedby={error ? `${fieldId}-error` : undefined} />
      </>}
      {error && <p className="notice error" role="alert" id={`${fieldId}-error`}>{error}</p>}
      <div className="hero-actions">
        <button type="submit" className={kind === "reject" || kind === "cancel" ? "button danger" : "button"} disabled={busy}>{busy ? w.sending : kind === "accept" ? w.acceptSend : kind === "cancel" ? w.cancelSend : w.send}</button>
        <button type="button" className="button ghost" disabled={busy} onClick={() => onClose(false)}>{w.close}</button>
      </div>
    </form>
  </SiteDialog>;
}
