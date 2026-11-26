"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { SiteDialog } from "./site-dialog";
import { useSitePreferences } from "./site-preferences";
import { reauthCopy } from "@/lib/reauth-copy";
import { translateMessage } from "@/lib/server-messages";
import { loginPath } from "@/lib/safe-next";

type Method = "password" | "totp" | "telegram" | "phone" | "email" | "recent";
type Options = { methods: Method[]; withTotp: boolean };

/** The one confirmation window used before sensitive changes. It offers only the ways this person has. */
export function ReauthDialog({ action, onDone }: { action: string; onDone: (confirmed: boolean) => void }) {
  const { locale } = useSitePreferences();
  const c = reauthCopy[locale];
  const [options, setOptions] = useState<Options | null>(null);
  const [codeMethod, setCodeMethod] = useState<Method | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    fetch("/api/auth/reauth", { cache: "no-store" }).then(response => response.ok ? response.json() : null).then(data => {
      setOptions(data);
      if (data?.methods?.[0] === "totp") setCodeMethod("totp");
    }).catch(() => setOptions(null));
  }, []);

  async function post(body: object): Promise<boolean> {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/reauth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...body }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(typeof data.error === "string" ? translateMessage(data.error, locale) : c.failed); return false; }
      return true;
    } catch {
      setError(c.failed);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function send(method: "telegram" | "phone" | "email") {
    if (await post({ step: "send", method })) { setCodeMethod(method); setNote(c.sent); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const code = String(form.get("code") ?? "").trim();
    const method: Method = codeMethod && code && !password ? codeMethod : password ? "password" : codeMethod ?? "password";
    if (await post({ step: "confirm", method, ...(password ? { password } : {}), ...(code ? { code } : {}) })) onDone(true);
  }

  async function signInAgain() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.assign(loginPath(window.location.pathname + window.location.search));
  }

  const methods = options?.methods ?? [];
  const showPassword = methods.includes("password") && codeMethod !== "totp";
  const showCode = Boolean(codeMethod) || Boolean(options?.withTotp);

  return <SiteDialog className="site-dialog cab-dialog" title={c.title} onClose={() => { if (!busy) onDone(false); }}>
    <div className="form">
      <p className="small muted">{c.hint}</p>
      {!options && <p role="status" aria-busy="true">{c.checking}</p>}
      {methods.includes("recent") && <>
        <p className="small">{c.recentHint}</p>
        <button className="button" type="button" disabled={busy} onClick={() => void post({ step: "confirm", method: "recent" }).then(ok => ok && onDone(true))}>{c.recent}</button>
      </>}
      {options && <form className="form" onSubmit={submit}>
        {showPassword && <div className="field"><label htmlFor="reauth-password">{c.password}</label>
          <input id="reauth-password" name="password" type="password" autoComplete="current-password" maxLength={128} required={!codeMethod && !methods.includes("recent")} />
        </div>}
        {showCode && <div className="field"><label htmlFor="reauth-code">{codeMethod === "totp" || options.withTotp ? c.totpCode : c.code}</label>
          <input id="reauth-code" className="code-input" name="code" autoComplete="one-time-code" maxLength={20} required={!showPassword || options.withTotp} />
        </div>}
        {note && <p className="small" role="status">{note}</p>}
        {error && <p className="notice error" role="alert">{error}</p>}
        <div className="hero-actions">
          <button className="button" type="submit" disabled={busy}>{busy ? c.checking : c.confirm}</button>
          <button className="button ghost" type="button" disabled={busy} onClick={() => onDone(false)}>{c.cancel}</button>
        </div>
      </form>}
      {(methods.includes("telegram") || methods.includes("phone") || methods.includes("email")) && <div className="hero-actions">
        {methods.includes("telegram") && <button className="button secondary" type="button" disabled={busy} onClick={() => void send("telegram")}>{c.sendTelegram}</button>}
        {methods.includes("phone") && <button className="button secondary" type="button" disabled={busy} onClick={() => void send("phone")}>{c.sendPhone}</button>}
        {methods.includes("email") && <button className="button secondary" type="button" disabled={busy} onClick={() => void send("email")}>{c.sendEmail}</button>}
      </div>}
      {options && !options.withTotp && methods[0] !== "totp" && <>
        <p className="small muted">{c.signInAgainHint}</p>
        <button className="button ghost" type="button" disabled={busy} onClick={() => void signInAgain()}>{c.signInAgain}</button>
      </>}
    </div>
  </SiteDialog>;
}

/**
 * Wraps a request that may answer "confirm it's you": the window opens, and after a confirmation the
 * request is sent once more. Use `dialog` somewhere in the component's output.
 */
export function useReauth(): { guarded: (request: () => Promise<Response>) => Promise<Response>; dialog: ReactNode } {
  const [pending, setPending] = useState<string | null>(null);
  const resolver = useRef<((confirmed: boolean) => void) | null>(null);
  const ask = useCallback((action: string) => new Promise<boolean>(resolve => { resolver.current = resolve; setPending(action); }), []);
  const guarded = useCallback(async (request: () => Promise<Response>) => {
    const response = await request();
    if (response.status !== 403) return response;
    const data = await response.clone().json().catch(() => ({}));
    if (data.code !== "REAUTH_REQUIRED" || typeof data.action !== "string") return response;
    return (await ask(data.action)) ? request() : response;
  }, [ask]);
  const dialog = pending ? <ReauthDialog action={pending} onDone={confirmed => { setPending(null); resolver.current?.(confirmed); resolver.current = null; }} /> : null;
  return { guarded, dialog };
}
