"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "./site-preferences";
import { ToastMessage } from "./toast-provider";
import { phoneCopy } from "@/lib/phone-copy";

type Status = { hasPhone: boolean; supported: boolean; verified: boolean; sms: boolean; telegram: boolean };

/** Profile block: prove the number typed in the profile, so sign-in by phone finds this account. */
export function PhoneVerify() {
  const router = useRouter();
  const { locale, t } = useSitePreferences();
  const c = phoneCopy[locale];
  const [status, setStatus] = useState<Status | null>(null);
  const [step, setStep] = useState<"idle" | "code">("idle");
  const [note, setNote] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/account/phone", { cache: "no-store" }).then(response => response.ok ? response.json() : null).then(setStatus).catch(() => setStatus(null));
  }, []);

  async function call(body: object) {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/account/phone", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.code === "UNSUPPORTED_PHONE" ? c.unsupported : data.error ?? t("requestFailed")); return null; }
      return data;
    } catch {
      setError(t("serverUnavailable"));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function send(action: "send" | "telegram") {
    const data = await call({ action });
    if (!data) return;
    if (data.verified) { setStatus(current => current && { ...current, verified: true }); return; }
    if (action === "telegram" && typeof data.link === "string") {
      setLink(data.link); setNote(c.telegramWaiting);
      window.open(data.link, "_blank", "noopener");
    } else {
      setLink(null); setNote(data.via === "gateway" ? c.sentGateway : data.via === "recent" ? c.recent : c.sentSms);
    }
    setStep("code");
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = await call({ action: "verify", code: String(new FormData(event.currentTarget).get("code") ?? "") });
    if (data?.verified) {
      setStatus(current => current && { ...current, verified: true });
      setStep("idle"); setNote(c.done);
      router.refresh();
    }
  }

  if (!status?.hasPhone) return null;
  if (status.verified) return <p className="small muted" role="status">{note || `${t("phone")}: ${c.verified}`}</p>;
  if (!status.supported) return <p className="small muted">{c.unsupported}</p>;

  return <section className="telegram-card phone-verify">
    <div>
      <strong>{c.verifyTitle}</strong>
      <span>{c.notVerified}. {c.verifyHint}</span>
      {note && <span className="telegram-card-note" role="status">{note}</span>}
    </div>
    <ToastMessage message={error} variant="error" />
    {step === "idle" ? <div className="hero-actions">
      {status.sms && <button className="button secondary" type="button" disabled={busy} onClick={() => void send("send")}>{busy ? c.sending : c.sendSms}</button>}
      {status.telegram && <button className="button ghost" type="button" disabled={busy} onClick={() => void send("telegram")}>{c.viaTelegram}</button>}
    </div> : <form className="form" onSubmit={verify}>
      {link && <a className="button secondary" href={link} target="_blank" rel="noreferrer">{c.openTelegram}</a>}
      <div className="field"><label htmlFor="phone-verify-code">{c.code}</label>
        <input id="phone-verify-code" className="code-input" name="code" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" />
      </div>
      <button className="button" type="submit" disabled={busy}>{busy ? c.checking : c.confirm}</button>
    </form>}
  </section>;
}
