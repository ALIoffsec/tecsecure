"use client";

import { useCallback, useEffect, useState } from "react";
import { ToastMessage } from "./toast-provider";
import { useSitePreferences } from "./site-preferences";
import { formatDateTime } from "@/lib/format";
import type { Locale } from "@/lib/messages";

type BotStatus = {
  bot: "customer" | "staff" | "shop"; configured: boolean; hasSecret: boolean; username: string | null; expectedUrl: string; url: string | null;
  urlMatches: boolean; pendingUpdates: number; lastErrorAt: string | null; lastError: string | null; allowedUpdates: string[] | null; problems: string[]; error: string | null;
};

const copy: Record<Locale, Record<string, string>> = {
  uz: { title: "Bot holati", hint: "Telegram’ning o‘zi har bir bot haqida nima deyotgani. Bot javob bermasa, sababi shu yerda ko‘rinadi.", refresh: "Yangilash", customer: "Mijozlar boti", staff: "Xodimlar boti", shop: "Do‘konlar boti", notConfigured: "Token kiritilmagan", ok: "Ishlayapti", problem: "Muammo bor", webhook: "Webhook manzili", expected: "Kerakli manzil", none: "o‘rnatilmagan", pending: "Kutayotgan xabarlar", lastError: "Oxirgi xato", updates: "Qabul qilinadigan turlar", reset: "Webhookni qayta o‘rnatish", menu: "Menyu tugmasini o‘rnatish", done: "Bajarildi.", menuDone: "Menyu tugmasi o‘rnatildi.", loading: "Telegram’dan so‘ralmoqda…" },
  ru: { title: "Состояние ботов", hint: "Что сам Telegram сообщает о каждом боте. Если бот молчит, причина видна здесь.", refresh: "Обновить", customer: "Бот клиентов", staff: "Бот сотрудников", shop: "Бот магазинов", notConfigured: "Токен не указан", ok: "Работает", problem: "Есть проблема", webhook: "Адрес вебхука", expected: "Нужный адрес", none: "не установлен", pending: "Ожидающих обновлений", lastError: "Последняя ошибка", updates: "Типы обновлений", reset: "Переустановить вебхук", menu: "Установить кнопку меню", done: "Готово.", menuDone: "Кнопка меню установлена.", loading: "Запрашиваем Telegram…" },
  en: { title: "Bot status", hint: "What Telegram itself reports about each bot. If a bot stays silent, the reason shows here.", refresh: "Refresh", customer: "Customer bot", staff: "Staff bot", shop: "Shop bot", notConfigured: "No token", ok: "Working", problem: "Needs attention", webhook: "Webhook URL", expected: "Expected URL", none: "not set", pending: "Pending updates", lastError: "Last error", updates: "Update types", reset: "Reset webhook", menu: "Set menu button", done: "Done.", menuDone: "Menu button set.", loading: "Asking Telegram…" }
};

/** Admin → integrations: each bot's webhook as Telegram sees it, with buttons to repair it. */
export function AdminBotStatus() {
  const { locale } = useSitePreferences();
  const c = copy[locale];
  const [bots, setBots] = useState<BotStatus[] | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/integrations/bots", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "");
      setBots(data.bots);
    } catch (issue) {
      setError(issue instanceof Error && issue.message ? issue.message : c.problem);
    }
  }, [c.problem]);
  useEffect(() => { void load(); }, [load]);

  async function act(bot: BotStatus["bot"], action: "webhook" | "menu") {
    setBusy(`${bot}:${action}`); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/integrations/bots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bot, action }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? c.problem);
      setNotice(action === "menu" ? c.menuDone : c.done);
      await load();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : c.problem);
    } finally {
      setBusy("");
    }
  }

  return <details className="admin-records-accordion admin-bot-status" open>
    <summary>{c.title}</summary>
    <div className="stack">
      <p className="small muted">{c.hint}</p>
      <ToastMessage message={error} variant="error" />
      <ToastMessage message={notice} variant="success" />
      <button className="button secondary small" type="button" onClick={() => { setBots(null); void load(); }}>{c.refresh}</button>
      {!bots ? <p className="small muted" role="status">{c.loading}</p> : bots.map(status => <article className="admin-bot-card" key={status.bot}>
        <div className="section-head">
          <strong>{c[status.bot]}{status.username ? ` · @${status.username}` : ""}</strong>
          <span className={`status ${!status.configured ? "pending" : status.problems.length ? "failed" : "ok"}`}>{!status.configured ? c.notConfigured : status.problems.length ? c.problem : c.ok}</span>
        </div>
        {status.configured && <>
          <dl className="admin-bot-facts">
            <dt>{c.webhook}</dt><dd><code>{status.url ?? c.none}</code></dd>
            {!status.urlMatches && <><dt>{c.expected}</dt><dd><code>{status.expectedUrl}</code></dd></>}
            <dt>{c.pending}</dt><dd>{status.pendingUpdates}</dd>
            {status.lastError && <><dt>{c.lastError}</dt><dd>{status.lastError}{status.lastErrorAt ? ` (${formatDateTime(status.lastErrorAt)})` : ""}</dd></>}
            {status.allowedUpdates && <><dt>{c.updates}</dt><dd>{status.allowedUpdates.join(", ")}</dd></>}
          </dl>
          {status.problems.length > 0 && <ul className="admin-bot-problems">{status.problems.map(problem => <li key={problem}>{problem}</li>)}</ul>}
          <div className="admin-integration-actions">
            <button className="button small" type="button" disabled={Boolean(busy)} onClick={() => void act(status.bot, "webhook")}>{busy === `${status.bot}:webhook` ? "…" : c.reset}</button>
            <button className="button secondary small" type="button" disabled={Boolean(busy)} onClick={() => void act(status.bot, "menu")}>{busy === `${status.bot}:menu` ? "…" : c.menu}</button>
          </div>
        </>}
      </article>)}
    </div>
  </details>;
}
