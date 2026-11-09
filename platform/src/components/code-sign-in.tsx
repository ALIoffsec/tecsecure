"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useSitePreferences } from "./site-preferences";
import { ToastMessage } from "./toast-provider";
import { TwoFactorStep } from "./two-factor";
import { growthCopy } from "@/lib/growth-copy";

const RESEND_SECONDS = 60;
type Step = "identify" | "code" | "password" | "twoFactor";

/** True for an Uzbek mobile number however it is typed: the only kind the Telegram check can confirm. */
function looksLikePhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return !value.includes("@") && (/^998\d{9}$/.test(digits) || /^\d{9}$/.test(digits));
}

/**
 * Phone sign-in and password reset, one step at a time: the number (or email), then only the code, then,
 * for a reset, the new password twice. Accounts with two-factor finish with the authenticator code.
 */
export function CodeSignIn({ purpose }: { purpose: "LOGIN" | "RESET" }) {
  const { locale, t } = useSitePreferences();
  const c = growthCopy[locale].code;
  const router = useRouter();
  const login = purpose === "LOGIN";
  const [step, setStep] = useState<Step>("identify");
  const [identifier, setIdentifier] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [wait, setWait] = useState(0);
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const [resetTicket, setResetTicket] = useState("");
  const [twoFactor, setTwoFactor] = useState("");
  const [channels, setChannels] = useState<{ sms: boolean; email: boolean; telegram: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/auth/otp").then(response => response.json()).then(setChannels).catch(() => {});
  }, []);
  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  const phone = looksLikePhone(identifier);
  const telegramOption = Boolean(channels?.telegram) && phone;
  // Without SMS a phone can still be confirmed through Telegram; email needs the mailbox to be set up.
  const directOption = !channels || (phone ? channels.sms || channels.telegram : channels.email || channels.telegram);
  const available = !channels || (login ? channels.sms || channels.telegram : channels.sms || channels.email || channels.telegram);

  async function post(body: object) {
    const response = await fetch("/api/auth/otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data.code === "NO_CHANNEL" ? c.noChannel : data.code === "SEND_FAILED" ? c.sendFailed
        : data.code === "WRONG_CODE" ? c.wrongCode : data.code === "TICKET_EXPIRED" ? c.ticketExpired
          : data.code === "PASSWORD_MISMATCH" ? c.passwordsDiffer : data.error ?? t("requestFailed");
      throw Object.assign(new Error(message), { code: data.code as string | undefined });
    }
    return data;
  }
  async function run(task: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError("");
    try { await task(); } catch (issue) { setError(issue instanceof Error ? issue.message : t("requestFailed")); } finally { setBusy(false); }
  }

  const sendCode = (event?: FormEvent) => {
    event?.preventDefault();
    return run(async () => {
      const data = await post({ action: "request", purpose, identifier });
      setIsNew(Boolean(data.isNew));
      setTelegramLink(null);
      setNote(login
        ? data.via === "sms" ? c.sentSms : data.via === "telegram" ? c.sentTelegram : data.via === "recent" ? c.recent : c.sentLogin
        : !phone && channels?.email ? c.sentEmail : c.sent);
      setWait(RESEND_SECONDS);
      setStep("code");
    });
  };

  const viaTelegram = () => run(async () => {
    const data = await post({ action: "telegram", purpose, identifier });
    setIsNew(Boolean(data.isNew));
    setTelegramLink(data.link);
    setNote(c.telegramWaiting);
    setStep("code");
    window.open(data.link, "_blank", "noopener");
  });

  const finish = (data: { twoFactor?: string }) => {
    if (typeof data.twoFactor === "string") { setTwoFactor(data.twoFactor); setStep("twoFactor"); return; }
    router.replace("/portal");
    router.refresh();
  };

  const verifyCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    return run(async () => {
      const data = await post({ action: "verify", purpose, identifier, code: String(form.get("code") ?? ""), ...(form.get("name") ? { name: form.get("name") } : {}) });
      if (!login && typeof data.ticket === "string") { setResetTicket(data.ticket); setStep("password"); return; }
      finish(data);
    });
  };

  const savePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password !== confirm) { setError(c.passwordsDiffer); return; }
    return run(async () => {
      try {
        finish(await post({ action: "reset", identifier, ticket: resetTicket, password, confirm }));
      } catch (issue) {
        if ((issue as { code?: string }).code === "TICKET_EXPIRED") { setStep("identify"); setResetTicket(""); }
        throw issue;
      }
    });
  };

  const restart = () => { setStep("identify"); setNote(""); setError(""); setTelegramLink(null); setResetTicket(""); setTwoFactor(""); };
  const steps = login ? [c.stepIdentify, c.stepCode] : [c.stepIdentifyReset, c.stepCode, c.stepPassword];
  const stepIndex = step === "identify" ? 0 : step === "code" ? 1 : 2;

  if (step === "twoFactor") return <div className="container page-shell code-page">
    <section className="panel-card code-card"><TwoFactorStep ticket={twoFactor} onRestart={restart} onDone={next => { router.replace(next); router.refresh(); }} /></section>
  </div>;

  return <div className="container page-shell code-page">
    <section className="panel-card code-card">
      <h1>{login ? c.loginTitle : c.resetTitle}</h1>
      <ol className="code-steps" aria-label={login ? c.loginTitle : c.resetTitle}>
        {steps.map((label, index) => <li key={label} className={index === stepIndex ? "is-current" : index < stepIndex ? "is-done" : ""} aria-current={index === stepIndex ? "step" : undefined}>{label}</li>)}
      </ol>
      <ToastMessage message={error} variant="error" />

      {step === "identify" && <>
        <p className="muted">{login ? c.loginHint : c.resetHint}</p>
        {!available && <p className="code-note" role="status">{c.unavailable}</p>}
        <form className="form" onSubmit={sendCode}>
          <div className="field"><label htmlFor="code-identifier">{login ? c.phone : c.identifier}</label>
            <input id="code-identifier" value={identifier} onChange={event => setIdentifier(event.target.value)} required minLength={5} maxLength={254} inputMode={login ? "tel" : "text"} autoComplete={login ? "tel" : "username"} placeholder={login ? "+998 90 123 45 67" : ""} autoFocus />
          </div>
          {directOption && <button className="button" type="submit" disabled={busy || !available}>{busy ? c.sending : c.send}</button>}
          {telegramOption && <>
            {directOption && <span className="code-or">{c.or}</span>}
            <button className="button secondary code-telegram" type="button" disabled={busy} onClick={() => void viaTelegram()}>{c.telegramGet}</button>
            <p className="small muted">{c.telegramHint}</p>
          </>}
        </form>
      </>}

      {step === "code" && <form className="form" onSubmit={verifyCode}>
        <p className="code-note" role="status">{note}</p>
        {telegramLink && <a className="button secondary" href={telegramLink} target="_blank" rel="noreferrer">{c.openTelegram}</a>}
        <div className="field"><label htmlFor="code-value">{c.code}</label>
          <input id="code-value" className="code-input" name="code" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" autoFocus />
        </div>
        {login && isNew && <div className="field"><label htmlFor="code-name">{c.name}</label><input id="code-name" name="name" minLength={2} maxLength={100} autoComplete="name" /></div>}
        <button className="button" type="submit" disabled={busy}>{busy ? c.checking : login ? c.confirm : c.verifyCode}</button>
        {!telegramLink && <button className="button ghost" type="button" disabled={wait > 0 || busy} onClick={() => void sendCode()}>{wait > 0 ? `${c.resendIn} (${wait})` : c.resend}</button>}
        <button className="text-link small code-change" type="button" onClick={restart}>{c.changeNumber}</button>
      </form>}

      {step === "password" && <form className="form" onSubmit={savePassword}>
        <h2>{c.passwordTitle}</h2>
        <p className="muted small">{c.passwordHint}</p>
        <div className="field"><label htmlFor="code-password">{c.newPassword}</label><input id="code-password" name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" autoFocus /><small className="muted">{t("minimum8Characters")}</small></div>
        <div className="field"><label htmlFor="code-password-confirm">{c.confirmPassword}</label><input id="code-password-confirm" name="confirm" type="password" required minLength={8} maxLength={128} autoComplete="new-password" /></div>
        <button className="button" type="submit" disabled={busy}>{busy ? c.done : c.savePassword}</button>
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
