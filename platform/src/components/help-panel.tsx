"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSitePreferences } from "./site-preferences";
import { SiteDialog } from "./site-dialog";
import { UiIcon } from "./ui-icon";
import { formatDateTime } from "@/lib/format";
import { defaultContact } from "@/lib/site-contact";
import { translateMessage } from "@/lib/server-messages";
import { MESSAGE_MAX } from "@/lib/conversations";
import { loginPath } from "@/lib/safe-next";

const OPEN_EVENT = "tecsecure-help-open";

const words = {
  uz: { help: "Yordam", title: "Yordam", call: "Qo‘ng‘iroq qilish", telegram: "Telegram’da yozish", request: "Ariza qoldirish", guest: "Savolingiz bo‘lsa, biz bilan bog‘laning yoki ariza qoldiring.", signIn: "Kirib yozish", conversations: "Suhbatlarim", none: "Hali suhbat yo‘q.", newMessage: "Yangi xabar", send: "Yuborish", sending: "Yuborilmoqda…", back: "Orqaga", all: "Barcha xabarlar", reply: "Javob yozish", failed: "Yuborilmadi. Qayta urinib ko‘ring.", tooShort: "Kamida 3 belgi yozing.", staff: "Tecsecure", you: "Siz", unread: (n: number) => `${n} ta yangi`, loading: "Yuklanmoqda…", closed: "yopilgan" },
  ru: { help: "Помощь", title: "Помощь", call: "Позвонить", telegram: "Написать в Telegram", request: "Оставить заявку", guest: "Если есть вопрос, свяжитесь с нами или оставьте заявку.", signIn: "Войти и написать", conversations: "Мои диалоги", none: "Диалогов пока нет.", newMessage: "Новое сообщение", send: "Отправить", sending: "Отправляется…", back: "Назад", all: "Все сообщения", reply: "Написать ответ", failed: "Не отправлено. Попробуйте ещё раз.", tooShort: "Напишите хотя бы 3 символа.", staff: "Tecsecure", you: "Вы", unread: (n: number) => `новых: ${n}`, loading: "Загрузка…", closed: "закрыт" },
  en: { help: "Help", title: "Help", call: "Call us", telegram: "Write on Telegram", request: "Leave a request", guest: "Have a question? Contact us or leave a request.", signIn: "Sign in to write", conversations: "My conversations", none: "No conversations yet.", newMessage: "New message", send: "Send", sending: "Sending…", back: "Back", all: "All messages", reply: "Write a reply", failed: "Not sent. Please try again.", tooShort: "Write at least 3 characters.", staff: "Tecsecure", you: "You", unread: (n: number) => `${n} new`, loading: "Loading…", closed: "closed" }
} as const;

type Conversation = { id: string; reference: string; subject: string; status: string; unread: number; messages: { id: string; fromStaff: boolean; body: string; createdAt: string }[] };
type Data = { guest: boolean; unread: number; conversations?: Conversation[] };

/** The header button on a phone: opens the same panel as the corner button on a computer. */
export function HelpHeaderButton() {
  const { locale } = useSitePreferences();
  return <button type="button" className="portal-icon-link help-header-button" aria-label={words[locale].help} title={words[locale].help} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
    <UiIcon name="mail" size={20} />
  </button>;
}

/**
 * "Yordam": on a computer a corner button (kept above the cart button), on a phone the header button. A guest
 * gets the phone, Telegram and the request form; a customer reads and answers only their own conversations.
 * Messages are plain text, never HTML.
 */
export function HelpPanel() {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const [unread, setUnread] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const hidden = pathname.startsWith("/admin") || pathname.startsWith("/tg") || pathname.startsWith("/staff");

  const load = useCallback(async () => {
    const response = await fetch("/api/portal/messages", { cache: "no-store" }).catch(() => null);
    const next = response?.ok ? await response.json().catch(() => null) as Data | null : null;
    setData(next ?? { guest: true, unread: 0, conversations: [] });
    setUnread(next?.unread ?? 0);
  }, []);

  useEffect(() => {
    if (hidden) return;
    let live = true;
    fetch("/api/portal/messages?scope=count", { cache: "no-store" }).then(response => response.ok ? response.json() : null).then((next: Data | null) => { if (live && next) setUnread(next.unread); }).catch(() => {});
    const show = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, show);
    return () => { live = false; window.removeEventListener(OPEN_EVENT, show); };
  }, [hidden, pathname]);

  useEffect(() => { if (open) void load(); }, [open, load]);

  const conversation = data?.conversations?.find(item => item.id === selected) ?? null;
  useEffect(() => {
    // Opening a conversation marks its replies as read.
    if (conversation && conversation.unread > 0) void fetch(`/api/portal/messages/${conversation.id}`, { method: "PATCH" }).then(() => load()).catch(() => {});
  }, [conversation, load]);

  async function send() {
    const message = text.trim();
    if (message.length < (conversation ? 1 : 3)) { setError(w.tooShort); return; }
    setBusy(true); setError("");
    const response = await fetch(conversation ? `/api/portal/messages/${conversation.id}` : "/api/portal/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) }).catch(() => null);
    const result = await response?.json().catch(() => ({})) ?? {};
    setBusy(false);
    if (!response?.ok) { setError(typeof result.error === "string" ? translateMessage(result.error, locale) : w.failed); return; }
    setText("");
    await load();
  }

  if (hidden) return null;
  const phone = defaultContact.phone;
  const telegram = defaultContact.telegram.replace("@", "");
  return <>
    <button type="button" className="help-fab" aria-label={unread ? `${w.help}, ${w.unread(unread)}` : w.help} onClick={() => setOpen(true)}>
      <UiIcon name="mail" size={20} /><span className="help-fab-label">{w.help}</span>
      {unread > 0 && <span className="help-fab-count" aria-hidden="true">{unread > 9 ? "9+" : unread}</span>}
    </button>
    {open && <SiteDialog className="site-dialog cab-dialog help-dialog" title={w.title} onClose={() => { if (!busy) { setOpen(false); setSelected(null); setError(""); } }}>
      <div className="help-contacts">
        <a className="button ghost" href={`tel:${phone}`}><UiIcon name="phone" size={18} /> {w.call}</a>
        <a className="button ghost" href={`https://t.me/${telegram}`} target="_blank" rel="noreferrer"><UiIcon name="send" size={18} /> {w.telegram}</a>
      </div>
      {!data ? <p className="muted" role="status">{w.loading}</p> : data.guest ? <>
        <p>{w.guest}</p>
        <div className="hero-actions">
          <Link className="button" href="/request-service" onClick={() => setOpen(false)}>{w.request}</Link>
          <Link className="button secondary" href={loginPath("/portal/messages")} onClick={() => setOpen(false)}>{w.signIn}</Link>
        </div>
      </> : conversation ? <>
        <button type="button" className="text-link" onClick={() => { setSelected(null); setError(""); }}>← {w.back}</button>
        <h3>{conversation.subject}</h3>
        <ol className="help-thread">{conversation.messages.map(message => <li key={message.id} className={message.fromStaff ? "is-staff" : "is-customer"}>
          <small className="muted">{message.fromStaff ? w.staff : w.you} · {formatDateTime(message.createdAt)}</small>
          <p>{message.body}</p>
        </li>)}</ol>
        <HelpForm label={w.reply} value={text} onChange={setText} onSend={send} busy={busy} error={error} words={w} />
      </> : <>
        <h3>{w.conversations}</h3>
        {(data.conversations?.length ?? 0) === 0 ? <p className="muted">{w.none}</p> : <ul className="list">{data.conversations!.map(item => <li key={item.id} className="list-row">
          <button type="button" className="help-conversation" onClick={() => { setSelected(item.id); setText(""); setError(""); }}>
            <span><strong>{item.subject}</strong><small className="muted"> · {item.reference}{item.status === "CLOSED" ? ` · ${w.closed}` : ""}</small></span>
            {item.unread > 0 && <span className="order-status is-review">{w.unread(item.unread)}</span>}
          </button>
        </li>)}</ul>}
        <HelpForm label={w.newMessage} value={text} onChange={setText} onSend={send} busy={busy} error={error} words={w} />
        <p className="small"><Link className="text-link" href="/portal/messages" onClick={() => setOpen(false)}>{w.all}</Link></p>
      </>}
    </SiteDialog>}
  </>;
}

function HelpForm({ label, value, onChange, onSend, busy, error, words: w }: { label: string; value: string; onChange: (value: string) => void; onSend: () => Promise<void>; busy: boolean; error: string; words: (typeof words)["uz"] | (typeof words)["ru"] | (typeof words)["en"] }) {
  return <form className="form" onSubmit={event => { event.preventDefault(); void onSend(); }}>
    <label htmlFor="help-message">{label}</label>
    <textarea id="help-message" rows={3} maxLength={MESSAGE_MAX} value={value} onChange={event => onChange(event.target.value)} aria-invalid={error ? true : undefined} aria-describedby={error ? "help-error" : undefined} />
    {error && <p className="notice error" role="alert" id="help-error">{error}</p>}
    <button className="button" disabled={busy || !value.trim()}>{busy ? w.sending : w.send}</button>
  </form>;
}
