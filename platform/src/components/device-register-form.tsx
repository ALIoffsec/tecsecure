"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";

type OrganizationOption = { id: string; name: string };

export function DeviceRegisterForm({ organizations }: { organizations: OrganizationOption[] }) {
  const router = useRouter();
  const { t } = useSitePreferences();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
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

  if (!organizations.length) return <p className="muted">{t("addDeviceFirst")}</p>;
  return <form className="form" onSubmit={submit}>
    <div className="field"><label htmlFor="device-org">{t("organization")}</label><select id="device-org" name="organizationId" required>{organizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
    <div className="form-row"><div className="field"><label htmlFor="device-type">{t("deviceType")}</label><input id="device-type" name="type" required minLength={2} maxLength={100} /></div><div className="field"><label htmlFor="device-model">{t("model")}</label><input id="device-model" name="model" maxLength={120} /></div></div>
    <div className="form-row"><div className="field"><label htmlFor="device-brand">{t("manufacturer")}</label><input id="device-brand" name="manufacturer" maxLength={100} /></div><div className="field"><label htmlFor="device-serial">{t("serialNumber")}</label><input id="device-serial" name="serialNumber" maxLength={160} /></div></div>
    <p className="small muted">{t("deviceMonitoringDisclaimer")}</p>
    {error && <div className="notice error" role="alert">{error}</div>}
    <button className="button secondary" disabled={busy}>{busy ? t("saving") : t("addDevice")}</button>
  </form>;
}
