"use client";

import Script from "next/script";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

/** The parts of Telegram.WebApp the Mini Apps use. Newer methods are optional: older clients lack them. */
type BottomButton = {
  setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean; has_shine_effect?: boolean; position?: "left" | "right" | "top" | "bottom" }) => void;
  onClick: (fn: () => void) => void;
  offClick: (fn: () => void) => void;
  showProgress: (leaveActive?: boolean) => void;
  hideProgress: () => void;
  hide: () => void;
};
export type TelegramWebApp = {
  initData: string;
  version: string;
  colorScheme?: "light" | "dark";
  ready: () => void;
  expand: () => void;
  close: () => void;
  isVersionAtLeast: (version: string) => boolean;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  setBottomBarColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
  MainButton: BottomButton;
  SecondaryButton?: BottomButton;
  BackButton: { show: () => void; hide: () => void; onClick: (fn: () => void) => void; offClick: (fn: () => void) => void };
  HapticFeedback?: { impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void; notificationOccurred: (type: "error" | "success" | "warning") => void; selectionChanged: () => void };
  showConfirm?: (message: string, callback: (ok: boolean) => void) => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
};

export const TELEGRAM_SCRIPT = "https://telegram.org/js/telegram-web-app.js";
export type MiniApp = "customer" | "staff" | "shop";

/** Telegram.WebApp only when the page really runs inside Telegram (the script alone defines it everywhere). */
export function telegramApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  const app = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
  return app?.initData ? app : null;
}

const atLeast = (app: TelegramWebApp, version: string) => {
  try { return app.isVersionAtLeast(version); } catch { return false; }
};

/** Small taps under the finger; silent outside Telegram and on clients without haptics. */
export const haptic = {
  tap: () => { const app = telegramApp(); if (app && atLeast(app, "6.1")) app.HapticFeedback?.impactOccurred("light"); },
  select: () => { const app = telegramApp(); if (app && atLeast(app, "6.1")) app.HapticFeedback?.selectionChanged(); },
  success: () => { const app = telegramApp(); if (app && atLeast(app, "6.1")) app.HapticFeedback?.notificationOccurred("success"); },
  error: () => { const app = telegramApp(); if (app && atLeast(app, "6.1")) app.HapticFeedback?.notificationOccurred("error"); }
};

/** Telegram's own confirm dialog inside the app, the browser's one elsewhere. */
export function confirmAction(message: string): Promise<boolean> {
  const app = telegramApp();
  if (app?.showConfirm && atLeast(app, "6.2")) return new Promise(resolve => app.showConfirm?.(message, resolve));
  return Promise.resolve(window.confirm(message));
}

/**
 * Signs the person in again from Telegram's signed initData. Staff admin access lasts 30 minutes, so an
 * action that comes back 401 renews it once and retries instead of sending them to a login page.
 */
export async function renewTelegramSession(app: MiniApp): Promise<boolean> {
  const telegram = telegramApp();
  if (!telegram) return false;
  try {
    const response = await fetch("/api/telegram/webapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ initData: telegram.initData, app }) });
    return response.ok && Boolean((await response.json().catch(() => ({}))).next);
  } catch {
    return false;
  }
}

export async function sendJson(app: MiniApp, url: string, method: string, body: object): Promise<{ ok: boolean; error?: string }> {
  const attempt = () => fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  try {
    let response = await attempt();
    if (response.status === 401 && await renewTelegramSession(app)) response = await attempt();
    if (response.ok) return { ok: true };
    const data = await response.json().catch(() => ({}));
    return { ok: false, error: typeof data.error === "string" ? data.error : undefined };
  } catch {
    return { ok: false };
  }
}

type ShellState = { telegram: TelegramWebApp | null };
const ShellContext = createContext<ShellState>({ telegram: null });
export const useTelegram = () => useContext(ShellContext).telegram;

/**
 * The frame both Mini Apps share: Telegram's script, its colours (the script writes --tg-theme-* onto
 * <html>), safe areas, and a bottom tab bar. No site header, footer or effects: the root layout leaves them
 * out on /tg.
 */
export function TmaShell({ app, children, tabs, active, onTab }: {
  app: MiniApp;
  children: ReactNode;
  tabs?: { id: string; label: string; icon: ReactNode; badge?: number }[];
  active?: string;
  onTab?: (id: string) => void;
}) {
  const [telegram, setTelegram] = useState<TelegramWebApp | null>(null);

  const start = useCallback(() => {
    const webApp = telegramApp();
    document.documentElement.dataset.tma = app;
    if (!webApp) return;
    webApp.ready();
    webApp.expand();
    if (atLeast(webApp, "6.1")) {
      webApp.setHeaderColor?.("secondary_bg_color");
      webApp.setBackgroundColor?.("secondary_bg_color");
    }
    if (atLeast(webApp, "7.7")) webApp.disableVerticalSwipes?.();
    if (atLeast(webApp, "7.10")) webApp.setBottomBarColor?.("bottom_bar_bg_color");
    setTelegram(webApp);
  }, [app]);

  // The script may already be on the page (the entry screen loaded it before a refresh).
  useEffect(() => { if (telegramApp()) start(); else document.documentElement.dataset.tma = app; }, [app, start]);

  return <ShellContext.Provider value={{ telegram }}>
    <Script src={TELEGRAM_SCRIPT} strategy="afterInteractive" onReady={start} />
    <div className={`tma-shell${tabs ? " has-tabs" : ""}`} data-app={app} data-in-telegram={telegram ? "" : undefined}>
      {children}
      {tabs && <nav className="tma-tabs" aria-label="Menu">
        {tabs.map(tab => <button key={tab.id} type="button" aria-current={tab.id === active ? "page" : undefined} onClick={() => { if (tab.id !== active) { haptic.select(); onTab?.(tab.id); } }}>
          <span className="tma-tab-icon" aria-hidden="true">{tab.icon}{tab.badge ? <span className="tma-badge">{tab.badge > 99 ? "99+" : tab.badge}</span> : null}</span>
          <span>{tab.label}</span>
        </button>)}
      </nav>}
    </div>
  </ShellContext.Provider>;
}

type ButtonSpec = { text: string; onClick: () => void; busy?: boolean; disabled?: boolean; tone?: "primary" | "danger" } | null;

/**
 * Telegram's MainButton and SecondaryButton for the current screen. Outside Telegram, or on clients older
 * than 7.10 for the secondary one, the same actions render as an ordinary bar at the bottom of the page.
 */
export function BottomActions({ main, secondary }: { main: ButtonSpec; secondary?: ButtonSpec }) {
  const telegram = useTelegram();
  const nativeSecondary = Boolean(telegram && atLeast(telegram, "7.10") && telegram.SecondaryButton);

  useEffect(() => {
    if (!telegram) return;
    const button = telegram.MainButton;
    if (!main) { button.hide(); return; }
    const click = () => { haptic.tap(); main.onClick(); };
    button.setParams({
      text: main.text,
      is_visible: true,
      is_active: !main.disabled && !main.busy,
      ...(main.tone === "danger" ? { color: "#d93a3a", text_color: "#ffffff" } : {})
    });
    if (main.busy) button.showProgress(false); else button.hideProgress();
    button.onClick(click);
    return () => { button.offClick(click); };
  }, [telegram, main]);

  useEffect(() => {
    if (!telegram || !nativeSecondary || !telegram.SecondaryButton) return;
    const button = telegram.SecondaryButton;
    if (!secondary) { button.hide(); return; }
    const click = () => { haptic.tap(); secondary.onClick(); };
    button.setParams({ text: secondary.text, is_visible: true, is_active: !secondary.disabled && !secondary.busy, position: "left" });
    button.onClick(click);
    return () => { button.offClick(click); };
  }, [telegram, nativeSecondary, secondary]);

  // Leaving the screen takes its buttons away.
  useEffect(() => () => {
    const webApp = telegramApp();
    webApp?.MainButton.hide();
    webApp?.SecondaryButton?.hide();
  }, []);

  const pageMain = !telegram && main;
  const pageSecondary = (!telegram || !nativeSecondary) && secondary;
  if (!pageMain && !pageSecondary) return null;
  return <div className="tma-bottom-actions">
    {pageSecondary && <button type="button" className="tma-button secondary" disabled={pageSecondary.disabled || pageSecondary.busy} onClick={() => { haptic.tap(); pageSecondary.onClick(); }}>{pageSecondary.text}</button>}
    {pageMain && <button type="button" className={`tma-button${pageMain.tone === "danger" ? " danger" : ""}`} disabled={pageMain.disabled || pageMain.busy} onClick={() => { haptic.tap(); pageMain.onClick(); }}>{pageMain.busy ? "…" : pageMain.text}</button>}
  </div>;
}

/** Telegram's back arrow while a detail screen is open; a plain back link outside Telegram. */
export function useBackButton(onBack: (() => void) | null) {
  const telegram = useTelegram();
  const ref = useRef(onBack);
  useEffect(() => { ref.current = onBack; });
  const active = Boolean(onBack);
  useEffect(() => {
    if (!telegram) return;
    if (!active) { telegram.BackButton.hide(); return; }
    const back = () => { haptic.select(); ref.current?.(); };
    telegram.BackButton.show();
    telegram.BackButton.onClick(back);
    return () => { telegram.BackButton.offClick(back); telegram.BackButton.hide(); };
  }, [telegram, active]);
  return Boolean(telegram);
}

/** Opens a phone number: tel: links work in Telegram's in-app view on phones. */
export function callNumber(phone: string) {
  window.location.href = `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export const TabIcon = {
  today: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17M8 14h3" /></svg>,
  requests: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>,
  orders: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" /><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" /></svg>,
  profile: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>,
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>,
  products: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16l-1.5 12a2 2 0 0 1-2 1.8h-9a2 2 0 0 1-2-1.8z" /><path d="M8.5 7a3.5 3.5 0 0 1 7 0" /></svg>,
  balance: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M3 10h18M16 15h2" /></svg>
};
