"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useSitePreferences } from "./site-preferences";
import { ToastMessage } from "./toast-provider";
import { growthCopy } from "@/lib/growth-copy";

const RESEND_SECONDS = 60;

export function CodeSignIn({ purpose }: { purpose: "LOGIN" | "RESET" }) {
  const { locale, t } = useSitePreferences();
  const c = growthCopy[locale].code;
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [sent, setSent] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [wait, setWait] = useState(0);
  const [available, setAvailable] = useState(true);
  const login = purpose === "LOGIN";

  useEffect(() => {
    fetch("/api/auth/otp").then(response => response.json()).then((status: { sms: boolean; email: boolean; telegram: boolean }) => {
      setAvailable(login ? status.sms || status.telegram : status.sms || status.email || status.telegram);
    }).catch(() => {});
  }, [login]);
  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  async function post(body: object) {
    const response = await fetch("/api/auth/otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? t("requestFailed"));
    return data;
  }

  async function requestCode(event?: FormEvent) {
    event?.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const data = await post({ action: "request", purpose, identifier });
      setIsNew(Boolean(data.isNew));
      setSent(true);
      setWait(RESEND_SECONDS);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      await post({ action: "verify", purpose, identifier, code: form.get("code"), ...(form.get("password") ? { password: form.get("password") } : {}), ...(form.get("name") ? { name: form.get("name") } : {}) });
      router.replace("/portal");
      router.refresh();
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
      setBusy(false);
    }
  }

  return <div className="container page-shell code-page">
    <section className="panel-card code-card">
      <h1>{login ? c.loginTitle : c.resetTitle}</h1>
      <p className="muted">{login ? c.loginHint : c.resetHint}</p>
      <ToastMessage message={error} variant="error" />
      {!available && <p className="code-note" role="status">{c.unavailable}</p>}
      {!sent
        ? <form className="form" onSubmit={requestCode}>
          <div className="field"><label htmlFor="code-identifier">{login ? c.phone : c.identifier}</label>
            <input id="code-identifier" value={identifier} onChange={event => setIdentifier(event.target.value)} required minLength={5} maxLength={254} inputMode={login ? "tel" : "text"} autoComplete={login ? "tel" : "username"} placeholder={login ? "+998 90 123 45 67" : ""} autoFocus />
          </div>
          <button className="button" type="submit" disabled={busy || !available}>{busy ? c.sending : c.send}</button>
        </form>
        : <form className="form" onSubmit={verify}>
          <p className="code-note" role="status">{login ? c.sentLogin : c.sent}</p>
          <div className="field"><label htmlFor="code-value">{c.code}</label>
            <input id="code-value" className="code-input" name="code" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" autoFocus />
          </div>
          {login && isNew && <div className="field"><label htmlFor="code-name">{c.name}</label><input id="code-name" name="name" minLength={2} maxLength={100} autoComplete="name" /></div>}
          {!login && <div className="field"><label htmlFor="code-password">{c.newPassword}</label><input id="code-password" name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" /><small className="muted">{t("minimum8Characters")}</small></div>}
          <button className="button" type="submit" disabled={busy}>{busy ? c.done : c.confirm}</button>
          <button className="button ghost" type="button" disabled={wait > 0 || busy} onClick={() => void requestCode()}>{wait > 0 ? `${c.resendIn} (${wait})` : c.resend}</button>
        </form>}
      <Link className="text-link small" href="/login">{c.back}</Link>
    </section>
  </div>;
}

/** Lets a person connect their Telegram account, which is what lets the bot reach them at all. */
export function TelegramLinkCard({ staff = false }: { staff?: boolean }) {
  const { locale, t } = useSitePreferences();
  const c = growthCopy[locale].telegram;
  const [linked, setLinked] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch("/api/telegram/link").then(response => response.ok ? response.json() : null).then(data => setLinked(data ? Boolean(data.linked) : false)).catch(() => setLinked(false));
  }, []);
  async function connect() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/telegram/link", { method: "POST" });
      const data = await response.json();
      if (!response.ok || typeof data.link !== "string") { setMessage(response.status === 503 ? c.unavailable : data.error ?? t("requestFailed")); return; }
      window.open(data.link, "_blank", "noopener");
      setMessage(c.openLink);
    } catch {
      setMessage(t("serverUnavailable"));
    } finally {
      setBusy(false);
    }
  }
  async function disconnect() {
    setBusy(true);
    try {
      const response = await fetch("/api/telegram/link", { method: "DELETE" });
      if (response.ok) setLinked(false);
    } finally {
      setBusy(false);
    }
  }
  return <section className="telegram-card">
    <div><strong>{staff ? c.staffTitle : c.title}</strong><span>{linked ? c.connected : staff ? c.staffHint : c.hint}</span>{message && <span className="telegram-card-note" role="status">{message}</span>}</div>
    {linked
      ? <button className="button ghost" type="button" disabled={busy} onClick={() => void disconnect()}>{c.disconnect}</button>
      : <button className="button secondary" type="button" disabled={busy || linked === null} onClick={() => void connect()}>{c.connect}</button>}
  </section>;
}
