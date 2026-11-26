"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { formatDateTime } from "@/lib/format";
import { notificationText, type NotificationView } from "@/lib/notifications";

const words = {
  uz: { title: "Bildirishnomalar", markAll: "Hammasini o‘qilgan qilish", more: "Yana ko‘rsatish", empty: "Hozircha bildirishnoma yo‘q.", failed: "Bildirishnomalarni yuklab bo‘lmadi.", retry: "Qayta urinish", unread: "yangi" },
  ru: { title: "Уведомления", markAll: "Отметить все прочитанными", more: "Показать ещё", empty: "Уведомлений пока нет.", failed: "Не удалось загрузить уведомления.", retry: "Повторить", unread: "новое" },
  en: { title: "Notifications", markAll: "Mark all as read", more: "Show more", empty: "No notifications yet.", failed: "Could not load notifications.", retry: "Try again", unread: "new" }
} as const;

/** Unread first by date like the rest; opening one marks it read and goes to its page. */
export function NotificationList() {
  const router = useRouter();
  const { locale } = useSitePreferences();
  const w = words[locale];
  const [items, setItems] = useState<NotificationView[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<string>("");
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  const load = useCallback(async (after: string | null) => {
    setState("loading");
    try {
      const response = await fetch(`/api/notifications?scope=all${after ? `&cursor=${encodeURIComponent(after)}` : ""}`, { cache: "no-store" });
      if (!response.ok) throw new Error("failed");
      const data = await response.json() as { items: NotificationView[]; nextCursor: string | null };
      setItems(current => after ? [...current, ...data.items] : data.items);
      setCursor(data.nextCursor);
      if (!after) setLoadedAt(new Date().toISOString());
      setState("ready");
    } catch {
      setState("failed");
    }
  }, []);
  useEffect(() => { void load(null); }, [load]);

  async function open(item: NotificationView) {
    if (item.unread) await fetch(`/api/notifications/${encodeURIComponent(item.id)}`, { method: "PATCH" }).catch(() => undefined);
    router.push(item.href);
  }

  async function markAll() {
    const response = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ before: loadedAt }) }).catch(() => null);
    if (response?.ok) { setItems(current => current.map(item => ({ ...item, unread: false }))); router.refresh(); }
  }

  const anyUnread = items.some(item => item.unread);
  return <>
    <div className="portal-section-heading">
      <h1 className="cab-title" tabIndex={-1}>{w.title}</h1>
      {anyUnread && <button className="button ghost" type="button" onClick={() => void markAll()}>{w.markAll}</button>}
    </div>
    {state === "failed" && !items.length && <p className="notice error" role="alert">{w.failed} <button className="button ghost" type="button" onClick={() => void load(null)}>{w.retry}</button></p>}
    {state === "loading" && !items.length && <ul className="list" aria-busy="true">{[0, 1, 2].map(key => <li className="list-row cab-skel" key={key} />)}</ul>}
    {state === "ready" && !items.length && <div className="empty-state checkout-empty"><p>{w.empty}</p></div>}
    {items.length > 0 && <section className="panel-card">
      <ul className="list">{items.map(item => <li key={item.id}>
        <button className={`list-row is-clickable-card cab-notice${item.unread ? " is-unread" : ""}`} type="button" onClick={() => void open(item)}>
          <span><strong>{notificationText(item, locale)}</strong><small className="muted">{formatDateTime(item.createdAt)}</small></span>
          {item.unread && <span className="order-status is-review">{w.unread}</span>}
        </button>
      </li>)}</ul>
      {cursor && <button className="button ghost" type="button" disabled={state === "loading"} onClick={() => void load(cursor)}>{w.more}</button>}
    </section>}
  </>;
}
