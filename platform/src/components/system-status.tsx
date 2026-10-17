"use client";

import { useCallback, useEffect, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";

type Status = {
  status: "ok" | "degraded";
  database: "ok" | "unavailable";
  checkedAt: string;
  uptimeSeconds: number;
  memory: { rssBytes: number; heapUsedBytes: number };
};

export function SystemStatus() {
  const { locale, t } = useSitePreferences();
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const numberLocale = locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US";

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/system-status", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok && !result.status) throw new Error(result.error ?? t("requestFailed"));
      setStatus(result as Status);
      setError("");
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const formatBytes = (bytes: number) => `${(bytes / (1024 * 1024)).toLocaleString(numberLocale, { maximumFractionDigits: 1 })} MB`;
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return <section className="panel-card">
    <div className="section-head"><div><h2>{t("serverStatus")}</h2><p className="small muted">{t("serverStatusDescription")}</p></div><button className="button secondary small" type="button" disabled={loading} onClick={() => void refresh()}>{loading ? t("loading") : t("refresh")}</button></div>
    {error && <div className="notice error" role="alert">{error}</div>}
    {status && <div className="dashboard-grid">
      <div className="metric"><strong className={`status-value ${status.status}`}>{status.status === "ok" ? t("systemOperational") : t("systemDegraded")}</strong><span>{t("applicationStatus")}</span></div>
      <div className="metric"><strong className={`status-value ${status.database}`}>{status.database === "ok" ? t("systemOperational") : t("systemUnavailable")}</strong><span>{t("databaseStatus")}</span></div>
      <div className="metric"><strong>{formatUptime(status.uptimeSeconds)}</strong><span>{t("serverUptime")}</span></div>
      <div className="metric"><strong>{formatBytes(status.memory.rssBytes)}</strong><span>{t("memoryUsage")}</span></div>
      <div className="metric"><strong>{formatBytes(status.memory.heapUsedBytes)}</strong><span>{t("heapUsage")}</span></div>
      <div className="metric"><strong>{new Date(status.checkedAt).toLocaleTimeString(numberLocale)}</strong><span>{t("lastChecked")}</span></div>
    </div>}
  </section>;
}
