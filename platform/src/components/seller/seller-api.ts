"use client";

import { useCallback, useEffect, useState } from "react";
import { renewTelegramSession, telegramApp } from "../tma-kit";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string; code?: string };

/**
 * Every call of the seller app. Inside Telegram an expired session is renewed from Telegram's signed data
 * and the call retried once; in a browser a lost session sends the person to the login page.
 */
export async function sellerApi<T>(url: string, init: { method?: string; body?: unknown } = {}): Promise<ApiResult<T>> {
  const attempt = () => fetch(url, {
    method: init.method ?? "GET",
    headers: init.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store"
  });
  try {
    let response = await attempt();
    if (response.status === 401 && telegramApp() && await renewTelegramSession("shop")) response = await attempt();
    if (response.status === 401 && !telegramApp()) {
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return { ok: false, status: 401, error: "" };
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, status: response.status, error: typeof data.error === "string" ? data.error : "", code: data.code };
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, error: "" };
  }
}

/** Uploads one product photo (or the logo) as the shop owner; the server checks size and type. */
export async function uploadShopPhoto(file: File): Promise<ApiResult<{ id: string }>> {
  const form = new FormData();
  form.set("scope", "SHOP");
  form.set("file", file);
  try {
    let response = await fetch("/api/media", { method: "POST", body: form });
    if (response.status === 401 && telegramApp() && await renewTelegramSession("shop")) response = await fetch("/api/media", { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.asset?.id) return { ok: false, status: response.status, error: typeof data.error === "string" ? data.error : "", code: data.code };
    return { ok: true, data: { id: data.asset.id as string } };
  } catch {
    return { ok: false, status: 0, error: "" };
  }
}

/** So'm from minor units to the number typed in a field, and back. */
export const toMajor = (minor: number | null | undefined) => minor === null || minor === undefined ? "" : String(Math.round(minor) / 100);
export function toMinor(major: string): number | null {
  const cleaned = major.replace(/[\s ]/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const value = Math.round(Number(cleaned) * 100);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}


/** Loads one endpoint for a screen; `reload` fetches again after a change. */
export function useSellerData<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [failed, setFailed] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!url) return;
    let alive = true;
    void sellerApi<T>(url).then(result => {
      if (!alive) return;
      if (result.ok) { setData(result.data); setFailed(""); } else setFailed(result.error || "failed");
    });
    return () => { alive = false; };
  }, [url, version]);
  const reload = useCallback(() => setVersion(value => value + 1), []);
  return { data, failed, reload, setData };
}
