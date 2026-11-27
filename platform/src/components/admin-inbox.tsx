"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "./site-preferences";
import { ToastMessage } from "./toast-provider";
import { formatDateTime } from "@/lib/format";
import { MESSAGE_MAX } from "@/lib/conversations";

const words = {
  uz: { title: "Xabarlar qutisi", back: "Boshqaruv paneli", inbox: "Xabarlar qutisi", open: "Ochiq", closed: "Yopilgan", all: "Hammasi", empty: "Suhbat yo‘q.", unread: (n: number) => `${n} ta yangi`, customer: "Mijoz", staff: "Xodim", reply: "Javob", send: "Yuborish", sending: "Yuborilmoqda…", close: "Suhbatni yopish", reopen: "Qayta ochish", failed: "Yuborilmadi.", filters: "Suhbatlarni saralash" },
  ru: { title: "Входящие", back: "Панель управления", inbox: "Входящие", open: "Открытые", closed: "Закрытые", all: "Все", empty: "Диалогов нет.", unread: (n: number) => `новых: ${n}`, customer: "Клиент", staff: "Сотрудник", reply: "Ответ", send: "Отправить", sending: "Отправляется…", close: "Закрыть диалог", reopen: "Открыть снова", failed: "Не отправлено.", filters: "Фильтр диалогов" },
  en: { title: "Inbox", back: "Admin panel", inbox: "Inbox", open: "Open", closed: "Closed", all: "All", empty: "No conversations.", unread: (n: number) => `${n} new`, customer: "Customer", staff: "Staff", reply: "Reply", send: "Send", sending: "Sending…", close: "Close conversation", reopen: "Reopen", failed: "Not sent.", filters: "Filter conversations" }
} as const;

type Row = { id: string; reference: string; category: string; subject: string; customerName: string; status: string; lastMessageAt: Date | string; unread: number; preview: string };

export function AdminInboxList({ conversations, filter }: { conversations: Row[]; filter: "OPEN" | "CLOSED" | "ALL" }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  return <div className="container page-shell admin-orders">
    <Link className="small text-link" href="/admin">← {w.back}</Link>
    <h1 className="page-title">{w.title}</h1>
    <nav className="shop-cats" aria-label={w.filters}>
      {(["OPEN", "CLOSED", "ALL"] as const).map(value => <Link key={value} className={`shop-chip${filter === value ? " is-active" : ""}`} href={`/admin/inbox?status=${value}`} aria-current={filter === value ? "true" : undefined}>{value === "OPEN" ? w.open : value === "CLOSED" ? w.closed : w.all}</Link>)}
    </nav>
    {conversations.length === 0 ? <div className="empty-state">{w.empty}</div> : <ul className="list">{conversations.map(row => <li className="list-row is-clickable-card admin-inbox-row" key={row.id}>
      <div>
        <Link className="card-link" href={`/admin/inbox/${row.id}`}><strong>{row.subject}</strong></Link>
        <p className="small muted">{row.reference} · {row.customerName} · {formatDateTime(row.lastMessageAt)}</p>
        <p className="small">{row.preview}</p>
      </div>
      {row.unread > 0 && <span className="order-status is-review">{w.unread(row.unread)}</span>}
    </li>)}</ul>}
  </div>;
}

type Thread = {
  id: string; reference: string; category: string; subject: string; customerName: string; customerPhone: string | null; status: string;
  customer: { email: string; phone: string | null } | null;
  messages: { id: string; sender: string; body: string; createdAt: Date | string }[];
};

/** One conversation: messages as plain text (never HTML), a reply box, and close/reopen. */
export function AdminInboxThread({ conversation }: { conversation: Thread }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function post(body: unknown) {
    setBusy(true); setError("");
    const response = await fetch(`/api/admin/conversations/${conversation.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const data = await response?.json().catch(() => ({})) ?? {};
    setBusy(false);
    if (!response?.ok) { setError(typeof data.error === "string" ? data.error : w.failed); return false; }
    router.refresh();
    return true;
  }
  const phone = conversation.customer?.phone ?? conversation.customerPhone;
  return <div className="container page-shell admin-orders">
    <Link className="small text-link" href="/admin/inbox">← {w.inbox}</Link>
    <h1 className="page-title">{conversation.subject}</h1>
    <p className="small muted">{conversation.reference} · {conversation.customerName}{phone ? <> · <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a></> : null}{conversation.customer ? ` · ${conversation.customer.email}` : ""} · {conversation.status === "CLOSED" ? w.closed : w.open}</p>
    <ToastMessage message={error} variant="error" />
    <section className="panel-card">
      <ol className="admin-thread">{conversation.messages.map(item => <li key={item.id} className={item.sender === "CUSTOMER" ? "is-customer" : "is-staff"}>
        <small className="muted">{item.sender === "CUSTOMER" ? w.customer : w.staff} · {formatDateTime(item.createdAt)}</small>
        <p>{item.body}</p>
      </li>)}</ol>
      <form className="form" onSubmit={async event => { event.preventDefault(); if (await post({ message: message.trim() })) setMessage(""); }}>
        <div className="field"><label htmlFor="inbox-reply">{w.reply}</label><textarea id="inbox-reply" rows={4} required maxLength={MESSAGE_MAX} value={message} onChange={event => setMessage(event.target.value)} /></div>
        <div className="hero-actions">
          <button className="button" disabled={busy || !message.trim()}>{busy ? w.sending : w.send}</button>
          <button type="button" className="button ghost" disabled={busy} onClick={() => void post({ status: conversation.status === "CLOSED" ? "OPEN" : "CLOSED" })}>{conversation.status === "CLOSED" ? w.reopen : w.close}</button>
        </div>
      </form>
    </section>
  </div>;
}
