"use client";

import { FormEvent, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";

export function PasswordChangeForm() {
  const { t } = useSitePreferences();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const newPassword = String(data.get("newPassword") ?? "");
    if (newPassword !== data.get("confirmPassword")) {
      setError(t("passwordMismatch"));
      return;
    }
    setError(""); setSuccess(""); setBusy(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: data.get("currentPassword"), newPassword })
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? t("requestFailed")); return; }
      form.reset();
      setSuccess(t("passwordUpdated"));
    } catch {
      setError(t("serverUnavailable"));
    } finally {
      setBusy(false);
    }
  }

  return <form className="form" onSubmit={submit}>
    <div className="field"><label htmlFor="currentPassword">{t("currentPassword")}</label><input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required /></div>
    <div className="field"><label htmlFor="newPassword">{t("newPassword")} (12+)</label><input id="newPassword" name="newPassword" type="password" minLength={12} maxLength={128} autoComplete="new-password" required /></div>
    <div className="field"><label htmlFor="confirmPassword">{t("confirmPassword")}</label><input id="confirmPassword" name="confirmPassword" type="password" minLength={12} maxLength={128} autoComplete="new-password" required /></div>
    {error && <div className="notice error" role="alert">{error}</div>}
    {success && <div className="notice success" role="status">{success}</div>}
    <button className="button secondary" disabled={busy}>{busy ? t("saving") : t("updatePassword")}</button>
  </form>;
}
