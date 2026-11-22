"use client";

import Script from "next/script";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/*
 * Kept apart from telegram-app.tsx: the root layout renders this on every page, and importing it from the
 * Mini App module pulled the whole staff app and its copy into every page's JavaScript.
 */

export type TelegramWebApp = {
  initData: string;
  colorScheme?: "dark" | "light";
  ready: () => void;
  expand: () => void;
  BackButton: { show: () => void; hide: () => void; onClick: (fn: () => void) => void; offClick: (fn: () => void) => void };
};
export const SCRIPT_URL = "https://telegram.org/js/telegram-web-app.js";
export const SESSION_KEY = "tecsecure-tma";
export const webApp = () => (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;

/** Inside Telegram the system back button replaces the page's own, on every page after the first. */
export function TelegramBridge() {
  const pathname = usePathname();
  const router = useRouter();
  const [inApp, setInApp] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const entry = pathname.startsWith("/tg");
  useEffect(() => {
    try { setInApp(sessionStorage.getItem(SESSION_KEY) !== null); } catch { /* an ordinary browser */ }
  }, [pathname]);
  useEffect(() => {
    const telegram = webApp();
    if (entry || !telegram?.initData) return;
    document.documentElement.dataset.tma = pathname.startsWith("/admin") ? "staff" : "customer";
    const back = () => router.back();
    if (pathname === "/products" || pathname === "/admin/app" || pathname === "/shop") {
      telegram.BackButton.hide();
      return;
    }
    telegram.BackButton.show();
    telegram.BackButton.onClick(back);
    return () => telegram.BackButton.offClick(back);
  }, [entry, loaded, pathname, router]);
  return inApp && !entry ? <Script src={SCRIPT_URL} strategy="afterInteractive" onReady={() => setLoaded(value => value + 1)} /> : null;
}
