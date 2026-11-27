"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "./site-preferences";
import { ToastMessage } from "./toast-provider";
import { formatDate, formatDateTime } from "@/lib/format";
import { statusText } from "@/lib/status-labels";
import { isWrongAddress, subscriptionMoveAllowed } from "@/lib/monitoring-rules";

type Device = { id: string; type: string; model: string | null; hostname: string | null; monitoringMethod: string | null; monitored: boolean; status: string; lastCheckAt: Date | string | null; organization: { name: string }; checks: { detail: string | null }[] };
type Subscription = { id: string; status: string; trialEndsAt: Date | string | null; createdAt: Date | string; plan: { name: string }; organization: { id: string; name: string } };

const words = {
  uz: { title: "Monitoring", back: "Boshqaruv paneli", devices: "Qurilmalar", subs: "Mijoz obunalari", host: "Host", method: "Usul (tcp:PORT)", on: "Tekshiruvni yoqish", off: "Tekshiruvni o‘chirish", save: "Saqlash", wrong: "Manzil noto‘g‘ri", none: "Hali yo‘q.", trial: "Sinov ochish", org: "Tashkilot", plan: "Reja", consent: "Mijoz sinovga rozi bo‘ldi", trialEnds: "sinov tugaydi", move: "Holatni o‘zgartirish", failed: "Saqlanmadi." },
  ru: { title: "Мониторинг", back: "Панель управления", devices: "Устройства", subs: "Подписки клиентов", host: "Хост", method: "Метод (tcp:PORT)", on: "Включить проверку", off: "Выключить проверку", save: "Сохранить", wrong: "Неверный адрес", none: "Пока нет.", trial: "Открыть пробный период", org: "Организация", plan: "План", consent: "Клиент согласился на пробный период", trialEnds: "пробный период до", move: "Сменить статус", failed: "Не сохранено." },
  en: { title: "Monitoring", back: "Admin panel", devices: "Devices", subs: "Customer subscriptions", host: "Host", method: "Method (tcp:PORT)", on: "Turn checks on", off: "Turn checks off", save: "Save", wrong: "Wrong address", none: "None yet.", trial: "Open a trial", org: "Organisation", plan: "Plan", consent: "The customer agreed to the trial", trialEnds: "trial ends", move: "Change status", failed: "Not saved." }
} as const;

async function send(url: string, method: "POST" | "PATCH", body: unknown): Promise<string | null> {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  if (response?.ok) return null;
  const data = await response?.json().catch(() => ({})) ?? {};
  return typeof data.error === "string" ? data.error : "";
}

/** Staff side of monitoring: where each device is checked (only public addresses pass), and customer subscriptions. */
export function AdminMonitoring({ devices, subscriptions, organizations, plans, canDevices }: { devices: Device[]; subscriptions: Subscription[]; organizations: { id: string; name: string }[]; plans: { id: string; name: string; trialDays: number }[]; canDevices: boolean }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function act(url: string, method: "POST" | "PATCH", body: unknown) {
    setBusy(true); setError("");
    const failure = await send(url, method, body);
    setBusy(false);
    if (failure !== null) { setError(failure || w.failed); return; }
    router.refresh();
  }
  return <div className="container page-shell admin-orders">
    <Link className="small text-link" href="/admin">← {w.back}</Link>
    <h1 className="page-title">{w.title}</h1>
    <ToastMessage message={error} variant="error" />
    {canDevices && <section className="panel-card">
      <h2>{w.devices}</h2>
      {devices.length === 0 ? <p className="muted">{w.none}</p> : <ul className="list">{devices.map(device => <li className="list-row admin-device-row" key={device.id}>
        <div>
          <strong>{device.organization.name} · {device.type} {device.model ?? ""}</strong>
          <p className="small muted">{device.lastCheckAt ? formatDateTime(device.lastCheckAt) : "—"} · {device.monitored && device.status !== "ONLINE" && isWrongAddress(device.checks[0]?.detail) ? w.wrong : statusText("device", device.status, locale)}{device.checks[0]?.detail ? ` · ${device.checks[0].detail}` : ""}</p>
        </div>
        <form className="form-row" onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void act(`/api/devices/${device.id}`, "PATCH", { monitored: device.monitored, hostname: String(data.get("hostname") ?? "").trim() || undefined, monitoringMethod: String(data.get("method") ?? "").trim() || undefined });
        }}>
          <div className="field"><label htmlFor={`host-${device.id}`}>{w.host}</label><input id={`host-${device.id}`} name="hostname" defaultValue={device.hostname ?? ""} maxLength={253} /></div>
          <div className="field"><label htmlFor={`method-${device.id}`}>{w.method}</label><input id={`method-${device.id}`} name="method" defaultValue={device.monitoringMethod ?? ""} maxLength={20} placeholder="tcp:443" /></div>
          <button className="button secondary small" disabled={busy}>{w.save}</button>
        </form>
        <button type="button" className={device.monitored ? "button ghost small" : "button small"} disabled={busy} onClick={() => void act(`/api/devices/${device.id}`, "PATCH", { monitored: !device.monitored })}>{device.monitored ? w.off : w.on}</button>
      </li>)}</ul>}
    </section>}
    {organizations.length > 0 && <section className="panel-card">
      <h2>{w.subs}</h2>
      {subscriptions.length === 0 ? <p className="muted">{w.none}</p> : <ul className="list">{subscriptions.map(sub => <li className="list-row" key={sub.id}>
        <div><strong>{sub.organization.name} · {sub.plan.name}</strong><p className="small muted">{statusText("subscription", sub.status, locale)}{sub.trialEndsAt ? ` · ${w.trialEnds} ${formatDate(sub.trialEndsAt)}` : ""}</p></div>
        <label className="field small">{w.move}<select defaultValue="" disabled={busy} onChange={event => { const to = event.currentTarget.value; event.currentTarget.value = ""; if (to) void act(`/api/subscriptions/${sub.id}`, "PATCH", { status: to }); }}>
          <option value="">—</option>
          {(["ACTIVE", "PAST_DUE", "SUSPENDED", "CANCELLED"] as const).filter(to => subscriptionMoveAllowed(sub.status, to)).map(to => <option key={to} value={to}>{statusText("subscription", to, locale)}</option>)}
        </select></label>
      </li>)}</ul>}
      {plans.length > 0 && <form className="form" onSubmit={event => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        void act("/api/subscriptions", "POST", { organizationId: data.get("organizationId"), planId: data.get("planId"), consent: data.get("consent") === "on" });
      }}>
        <h3>{w.trial}</h3>
        <div className="form-row">
          <div className="field"><label htmlFor="trial-org-admin">{w.org}</label><select id="trial-org-admin" name="organizationId">{organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}</select></div>
          <div className="field"><label htmlFor="trial-plan-admin">{w.plan}</label><select id="trial-plan-admin" name="planId">{plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name} · {plan.trialDays}</option>)}</select></div>
        </div>
        <label className="checkline"><input type="checkbox" name="consent" required /> {w.consent}</label>
        <button className="button secondary" disabled={busy}>{w.trial}</button>
      </form>}
    </section>}
  </div>;
}
