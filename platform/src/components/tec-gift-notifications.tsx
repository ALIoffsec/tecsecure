"use client";

import { useEffect, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";

type GiftNotice = {
  id: string;
  status: string;
  createdAt: string;
  amountTec: number;
  senderName: string;
};

function parseGiftNotice(value: unknown): GiftNotice | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const payload = row.payload;
  if (!payload || typeof payload !== "object") return null;
  const details = payload as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.status !== "string" ||
    typeof row.createdAt !== "string" ||
    typeof details.amountTec !== "number" ||
    typeof details.senderName !== "string"
  ) return null;
  return {
    id: row.id,
    status: row.status,
    createdAt: row.createdAt,
    amountTec: details.amountTec,
    senderName: details.senderName
  };
}

export function TecGiftNotifications() {
  const { locale, t } = useSitePreferences();
  const [notices, setNotices] = useState<GiftNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let current = true;
    fetch("/api/notifications", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? t("tecGiftError"));
        const rows: unknown[] = Array.isArray(result.notifications) ? result.notifications : [];
        if (current) setNotices(rows.map(parseGiftNotice).filter((item): item is GiftNotice => item !== null));
      })
      .catch(() => {
        if (current) setError(t("tecGiftError"));
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => { current = false; };
  }, [t]);

  async function markRead(id: string) {
    setError("");
    try {
      const response = await fetch(`/api/notifications/${encodeURIComponent(id)}`, { method: "PATCH" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("tecGiftError"));
      setNotices((current) => current.map((item) => item.id === id ? { ...item, status: "READ" } : item));
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("tecGiftError"));
    }
  }

  if (loading || (!notices.length && !error)) return null;

  const numberLocale = locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US";
  return (
    <section className="panel-card tec-gift-notifications" aria-live="polite">
      <h2>{t("tecGiftNotifications")}</h2>
      {error && <div className="notice error" role="alert">{error}</div>}
      <div className="list">
        {notices.map((item) => (
          <article className={`list-row tec-gift-notice${item.status === "UNREAD" ? " unread" : ""}`} key={item.id}>
            <div>
              <strong>{t("tecGiftCongratulations").replace("{sender}", item.senderName).replace("{amount}", item.amountTec.toLocaleString(numberLocale))}</strong>
              <p className="small muted">{new Date(item.createdAt).toLocaleString(numberLocale)}</p>
            </div>
            {item.status === "UNREAD"
              ? <button className="button secondary small" onClick={() => void markRead(item.id)} type="button">{t("tecGiftMarkRead")}</button>
              : <span className="status">{t("tecGiftRead")}</span>}
          </article>
        ))}
      </div>
    </section>
  );
}
