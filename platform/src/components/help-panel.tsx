"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSitePreferences } from "./site-preferences";
import { SiteDialog } from "./site-dialog";
import { UiIcon } from "./ui-icon";
import { ChatView } from "./chat";
import { defaultContact } from "@/lib/site-contact";
import { loginPath } from "@/lib/safe-next";

const OPEN_EVENT = "tecsecure-help-open";

const words = {
  uz: { help: "Yordam", title: "Yordam", call: "Qo‘ng‘iroq qilish", telegram: "Telegram’da yozish", request: "Ariza qoldirish", guest: "Savolingiz bo‘lsa, biz bilan bog‘laning yoki ariza qoldiring.", signIn: "Kirib yozish", conversations: "Suhbatlarim", none: "Hali suhbat yo‘q.", newMessage: "Yangi xabar", send: "Yuborish", sending: "Yuborilmoqda…", back: "Orqaga", all: "Barcha xabarlar", reply: "Javob yozish", failed: "Yuborilmadi. Qayta urinib ko‘ring.", tooShort: "Kamida 3 belgi yozing.", staff: "Tecsecure", you: "Siz", unread: (n: number) => `${n} ta yangi`, loading: "Yuklanmoqda…", closed: "yopilgan" },
  ru: { help: "Помощь", title: "Помощь", call: "Позвонить", telegram: "Написать в Telegram", request: "Оставить заявку", guest: "Если есть вопрос, свяжитесь с нами или оставьте заявку.", signIn: "Войти и написать", conversations: "Мои диалоги", none: "Диалогов пока нет.", newMessage: "Новое сообщение", send: "Отправить", sending: "Отправляется…", back: "Назад", all: "Все сообщения", reply: "Написать ответ", failed: "Не отправлено. Попробуйте ещё раз.", tooShort: "Напишите хотя бы 3 символа.", staff: "Tecsecure", you: "Вы", unread: (n: number) => `новых: ${n}`, loading: "Загрузка…", closed: "закрыт" },
  en: { help: "Help", title: "Help", call: "Call us", telegram: "Write on Telegram", request: "Leave a request", guest: "Have a question? Contact us or leave a request.", signIn: "Sign in to write", conversations: "My conversations", none: "No conversations yet.", newMessage: "New message", send: "Send", sending: "Sending…", back: "Back", all: "All messages", reply: "Write a reply", failed: "Not sent. Please try again.", tooShort: "Write at least 3 characters.", staff: "Tecsecure", you: "You", unread: (n: number) => `${n} new`, loading: "Loading…", closed: "closed" }
} as const;

type Data = { guest: boolean; unread: number };

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
  const hidden = pathname.startsWith("/admin") || pathname.startsWith("/tg") || pathname.startsWith("/staff");

  // Who is looking: a guest gets the contact options, a customer the chat.
  const load = useCallback(async () => {
    const response = await fetch("/api/portal/messages?scope=count", { cache: "no-store" }).catch(() => null);
    const next = response?.ok ? await response.json().catch(() => null) as Data | null : null;
    setData(next ?? { guest: true, unread: 0 });
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

  // On a phone the chat fills the screen; when the keyboard opens, the visible height shrinks and the
  // composer has to stay above it, so the sheet follows the visual viewport.
  useEffect(() => {
    if (!open) return;
    const viewport = window.visualViewport;
    const root = document.documentElement;
    const fit = () => root.style.setProperty("--chat-vh", `${Math.round(viewport?.height ?? window.innerHeight)}px`);
    fit();
    viewport?.addEventListener("resize", fit);
    return () => { viewport?.removeEventListener("resize", fit); root.style.removeProperty("--chat-vh"); };
  }, [open]);

  if (hidden) return null;
  const phone = defaultContact.phone;
  const telegram = defaultContact.telegram.replace("@", "");
  return <>
    <button type="button" className="help-fab" aria-label={unread ? `${w.help}, ${w.unread(unread)}` : w.help} onClick={() => setOpen(true)}>
      <UiIcon name="mail" size={20} /><span className="help-fab-label">{w.help}</span>
      {unread > 0 && <span className="help-fab-count" aria-hidden="true">{unread > 9 ? "9+" : unread}</span>}
    </button>
    {open && <SiteDialog className="site-dialog cab-dialog help-dialog" title={w.title} onClose={() => { setOpen(false); void load(); }}>
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
      </> : <ChatView />}
    </SiteDialog>}
  </>;
}
