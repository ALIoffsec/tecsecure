"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "./site-preferences";
import { ToastMessage } from "./toast-provider";
import { formatMinor } from "@/lib/format";
import { parseSomInput } from "@/lib/money-input";

const words = {
  uz: {
    openProject: "Loyiha ochish", project: "Loyiha", guest: "Mehmon arizasi: loyiha uchun mijoz hisobi kerak",
    line: "Qator", description: "Nomi", quantity: "Soni", price: "Narxi (so‘m)", discount: "Chegirma (so‘m)", addLine: "+ Qator qo‘shish", remove: "Olib tashlash",
    validUntil: "Amal qilish muddati", includes: "Narxga kiradi", excludes: "Narxga kirmaydi", total: "Jami", issue: "Taklifni yuborish",
    due: "To‘lash muddati", createInvoice: "Hisob yaratish", started: "Ish boshlandi", finished: "Ish yakunlandi", cancel: "Loyihani bekor qilish",
    note: "Izoh (mijozga ko‘rinadi)", badAmount: "Narxni raqam bilan yozing.", failed: "Saqlanmadi. Qayta urinib ko‘ring.", done: "Saqlandi."
  },
  ru: {
    openProject: "Открыть проект", project: "Проект", guest: "Заявка гостя: для проекта нужен аккаунт клиента",
    line: "Строка", description: "Наименование", quantity: "Кол-во", price: "Цена (сум)", discount: "Скидка (сум)", addLine: "+ Добавить строку", remove: "Убрать",
    validUntil: "Действует до", includes: "Входит в цену", excludes: "Не входит в цену", total: "Итого", issue: "Отправить предложение",
    due: "Срок оплаты", createInvoice: "Выставить счёт", started: "Работа начата", finished: "Работа завершена", cancel: "Отменить проект",
    note: "Комментарий (видит клиент)", badAmount: "Укажите цену цифрами.", failed: "Не сохранено. Попробуйте ещё раз.", done: "Сохранено."
  },
  en: {
    openProject: "Open a project", project: "Project", guest: "Guest request: a customer account is needed for a project",
    line: "Line", description: "Item", quantity: "Qty", price: "Price (UZS)", discount: "Discount (UZS)", addLine: "+ Add line", remove: "Remove",
    validUntil: "Valid until", includes: "Included", excludes: "Not included", total: "Total", issue: "Send quote",
    due: "Due date", createInvoice: "Create invoice", started: "Work started", finished: "Work finished", cancel: "Cancel project",
    note: "Note (the customer sees it)", badAmount: "Enter the price in digits.", failed: "Not saved. Please try again.", done: "Saved."
  }
} as const;

async function call(url: string, method: "POST" | "PATCH", body: unknown): Promise<string | null> {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  if (response?.ok) return null;
  const data = await response?.json().catch(() => ({})) ?? {};
  return typeof data.error === "string" ? data.error : "";
}

/** "Open a project" on a request card, or the project it already has. */
export function OpenProjectButton({ requestId, project, guest }: { requestId: string; project: { reference: string } | null; guest: boolean }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (project) return <span className="small muted">{w.project}: {project.reference}</span>;
  if (guest) return <span className="small muted">{w.guest}</span>;
  return <>
    <ToastMessage message={error} variant="error" />
    <button type="button" className="button secondary small" disabled={busy} onClick={async () => {
      setBusy(true); setError("");
      const failure = await call(`/api/admin/requests/${requestId}/project`, "POST", {});
      setBusy(false);
      if (failure !== null) { setError(failure || w.failed); return; }
      router.refresh();
    }}>{w.openProject}</button>
  </>;
}

/** Work started / finished (or drop it before work), each from the step before. */
export function ProjectStatusActions({ projectId, status }: { projectId: string; status: string }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const next = status === "APPROVED" ? "IN_PROGRESS" : status === "IN_PROGRESS" ? "COMPLETED" : null;
  const cancellable = ["DRAFT", "QUOTE_REQUESTED", "QUOTED", "APPROVED"].includes(status);
  if (!next && !cancellable) return null;
  async function move(to: string) {
    setBusy(true); setError("");
    const failure = await call(`/api/admin/projects/${projectId}`, "PATCH", { status: to, ...(note.trim() ? { note: note.trim() } : {}) });
    setBusy(false);
    if (failure !== null) { setError(failure || w.failed); return; }
    setNote("");
    router.refresh();
  }
  return <div className="form admin-project-status">
    <ToastMessage message={error} variant="error" />
    <div className="field"><label htmlFor={`project-note-${projectId}`}>{w.note}</label><input id={`project-note-${projectId}`} maxLength={1000} value={note} onChange={event => setNote(event.target.value)} /></div>
    <div className="hero-actions">
      {next && <button type="button" className="button secondary small" disabled={busy} onClick={() => void move(next)}>{next === "IN_PROGRESS" ? w.started : w.finished}</button>}
      {cancellable && <button type="button" className="button ghost small" disabled={busy} onClick={() => void move("CANCELLED")}>{w.cancel}</button>}
    </div>
  </div>;
}

type Line = { description: string; quantity: string; price: string; discount: string };
const emptyLine = (): Line => ({ description: "", quantity: "1", price: "", discount: "" });

/** A quote with as many lines as it needs, its validity date and what is and is not included. */
export function AdminQuoteForm({ projectId }: { projectId: string }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [validUntil, setValidUntil] = useState("");
  const [assumptions, setAssumptions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  // Empty or "0" is zero; anything else must read as an amount in so'm.
  const amount = (raw: string) => raw.trim() === "" || raw.trim() === "0" ? 0 : parseSomInput(raw);
  const parsed = lines.map(line => ({ line, price: line.price.trim() ? amount(line.price) : null, discount: amount(line.discount), quantity: Number.parseInt(line.quantity, 10) }));
  const total = parsed.reduce((sum, item) => sum + (item.price ?? 0) * (Number.isFinite(item.quantity) ? item.quantity : 0) - (item.discount ?? 0), 0);
  const set = (index: number, patch: Partial<Line>) => setLines(current => current.map((line, at) => at === index ? { ...line, ...patch } : line));
  async function submit() {
    if (parsed.some(item => item.price === null || item.discount === null || !Number.isInteger(item.quantity) || item.quantity < 1 || item.line.description.trim().length < 2)) { setError(w.badAmount); return; }
    setBusy(true); setError(""); setNotice("");
    const failure = await call("/api/quotations", "POST", {
      projectId,
      items: parsed.map(item => ({ description: item.line.description.trim(), quantity: item.quantity, unitPriceMinor: item.price ?? 0, discountMinor: item.discount ?? 0 })),
      ...(validUntil ? { validUntil: new Date(`${validUntil}T23:59:59+05:00`).toISOString() } : {}),
      ...(assumptions.trim() ? { assumptions: assumptions.trim() } : {}),
      ...(exclusions.trim() ? { exclusions: exclusions.trim() } : {})
    });
    setBusy(false);
    if (failure !== null) { setError(failure || w.failed); return; }
    setLines([emptyLine()]); setValidUntil(""); setAssumptions(""); setExclusions(""); setNotice(w.done);
    router.refresh();
  }
  return <form className="form admin-quote-form" onSubmit={event => { event.preventDefault(); void submit(); }}>
    <ToastMessage message={error} variant="error" />
    {notice && <p className="small" role="status">{notice}</p>}
    {lines.map((line, index) => <fieldset className="admin-quote-line" key={index}>
      <legend className="small">{w.line} {index + 1}</legend>
      <div className="field"><label htmlFor={`q-${projectId}-d-${index}`}>{w.description}</label><input id={`q-${projectId}-d-${index}`} required minLength={2} maxLength={500} value={line.description} onChange={event => set(index, { description: event.target.value })} /></div>
      <div className="form-row">
        <div className="field"><label htmlFor={`q-${projectId}-q-${index}`}>{w.quantity}</label><input id={`q-${projectId}-q-${index}`} type="number" min={1} max={10000} required value={line.quantity} onChange={event => set(index, { quantity: event.target.value })} /></div>
        <div className="field"><label htmlFor={`q-${projectId}-p-${index}`}>{w.price}</label><input id={`q-${projectId}-p-${index}`} inputMode="decimal" required value={line.price} onChange={event => set(index, { price: event.target.value })} /></div>
        <div className="field"><label htmlFor={`q-${projectId}-x-${index}`}>{w.discount}</label><input id={`q-${projectId}-x-${index}`} inputMode="decimal" value={line.discount} onChange={event => set(index, { discount: event.target.value })} /></div>
      </div>
      {lines.length > 1 && <button type="button" className="button ghost small" onClick={() => setLines(current => current.filter((_, at) => at !== index))}>{w.remove}</button>}
    </fieldset>)}
    <button type="button" className="button ghost small" onClick={() => setLines(current => current.length < 50 ? [...current, emptyLine()] : current)}>{w.addLine}</button>
    <p className="small"><strong>{w.total}: {formatMinor(Math.max(0, total), "UZS", locale)}</strong></p>
    <div className="field"><label htmlFor={`q-${projectId}-valid`}>{w.validUntil}</label><input id={`q-${projectId}-valid`} type="date" value={validUntil} onChange={event => setValidUntil(event.target.value)} /></div>
    <div className="field"><label htmlFor={`q-${projectId}-inc`}>{w.includes}</label><textarea id={`q-${projectId}-inc`} maxLength={5000} value={assumptions} onChange={event => setAssumptions(event.target.value)} /></div>
    <div className="field"><label htmlFor={`q-${projectId}-exc`}>{w.excludes}</label><textarea id={`q-${projectId}-exc`} maxLength={5000} value={exclusions} onChange={event => setExclusions(event.target.value)} /></div>
    <button className="button secondary" disabled={busy}>{w.issue}</button>
  </form>;
}

/** An invoice from an accepted quote, with its due date. */
export function AdminInvoiceCreate({ quotationId }: { quotationId: string }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const router = useRouter();
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <form className="form-row admin-invoice-create" onSubmit={async event => {
    event.preventDefault();
    setBusy(true); setError("");
    const failure = await call("/api/invoices", "POST", { quotationId, ...(due ? { dueAt: new Date(`${due}T23:59:59+05:00`).toISOString() } : {}) });
    setBusy(false);
    if (failure !== null) { setError(failure || w.failed); return; }
    router.refresh();
  }}>
    <ToastMessage message={error} variant="error" />
    <div className="field"><label htmlFor={`inv-due-${quotationId}`}>{w.due}</label><input id={`inv-due-${quotationId}`} type="date" value={due} onChange={event => setDue(event.target.value)} /></div>
    <button className="button secondary small" disabled={busy}>{w.createInvoice}</button>
  </form>;
}
