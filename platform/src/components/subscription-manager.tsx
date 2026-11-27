"use client";

import { FormEvent, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";
import { formatDate, formatNumber } from "@/lib/format";
import { statusText } from "@/lib/status-labels";
import { translateMessage } from "@/lib/server-messages";

const askWords = {
  uz: { title: "Obuna so‘rash", hint: "Xodim siz bilan bog‘lanib, sinov yoki obunani o‘zi ochadi.", message: "Izoh (ixtiyoriy)", send: "So‘rov yuborish", sent: "So‘rovingiz yuborildi. Xodim bog‘lanadi." },
  ru: { title: "Запросить подписку", hint: "Сотрудник свяжется с вами и сам откроет пробный период или подписку.", message: "Комментарий (необязательно)", send: "Отправить запрос", sent: "Запрос отправлен. Сотрудник свяжется с вами." },
  en: { title: "Ask for a subscription", hint: "Staff will contact you and open the trial or subscription themselves.", message: "Note (optional)", send: "Send request", sent: "Request sent. Staff will contact you." }
} as const;

type OrganizationOption = { id: string; name: string };
type PlanOption = { id: string; name: string; interval: string; priceMinor: number | null; currency: string; trialDays: number; features: unknown };
type SubscriptionRecord = {
  id: string; status: string; trialEndsAt: Date | null; consentAt: Date | null;
  plan: { name: string; interval: string; priceMinor: number | null; currency: string };
  organization: { name: string };
};

export function SubscriptionManager({ organizations, plans, subscriptions }: {
  organizations: OrganizationOption[];
  plans: PlanOption[];
  subscriptions: SubscriptionRecord[];
}) {
  const { locale, t } = useSitePreferences();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  // A new trial is opened by staff; the customer asks for it here.
  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/subscriptions/request", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: data.get("organizationId"), planId: data.get("planId") || undefined, message: String(data.get("message") ?? "").trim() || undefined })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.error === "string" ? translateMessage(result.error, locale) : t("requestFailed"));
      setNotice(askWords[locale].sent);
      form.reset();
    } catch (issue) { setError(issue instanceof Error ? issue.message : t("requestFailed")); }
    finally { setBusy(false); }
  }

  async function cancel(id: string) {
    setError("");
    const response = await fetch(`/api/subscriptions/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CANCELLED" })
    });
    const result = await response.json();
    if (!response.ok) { setError(typeof result.error === "string" ? translateMessage(result.error, locale) : t("requestFailed")); return; }
    window.location.reload();
  }

  const hasCurrent = subscriptions.some((item) => ["TRIAL_ACTIVE", "ACTIVE", "PAST_DUE", "SUSPENDED"].includes(item.status));
  return <section className="panel-card" style={{ marginTop: 20 }}>
    <h2>{t("monitoringTrials")}</h2>
    <p className="small muted">{t("trialNotice")}</p>
    <ToastMessage message={error} variant="error" />
    <ToastMessage message={notice} variant="success" />
    {subscriptions.length ? <div className="list">{subscriptions.map((item) => <div className="list-row" key={item.id}>
      <div><strong>{item.organization.name} · {item.plan.name}</strong><p>{statusText("subscription", item.status, locale)} · {item.plan.priceMinor === null ? t("negotiatedPrice") : `${formatNumber(item.plan.priceMinor / 100)} ${item.plan.currency}/${item.plan.interval}`}</p><p className="small muted">{item.trialEndsAt ? `${t("trialEnds")}: ${formatDate(item.trialEndsAt)}` : t("noTrialPeriod")}</p></div>
      {!["CANCELLED"].includes(item.status) && <button className="button danger small" onClick={() => cancel(item.id)}>{t("cancel")}</button>}
    </div>)}</div> : <div className="empty-state">{t("noSubscriptionYet")}</div>}
    {!hasCurrent && organizations.length > 0 && <form className="form" onSubmit={ask} style={{ marginTop: 20 }}>
      <h3>{askWords[locale].title}</h3>
      <p className="small muted">{askWords[locale].hint}</p>
      <div className="form-row"><div className="field"><label htmlFor="trial-org">{t("organization")}</label><select id="trial-org" name="organizationId">{organizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>{plans.length > 0 && <div className="field"><label htmlFor="trial-plan">{t("plan")}</label><select id="trial-plan" name="planId"><option value="">—</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></div>}</div>
      <div className="field"><label htmlFor="trial-message">{askWords[locale].message}</label><textarea id="trial-message" name="message" maxLength={1000} rows={2} /></div>
      <button className="button secondary" disabled={busy}>{busy ? t("saving") : askWords[locale].send}</button>
    </form>}
  </section>;
}
