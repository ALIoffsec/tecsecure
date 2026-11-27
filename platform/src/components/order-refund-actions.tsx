"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "./site-preferences";
import { ToastMessage } from "./toast-provider";
import { MediaUploader } from "./media-uploader";
import { formatDateTime, formatMinor } from "@/lib/format";
import { RECEIPT_REASON, REFUND_DOCUMENT, refundWords } from "@/lib/order-refunds";
import { parseWholeSom } from "@/lib/money-input";

async function post(url: string, method: "POST" | "PATCH", body: unknown): Promise<string | null> {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  if (response?.ok) return null;
  const data = await response?.json().catch(() => ({})) ?? {};
  return typeof data.error === "string" ? data.error : "";
}

/** One short text field with its own send button, opened from a single button. */
function InlineForm({ id, open, label, send, cancel, minLength, maxLength, busy, onOpen, onClose, onSend, openLabel, danger }: {
  id: string; open: boolean; label: string; send: string; cancel: string; minLength: number; maxLength: number; busy: boolean;
  onOpen: () => void; onClose: () => void; onSend: (value: string) => void; openLabel: string; danger?: boolean;
}) {
  const [value, setValue] = useState("");
  if (!open) return <button type="button" className={danger ? "button danger" : "button secondary"} disabled={busy} onClick={onOpen}>{openLabel}</button>;
  return <form className="order-shipment-form" onSubmit={event => { event.preventDefault(); onSend(value.trim()); }}>
    <label className="small" htmlFor={id}>{label}</label>
    <input id={id} value={value} minLength={minLength} maxLength={maxLength} required onChange={event => setValue(event.target.value)} />
    <div className="order-actions">
      <button type="submit" className={danger ? "button danger small" : "button small"} disabled={busy}>{send}</button>
      <button type="button" className="button ghost small" disabled={busy} onClick={onClose}>{cancel}</button>
    </div>
  </form>;
}

/** Staff: refuse a card-transfer receipt (reason shown to the buyer) and record a refund paid out by hand. */
export function OrderRefundActions({ orderId, canReject, canRefund, paymeRefund }: { orderId: string; canReject: boolean; canRefund: boolean; paymeRefund: boolean }) {
  const { locale } = useSitePreferences();
  const w = refundWords[locale];
  const router = useRouter();
  const [open, setOpen] = useState<"reject" | "refund" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function send(body: unknown, min: number, value: string, short: string) {
    if (value.length < min) { setError(short); return; }
    setBusy(true); setError("");
    const failure = await post(`/api/orders/${orderId}`, "PATCH", body);
    setBusy(false);
    if (failure !== null) { setError(failure || w.failed); return; }
    setOpen(null);
    router.refresh();
  }
  if (!canReject && !canRefund && !paymeRefund) return null;
  return <>
    <ToastMessage message={error} variant="error" />
    {canReject && <InlineForm id={`reject-${orderId}`} open={open === "reject"} openLabel={w.reject} label={w.rejectReason} send={w.rejectSend} cancel={w.cancel}
      minLength={RECEIPT_REASON.min} maxLength={RECEIPT_REASON.max} busy={busy} danger onOpen={() => setOpen("reject")} onClose={() => setOpen(null)}
      onSend={reason => void send({ rejectReceipt: { reason } }, RECEIPT_REASON.min, reason, w.reasonShort)} />}
    {canRefund && <InlineForm id={`refund-${orderId}`} open={open === "refund"} openLabel={w.refunded} label={w.document} send={w.refundedSend} cancel={w.cancel}
      minLength={REFUND_DOCUMENT.min} maxLength={REFUND_DOCUMENT.max} busy={busy} onOpen={() => setOpen("refund")} onClose={() => setOpen(null)}
      onSend={document => void send({ refunded: { document } }, REFUND_DOCUMENT.min, document, w.documentShort)} />}
    {paymeRefund && <span className="small muted">{w.paymeRefund}</span>}
  </>;
}

export type PartRefundRow = { id: string; reference: string; customerName: string; shopName: string | null; reason: string | null; amountMinor: number | null; createdAt: Date | string; paymentMethod: string };

/** Staff: the shop-part refunds still owed by hand, each closed once with its document number. */
export function PartRefundQueue({ rows, canRefund }: { rows: PartRefundRow[]; canRefund: boolean }) {
  const { locale } = useSitePreferences();
  const w = refundWords[locale];
  if (rows.length === 0) return null;
  return <section className="panel-card admin-part-refunds" aria-labelledby="part-refunds-title">
    <h2 id="part-refunds-title">{w.partTitle} · {rows.length}</h2>
    <ul className="list">{rows.map(row => <PartRefundRowView key={row.id} row={row} canRefund={canRefund} />)}</ul>
  </section>;
}

function PartRefundRowView({ row, canRefund }: { row: PartRefundRow; canRefund: boolean }) {
  const { locale } = useSitePreferences();
  const w = refundWords[locale];
  const router = useRouter();
  const [document, setDocument] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    if (document.trim().length < REFUND_DOCUMENT.min) { setError(w.documentShort); return; }
    const amountMinor = row.amountMinor === null ? parseWholeSom(amount) : undefined;
    if (amountMinor === null) { setError(w.amountInvalid); return; }
    setBusy(true); setError("");
    const failure = await post(`/api/admin/part-refunds/${row.id}`, "POST", { document: document.trim(), ...(amountMinor !== undefined ? { amountMinor } : {}), ...(note.trim() ? { note: note.trim() } : {}) });
    setBusy(false);
    if (failure !== null) { setError(failure || w.failed); return; }
    router.refresh();
  }
  return <li className="list-row">
    <ToastMessage message={error} variant="error" />
    <div>
      <strong>{row.reference}{row.shopName ? ` · ${row.shopName}` : ""}</strong>
      <p className="small muted">{row.customerName} · {formatDateTime(row.createdAt)}{row.reason ? ` · ${row.reason}` : ""}</p>
      <p>{row.amountMinor !== null ? formatMinor(row.amountMinor, "UZS", locale) : "—"}</p>
    </div>
    {canRefund && <form className="order-shipment-form" onSubmit={event => { event.preventDefault(); void save(); }}>
      {row.amountMinor === null && <>
        <label className="small" htmlFor={`part-amount-${row.id}`}>{w.amount}</label>
        <input id={`part-amount-${row.id}`} inputMode="numeric" required value={amount} onChange={event => setAmount(event.target.value)} aria-describedby={`part-amount-${row.id}-read`} />
        <span className="small muted" id={`part-amount-${row.id}-read`} role="status">{parseWholeSom(amount) ? formatMinor(parseWholeSom(amount)!, "UZS", locale) : w.amountHint}</span>
        <label className="small" htmlFor={`part-note-${row.id}`}>{w.amountNote}</label>
        <input id={`part-note-${row.id}`} required minLength={3} maxLength={300} value={note} onChange={event => setNote(event.target.value)} />
      </>}
      <label className="small" htmlFor={`part-doc-${row.id}`}>{w.document}</label>
      <input id={`part-doc-${row.id}`} required minLength={REFUND_DOCUMENT.min} maxLength={REFUND_DOCUMENT.max} value={document} onChange={event => setDocument(event.target.value)} />
      <button type="submit" className="button small" disabled={busy}>{w.partDone}</button>
    </form>}
  </li>;
}

/** The buyer: why the receipt was refused, and a new one sent from here. */
export function ReceiptReupload({ orderId, reason }: { orderId: string; reason: string | null }) {
  const { locale } = useSitePreferences();
  const w = refundWords[locale];
  const router = useRouter();
  const [proof, setProof] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  async function send() {
    if (!proof[0]) { setError(w.reuploadPick); return; }
    setBusy(true); setError("");
    const failure = await post(`/api/orders/${orderId}/proof`, "POST", { mediaId: proof[0] });
    setBusy(false);
    if (failure !== null) { setError(failure || w.failed); return; }
    setSent(true);
    router.refresh();
  }
  if (sent) return <p className="small" role="status">{w.reuploadSent}</p>;
  return <div className="order-shipment-form">
    <ToastMessage message={error} variant="error" />
    {reason && <p className="small"><strong>{w.rejected}:</strong> {reason}</p>}
    <span className="small">{w.reupload}</span>
    <MediaUploader scope="WALLET" value={proof} onChange={setProof} hideLabel />
    <button type="button" className="button small" disabled={busy || !proof[0]} onClick={() => void send()}>{w.reuploadSend}</button>
  </div>;
}
