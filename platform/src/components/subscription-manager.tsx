"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";

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
  const router = useRouter();
  const { locale, t } = useSitePreferences();
  const dateLocale = locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US";
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function enroll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: data.get("organizationId"), planId: data.get("planId"), consent: data.get("consent") === "on" })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      setNotice(t("trialStarted").replace("{date}", new Date(result.subscription.trialEndsAt).toLocaleDateString(dateLocale)));
      router.refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : t("requestFailed")); }
    finally { setBusy(false); }
  }

  async function cancel(id: string) {
    setError("");
    const response = await fetch(`/api/subscriptions/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CANCELLED" })
    });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? t("requestFailed")); return; }
    router.refresh();
  }

  const hasCurrent = subscriptions.some((item) => ["TRIAL_ACTIVE", "ACTIVE", "PAST_DUE", "SUSPENDED"].includes(item.status));
  return <section className="panel-card" style={{ marginTop: 20 }}>
    <h2>{t("monitoringTrials")}</h2>
    <p className="small muted">{t("trialNotice")}</p>
    <ToastMessage message={error} variant="error" />
    <ToastMessage message={notice} variant="success" />
    {subscriptions.length ? <div className="list">{subscriptions.map((item) => <div className="list-row" key={item.id}>
      <div><strong>{item.organization.name} · {item.plan.name}</strong><p>{item.status} · {item.plan.priceMinor === null ? t("negotiatedPrice") : `${(item.plan.priceMinor / 100).toLocaleString(dateLocale)} ${item.plan.currency}/${item.plan.interval}`}</p><p className="small muted">{item.trialEndsAt ? `${t("trialEnds")}: ${new Date(item.trialEndsAt).toLocaleDateString(dateLocale)}` : t("noTrialPeriod")}</p></div>
      {!["CANCELLED"].includes(item.status) && <button className="button danger small" onClick={() => cancel(item.id)}>{t("cancel")}</button>}
    </div>)}</div> : <div className="empty-state">{t("noSubscriptionYet")}</div>}
    {!hasCurrent && organizations.length > 0 && plans.some((plan) => plan.trialDays > 0) && <form className="form" onSubmit={enroll} style={{ marginTop: 20 }}>
      <div className="form-row"><div className="field"><label htmlFor="trial-org">{t("organization")}</label><select id="trial-org" name="organizationId">{organizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div className="field"><label htmlFor="trial-plan">{t("plan")}</label><select id="trial-plan" name="planId">{plans.filter((plan) => plan.trialDays > 0).map((plan) => <option key={plan.id} value={plan.id}>{plan.name} · {plan.trialDays} {t("trialDays")}</option>)}</select></div></div>
      <p className="notice">{t("trialConsentNotice")}</p>
      <label className="checkline"><input type="checkbox" name="consent" required />{t("trialConsent")}</label>
      <button className="button secondary" disabled={busy}>{busy ? t("starting") : t("startTrial")}</button>
    </form>}
  </section>;
}
