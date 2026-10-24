"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSitePreferences } from "@/components/site-preferences";

export type ServiceOption = { id: string; name: string };

export function ServiceRequestForm({ services, showRegisterLink = false }: { services: ServiceOption[]; showRegisterLink?: boolean }) {
  const { t } = useSitePreferences();
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
      <div className="form-row">
        <div className="field"><label htmlFor="request-name">{t("requestFormName")} *</label><input id="request-name" name="name" required minLength={2} maxLength={100} /></div>
        <div className="field"><label htmlFor="request-phone">{t("phone")} *</label><input id="request-phone" name="phone" type="tel" required minLength={7} maxLength={30} /></div>
      </div>
      <div className="form-row">
        <div className="field"><label htmlFor="request-email">Email</label><input id="request-email" name="email" type="email" maxLength={254} /></div>
        <div className="field"><label htmlFor="request-org">{t("organization")}</label><input id="request-org" name="organizationName" maxLength={160} /></div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="request-service">{t("serviceType")}</label>
          <select id="request-service" name="serviceId" defaultValue="">
            <option value="">{t("technicalAdvice")}</option>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
          </select>
        </div>
        <div className="field"><label htmlFor="request-city">{t("city")}</label><input id="request-city" name="city" maxLength={100} /></div>
      </div>
      <div className="field"><label htmlFor="request-location">{t("siteAddressOptional")}</label><input id="request-location" name="location" maxLength={500} /></div>
      <div className="field"><label htmlFor="request-description">{t("requestDetails")} *</label><textarea id="request-description" name="description" required minLength={5} maxLength={5000} /></div>
      <div className="field"><label htmlFor="request-time">{t("preferredContactTime")}</label><input id="request-time" name="preferredContactTime" maxLength={120} /></div>
      <label className="checkline"><input type="checkbox" name="consent" required />{t("consentText")}</label>
      {message && <div className={`notice ${message.error ? "error" : "success"}`} role="status">
        {message.text} {message.reference && <strong>{message.reference}</strong>}
        {!message.error && showRegisterLink && <p><Link href="/register">{t("registerForFutureRequests")}</Link></p>}
      </div>}
      <button className="button" type="submit" disabled={busy}>{busy ? t("sending") : t("submitRequest")}</button>
    </form>
  );
}
