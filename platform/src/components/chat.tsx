"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSitePreferences } from "./site-preferences";
import { UiIcon } from "./ui-icon";
import { formatDate, formatTime } from "@/lib/format";
import { translateMessage } from "@/lib/server-messages";
import { MESSAGE_MAX } from "@/lib/conversations";

const words = {
  uz: { list: "Suhbatlar", newChat: "Yangi suhbat", newTitle: "Yangi suhbat", back: "Suhbatlar", placeholder: "Xabar yozing…", send: "Yuborish", sending: "yuborilmoqda…", retry: "Qayta yuborish", failed: "Yuborilmadi", today: "Bugun", yesterday: "Kecha", none: "Hali suhbat yo‘q. Savolingizni yozing.", start: "Savolingizni yozing — xodim shu yerda javob beradi.", loading: "Yuklanmoqda…", closed: "Suhbat yopilgan; yozsangiz qayta ochiladi.", unread: (n: number) => `${n} ta yangi`, tooShort: "Kamida 3 belgi yozing.", you: "Siz", staff: "Tecsecure", brand: "Tecsecure yordam", staffRole: "Xodim" },
  ru: { list: "Диалоги", newChat: "Новый диалог", newTitle: "Новый диалог", back: "Диалоги", placeholder: "Напишите сообщение…", send: "Отправить", sending: "отправляется…", retry: "Отправить снова", failed: "Не отправлено", today: "Сегодня", yesterday: "Вчера", none: "Диалогов пока нет. Напишите свой вопрос.", start: "Напишите вопрос — сотрудник ответит здесь.", loading: "Загрузка…", closed: "Диалог закрыт; если напишете, он откроется снова.", unread: (n: number) => `новых: ${n}`, tooShort: "Напишите хотя бы 3 символа.", you: "Вы", staff: "Tecsecure", brand: "Поддержка Tecsecure", staffRole: "Сотрудник" },
  en: { list: "Conversations", newChat: "New conversation", newTitle: "New conversation", back: "Conversations", placeholder: "Write a message…", send: "Send", sending: "sending…", retry: "Send again", failed: "Not sent", today: "Today", yesterday: "Yesterday", none: "No conversations yet. Write your question.", start: "Write your question — staff will reply here.", loading: "Loading…", closed: "This conversation is closed; writing opens it again.", unread: (n: number) => `${n} new`, tooShort: "Write at least 3 characters.", you: "You", staff: "Tecsecure", brand: "Tecsecure support", staffRole: "Staff" }
} as const;

type Message = { id: string; fromStaff: boolean; body: string; createdAt: string; state?: "sending" | "failed" };
type Conversation = { id: string; reference: string; subject: string; status: string; lastMessageAt: string; unread: number; messages: Message[] };

const dayKey = (value: string) => new Date(value).toDateString();

/** "Today", "Yesterday" or the date, for the line between days. */
function dayLabel(value: string, w: (typeof words)["uz"] | (typeof words)["ru"] | (typeof words)["en"]): string {
  const day = new Date(value);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (day.toDateString() === today.toDateString()) return w.today;
  if (day.toDateString() === yesterday.toDateString()) return w.yesterday;
  return formatDate(value);
}

/** On a computer Enter sends (Shift+Enter breaks the line); on a touch phone Enter is a new line. */
function enterSends(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(hover: hover) and (pointer: fine)").matches === true;
}

/**
 * The customer's chat with staff: a list of conversations (skipped when there is only one), the thread as
 * bubbles with day lines, and a composer pinned to the bottom. Text only, never HTML. No reply time is promised.
 */
export function ChatView({ scope = "panel" }: { scope?: "panel" | "page" }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [selected, setSelected] = useState<string | "new" | null>(null);
  const [pending, setPending] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const thread = useRef<HTMLOListElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    const response = await fetch(`/api/portal/messages${scope === "page" ? "?scope=all" : ""}`, { cache: "no-store" }).catch(() => null);
    const data = response?.ok ? await response.json().catch(() => null) : null;
    const list: Conversation[] = Array.isArray(data?.conversations) ? data.conversations : [];
    setConversations(list);
    return list;
  }, [scope]);

  useEffect(() => {
    void load().then(list => {
      // One conversation: open it straight away; none: start a new one.
      setSelected(current => current ?? (list.length === 1 ? list[0].id : list.length === 0 ? "new" : null));
    });
  }, [load]);

  const open = conversations?.find(item => item.id === selected) ?? null;

  useEffect(() => {
    if (open && open.unread > 0) void fetch(`/api/portal/messages/${open.id}`, { method: "PATCH" }).then(() => load()).catch(() => {});
  }, [open, load]);

  // The newest message is always in view: on opening, and when one is added.
  const shown = [...(open?.messages ?? []), ...pending];
  useLayoutEffect(() => {
    const element = thread.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [selected, shown.length]);

  // The box grows with the text up to four lines.
  useLayoutEffect(() => {
    const element = input.current;
    if (!element) return;
    element.style.height = "auto";
    const line = parseFloat(getComputedStyle(element).lineHeight) || 22;
    element.style.height = `${Math.min(element.scrollHeight, line * 4 + 16)}px`;
  }, [text]);

  async function deliver(body: string, localId: string) {
    const target = selected === "new" || !selected ? null : selected;
    const response = await fetch(target ? `/api/portal/messages/${target}` : "/api/portal/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: body }) }).catch(() => null);
    if (!response?.ok) {
      const data = await response?.json().catch(() => ({})) ?? {};
      setPending(list => list.map(item => item.id === localId ? { ...item, state: "failed" } : item));
      if (typeof data.error === "string") setError(translateMessage(data.error, locale));
      return;
    }
    const list = await load();
    setPending(current => current.filter(item => item.id !== localId));
    if (!target && list[0]) setSelected(list[0].id);
  }

  function send() {
    const body = text.trim();
    if (!body) return;
    if (selected === "new" && body.length < 3) { setError(w.tooShort); return; }
    setError("");
    const localId = `local-${Date.now()}`;
    setPending(list => [...list, { id: localId, fromStaff: false, body, createdAt: new Date().toISOString(), state: "sending" }]);
    setText("");
    void deliver(body, localId);
  }

  function retry(message: Message) {
    setPending(list => list.map(item => item.id === message.id ? { ...item, state: "sending" } : item));
    void deliver(message.body, message.id);
  }

  if (!conversations) return <p className="muted" role="status">{w.loading}</p>;

  if (selected === null) return <div className="chat">
    <div className="chat-head"><strong>{w.list}</strong><button type="button" className="button secondary small" onClick={() => { setSelected("new"); setPending([]); }}><UiIcon name="plus" size={16} /> {w.newChat}</button></div>
    {conversations.length === 0 ? <p className="muted">{w.none}</p> : <ul className="chat-list">{conversations.map(item => {
      const last = item.messages[item.messages.length - 1];
      return <li key={item.id}><button type="button" onClick={() => { setSelected(item.id); setPending([]); }}>
        <span className="chat-list-text"><strong>{item.subject}</strong><small className="muted">{last ? last.body : ""}</small></span>
        <span className="chat-list-side"><small className="muted">{formatTime(item.lastMessageAt)}</small>{item.unread > 0 && <span className="chat-unread">{w.unread(item.unread)}</span>}</span>
      </button></li>;
    })}</ul>}
  </div>;

  return <div className="chat">
    <div className="chat-head">
      {conversations.length > 1 || selected === "new" && conversations.length > 0
        ? <button type="button" className="text-link" onClick={() => { setSelected(null); setPending([]); setError(""); }}>← {w.back}</button> : <span />}
      <span className="chat-title"><strong>{w.brand}</strong><small className="muted">{open ? open.subject : w.newTitle}</small></span>
      {open && <button type="button" className="button ghost small" onClick={() => { setSelected("new"); setPending([]); }} aria-label={w.newChat} title={w.newChat}><UiIcon name="plus" size={16} /></button>}
    </div>
    <ol className="chat-thread" ref={thread}>
      {shown.length === 0 && <li className="chat-hint muted">{w.start}</li>}
      {shown.map((message, index) => {
        const newDay = index === 0 || dayKey(shown[index - 1].createdAt) !== dayKey(message.createdAt);
        return <li key={message.id} className="chat-item">
          {newDay && <div className="chat-day"><span>{dayLabel(message.createdAt, w)}</span></div>}
          <div className={`chat-bubble ${message.fromStaff ? "from-staff" : "from-me"}${message.state === "failed" ? " is-failed" : ""}`}>
            <span className="sr-only">{message.fromStaff ? w.staff : w.you}: </span>
            <p>{message.body}</p>
            <small>{message.state === "sending" ? w.sending : message.state === "failed" ? w.failed : message.fromStaff ? `${formatTime(message.createdAt)} · ${w.staffRole}` : formatTime(message.createdAt)}</small>
          </div>
          {message.state === "failed" && <button type="button" className="text-link chat-retry" onClick={() => retry(message)}>{w.retry}</button>}
        </li>;
      })}
    </ol>
    {open?.status === "CLOSED" && <p className="small muted chat-note">{w.closed}</p>}
    {error && <p className="notice error" role="alert">{error}</p>}
    <form className="chat-composer" onSubmit={event => { event.preventDefault(); send(); }}>
      <label className="sr-only" htmlFor={`chat-input-${scope}`}>{w.placeholder}</label>
      <textarea id={`chat-input-${scope}`} ref={input} rows={1} maxLength={MESSAGE_MAX} placeholder={w.placeholder} value={text}
        onChange={event => setText(event.target.value)}
        onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && enterSends()) { event.preventDefault(); send(); } }} />
      <button type="submit" className="button chat-send" disabled={!text.trim()} aria-label={w.send} title={w.send}><UiIcon name="send" size={18} /></button>
    </form>
  </div>;
}
