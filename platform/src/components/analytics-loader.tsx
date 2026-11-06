"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type YandexCounter = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };

function counterId(): number {
  return Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID) || 0;
}

export const analyticsAvailable = () => counterId() > 0;

/** Yandex Metrika, loaded only after the visitor agrees. Session replay stays off on purpose. */
export function AnalyticsLoader({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const loaded = useRef(false);

  useEffect(() => {
    const id = counterId();
    if (!id) return;
    const page = window as unknown as Record<string, unknown> & { ym?: YandexCounter };
    page[`disableYaCounter${id}`] = !enabled;
    if (!enabled) {
      // Withdrawing consent also clears what the counter already stored.
      for (const cookie of document.cookie.split("; ")) {
        const name = cookie.split("=")[0];
        if (name.startsWith("_ym_")) document.cookie = `${name}=; Path=/; Max-Age=0`;
      }
      return;
    }
    if (loaded.current) {
      page.ym?.(id, "hit", window.location.href);
      return;
    }
    loaded.current = true;
    const queue: YandexCounter = (...args: unknown[]) => { (queue.a = queue.a ?? []).push(args); };
    queue.l = Date.now();
    page.ym = page.ym ?? queue;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://mc.yandex.ru/metrika/tag.js";
    document.head.appendChild(script);
    page.ym?.(id, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: false, defer: false });
  }, [enabled, pathname]);

  return null;
}
