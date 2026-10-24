"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";
import { OAuthSignIn } from "@/components/oauth-sign-in";

type Props = { mode: "login" | "register"; audience?: "customer" | "staff" };

export function AuthForm({ mode, audience = "customer" }: Props) {
  const router = useRouter();
  const { t } = useSitePreferences();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const data = { ...Object.fromEntries(new FormData(event.currentTarget)), audience };
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? t("requestFailed"));
        return;
      }
      router.replace(audience === "staff" ? "/admin" : "/portal");
      router.refresh();
    } catch {
      setError(t("serverUnavailable"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-card">
      <span className="eyebrow">{audience === "staff" ? t("staffLogin") : mode === "login" ? t("loginEyebrow") : t("registerEyebrow")}</span>
      <h1>{audience === "staff" ? t("staffLoginTitle") : mode === "login" ? t("loginTitle") : t("registerTitle")}</h1>
      <p className="muted">
        {audience === "staff" ? t("staffLoginDescription") : mode === "login" ? t("loginDescription") : t("registerDescription")}
      </p>
      <form className="form" onSubmit={submit}>
        {mode === "register" && <div className="field"><label htmlFor="name">{t("name")}</label><input id="name" name="name" autoComplete="name" minLength={2} maxLength={100} required /></div>}
        <div className="field"><label htmlFor="email">{t("email")}</label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
        <div className="field">
          <label htmlFor="password">{t("password")}</label>
          <input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 8 : 1} maxLength={128} required />
          {mode === "register" && <span className="small muted">{t("minimum8Characters")}</span>}
        </div>
        {error && <div className="notice error" role="alert">{error}</div>}
        <button className="button" type="submit" disabled={busy}>{busy ? t("waiting") : mode === "login" ? t("signIn") : t("createAccountButton")}</button>
      </form>
      {audience === "customer" && <OAuthSignIn mode={mode} />}
      {audience === "customer" && <p className="small muted" style={{ marginTop: 18 }}>
        {mode === "login" ? <>{t("noAccount")} <Link className="text-link" href="/register">{t("registerLink")}</Link></> : <>{t("alreadyHaveAccount")} <Link className="text-link" href="/login">{t("signIn")}</Link></>}
      </p>}
    </section>
  );
}
