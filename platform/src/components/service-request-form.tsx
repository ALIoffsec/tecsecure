"use client";

import { FormEvent, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";
import Link from "next/link";
import { journeyCopy } from "@/lib/journey-copy";

export type ServiceOption = { id: string; name: string };

export function ServiceRequestForm({ services, showRegisterLink = false, initialMode = "detailed", topic = "", serviceId = "" }: {
  services: ServiceOption[]; showRegisterLink?: boolean; initialMode?: "callback" | "detailed"; topic?: string; serviceId?: string;
}) {
  const { t, locale } = useSitePreferences();
  const c = journeyCopy[locale];
  const [mode, setMode] = useState(initialMode);
  const [message, setMessage] = useState<{ text: string; reference?: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());
    body.consent = formData.get("consent") === "on" ? "true" : "false";
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, consent: body.consent === "true" })
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage({ text: result.error ?? t("requestFailed"), error: true });
        return;
      }
      form.reset();
      setMessage({ text: t("requestSaved"), reference: result.request.reference, error: false });
    } catch {
      setMessage({ text: t("serverUnavailable"), error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form panel-card" onSubmit={submit}>
      <div className="journey-actions" role="group" aria-label={t("serviceType")}>
        <button type="button" className={`button ${mode === "callback" ? "" : "secondary"}`} aria-pressed={mode === "callback"} onClick={() => setMode("callback")}>{c.callback}</button>
        <button type="button" className={`button ${mode === "detailed" ? "" : "secondary"}`} aria-pressed={mode === "detailed"} onClick={() => setMode("detailed")}>{c.detailedRequest}</button>
      </div>
      <input type="hidden" name="mode" value={mode} />
      {topic && <div className="field"><label htmlFor="request-topic">{c.context}</label><input id="request-topic" name="topic" defaultValue={topic} maxLength={160} /></div>}
      <div className="form-row">
        <div className="field"><label htmlFor="request-name">{t("requestFormName")} {mode === "detailed" ? "*" : `(${c.optional})`}</label><input id="request-name" name="name" autoComplete="name" required={mode === "detailed"} minLength={2} maxLength={100} /></div>
        <div className="field"><label htmlFor="request-phone">{t("phone")} *</label><input id="request-phone" name="phone" type="tel" autoComplete="tel" placeholder="+998 90 123 45 67" required minLength={7} maxLength={30} /></div>
      </div>
      <fieldset className="request-details-fields" hidden={mode === "callback"} disabled={mode === "callback"}>
      <div className="form-row">
        <div className="field"><label htmlFor="request-email">Email</label><input id="request-email" name="email" type="email" maxLength={254} /></div>
        <div className="field"><label htmlFor="request-org">{t("organization")}</label><input id="request-org" name="organizationName" maxLength={160} /></div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="request-service">{t("serviceType")}</label>
          <select id="request-service" name="serviceId" defaultValue={serviceId}>
            <option value="">{t("technicalAdvice")}</option>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
          </select>
        </div>
        <div className="field"><label htmlFor="request-city">{t("city")}</label><input id="request-city" name="city" maxLength={100} /></div>
      </div>
      <div className="field"><label htmlFor="request-location">{t("siteAddressOptional")}</label><input id="request-location" name="location" maxLength={500} /></div>
      </fieldset>
      {mode === "callback" && serviceId && <input type="hidden" name="serviceId" value={serviceId} />}
      <div className="field"><label htmlFor="request-description">{t("requestDetails")} {mode === "detailed" ? "*" : `(${c.optional})`}</label><textarea id="request-description" name="description" required={mode === "detailed"} minLength={mode === "detailed" ? 5 : undefined} maxLength={5000} /></div>
      <div className="field"><label htmlFor="request-time">{t("preferredContactTime")}</label><input id="request-time" name="preferredContactTime" maxLength={120} /></div>
      <label className="checkline"><input type="checkbox" name="consent" required />{t("consentText")}</label>
      <Link className="text-link small" href="/privacy">{t("privacyPolicy")}</Link>
      <ToastMessage
        message={message ? `${message.text}${message.reference ? ` ${message.reference}` : ""}` : ""}
        variant={message?.error ? "error" : "success"}
        action={message && !message.error && showRegisterLink ? { label: t("registerForFutureRequests"), href: "/register" } : undefined}
      />
      {message && !message.error && <div className="request-confirmation" role="status"><strong>{message.reference}</strong><p>{c.requestNext}</p><Link className="text-link" href="/portal/requests">{c.requests}</Link></div>}
      <button className="button" type="submit" disabled={busy}>{busy ? t("sending") : t("submitRequest")}</button>
    </form>
  );
}
