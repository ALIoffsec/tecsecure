"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";

export function OrganizationSetupForm() {
  const router = useRouter();
  const { t } = useSitePreferences();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError("");
    setBusy(true);
    const data = Object.fromEntries(new FormData(form));
    const hasLocation = Boolean(data.locationName || data.address);
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          type: data.type,
          phone: data.phone,
          location: hasLocation ? { name: data.locationName, address: data.address, city: data.city } : undefined
        })
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? t("requestFailed"));
        return;
      }
      form.reset();
      router.refresh();
    } catch {
      setError(t("serverUnavailable"));
    } finally {
      setBusy(false);
    }
  }

  return <form className="form" onSubmit={submit}>
    <div className="field"><label htmlFor="org-name">{t("organization")}</label><input id="org-name" name="name" minLength={2} maxLength={160} required /></div>
    <div className="form-row"><div className="field"><label htmlFor="org-type">{t("companyTypeOptional")}</label><input id="org-type" name="type" maxLength={100} /></div><div className="field"><label htmlFor="org-phone">{t("phone")}</label><input id="org-phone" name="phone" maxLength={30} /></div></div>
    <div className="field"><label htmlFor="org-location">{t("firstLocationOptional")}</label><input id="org-location" name="locationName" maxLength={120} /></div>
    <div className="form-row"><div className="field"><label htmlFor="org-address">{t("siteAddress")}</label><input id="org-address" name="address" maxLength={500} /></div><div className="field"><label htmlFor="org-city">{t("city")}</label><input id="org-city" name="city" maxLength={100} /></div></div>
    <ToastMessage message={error} variant="error" />
    <button className="button" disabled={busy}>{busy ? t("saving") : t("addOrganization")}</button>
  </form>;
}
