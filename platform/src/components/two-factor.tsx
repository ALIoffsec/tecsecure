"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ToastMessage } from "./toast-provider";
import { useSitePreferences } from "./site-preferences";
import { securityCopy } from "@/lib/security-copy";

/** The second sign-in step: one field for the authenticator (or backup) code. Calls onDone with where to go next. */
export function TwoFactorStep({ ticket, onDone, onRestart }: { ticket: string; onDone: (next: string) => void; onRestart: () => void }) {
  const { locale } = useSitePreferences();
  const c = securityCopy[locale];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const code = String(new FormData(event.currentTarget).get("code") ?? "").trim();
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticket, code }) });
      const data = await response.json().catch(() => ({}));
      if (response.ok && typeof data.next === "string") { onDone(data.next); return; }
      if (data.code === "TICKET_EXPIRED") { setExpired(true); setError(c.expired); } else setError(data.code === "WRONG_CODE" ? c.wrong : data.error ?? c.failed);
    } catch {
      setError(c.failed);
    } finally {
      setBusy(false);
    }
  }

  return <form className="form two-factor-step" onSubmit={submit}>
    <h2>{c.stepTitle}</h2>
    <p className="muted small">{c.stepHint}</p>
    <ToastMessage message={error} variant="error" />
    <div className="field"><label htmlFor="two-factor-code">{c.code}</label>
      <input id="two-factor-code" className="code-input" name="code" required minLength={6} maxLength={12} inputMode="text" autoComplete="one-time-code" autoFocus disabled={expired} />
    </div>
    {expired
      ? <button className="button" type="button" onClick={onRestart}>{c.restart}</button>
      : <button className="button" type="submit" disabled={busy}>{busy ? c.checking : c.confirm}</button>}
  </form>;
}

type Status = { enabled: boolean; backupCodesLeft: number };

/** Profile card: turn two-factor sign-in on or off. Optional; nothing changes until the person turns it on. */
export function TwoFactorSettings() {
  const { locale } = useSitePreferences();
  const c = securityCopy[locale];
  const [status, setStatus] = useState<Status | null>(null);
  const [setup, setSetup] = useState<{ qr: string; secret: string } | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [disabling, setDisabling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  const refresh = () => fetch("/api/account/2fa", { cache: "no-store" }).then(response => response.ok ? response.json() : null).then(setStatus).catch(() => setStatus(null));
  useEffect(() => { void refresh(); }, []);

  async function call(body: object) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/account/2fa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.code === "WRONG_CODE" ? c.wrong : data.error ?? c.failed); return null; }
      return data;
    } catch {
      setError(c.failed);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function start() {
    const data = await call({ action: "start" });
    if (data?.qr) setSetup({ qr: data.qr, secret: data.secret });
  }
  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = await call({ action: "confirm", code: String(new FormData(event.currentTarget).get("code") ?? "") });
    if (data?.backupCodes) { setSetup(null); setBackupCodes(data.backupCodes); setNotice(c.enabledNotice); void refresh(); }
  }
  async function disable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = await call({ action: "disable", code: String(new FormData(event.currentTarget).get("code") ?? "") });
    if (data?.ok) { setDisabling(false); setNotice(c.disabledNotice); void refresh(); }
  }
  async function copyCodes() {
    if (!backupCodes) return;
    try { await navigator.clipboard.writeText(backupCodes.join("\n")); setCopied(true); } catch { setCopied(false); }
  }

  if (!status) return null;
  return <section className="panel-card two-factor-card">
    <div className="section-head">
      <div><h2>{c.card}</h2><p className="small muted">{c.cardHint}</p></div>
      <span className={`status ${status.enabled ? "ok" : "pending"}`}>{status.enabled ? c.on : c.off}</span>
    </div>
    <ToastMessage message={error} variant="error" />
    <ToastMessage message={notice} variant="success" />

    {backupCodes && <div className="two-factor-backup">
      <h3>{c.backupTitle}</h3>
      <p className="small muted">{c.backupHint}</p>
      <ol className="two-factor-codes">{backupCodes.map(code => <li key={code}><code>{code}</code></li>)}</ol>
      <div className="admin-integration-actions">
        <button className="button secondary" type="button" onClick={() => void copyCodes()}>{copied ? c.copied : c.copy}</button>
        <button className="button" type="button" onClick={() => { setBackupCodes(null); setCopied(false); }}>{c.done}</button>
      </div>
    </div>}

    {!backupCodes && !status.enabled && !setup && <button className="button" type="button" disabled={busy} onClick={() => void start()}>{c.enable}</button>}

    {setup && <div className="two-factor-setup">
      <p className="small">{c.scan}</p>
      <img className="two-factor-qr" src={setup.qr} width={200} height={200} alt="QR" />
      <p className="small muted">{c.manual}</p>
      <code className="two-factor-secret">{setup.secret}</code>
      <form className="form" onSubmit={confirm}>
        <div className="field"><label htmlFor="two-factor-confirm">{c.enterCode}</label>
          <input id="two-factor-confirm" className="code-input" name="code" required inputMode="numeric" pattern="[0-9 ]{6,8}" maxLength={8} autoComplete="one-time-code" />
        </div>
        <div className="admin-integration-actions">
          <button className="button" type="submit" disabled={busy}>{busy ? c.checking : c.confirm}</button>
          <button className="button ghost" type="button" disabled={busy} onClick={() => setSetup(null)}>{c.cancel}</button>
        </div>
      </form>
    </div>}

    {!backupCodes && status.enabled && <>
      <p className="small">{c.backupLeft}: <strong>{status.backupCodesLeft}</strong></p>
      {!disabling
        ? <button className="button danger" type="button" onClick={() => setDisabling(true)}>{c.disable}</button>
        : <form className="form" onSubmit={disable}>
          <div className="field"><label htmlFor="two-factor-disable">{c.disableHint}</label>
            <input id="two-factor-disable" className="code-input" name="code" required minLength={6} maxLength={12} autoComplete="one-time-code" />
          </div>
          <div className="admin-integration-actions">
            <button className="button danger" type="submit" disabled={busy}>{busy ? c.checking : c.disable}</button>
            <button className="button ghost" type="button" disabled={busy} onClick={() => setDisabling(false)}>{c.cancel}</button>
          </div>
        </form>}
    </>}
  </section>;
}
