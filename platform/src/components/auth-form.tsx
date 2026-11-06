"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useSitePreferences } from "./site-preferences";
import { ToastMessage } from "./toast-provider";
import { OAuthSignIn } from "./oauth-sign-in";
import { featureCopy } from "@/lib/feature-copy";
import { growthCopy } from "@/lib/growth-copy";

type Mode = "login" | "register";
type Props = { mode: Mode; audience?: "customer" | "staff"; redirectTo?: string };

export function AuthForm({ mode, audience = "customer", redirectTo }: Props) {
  const router = useRouter();
  const { t, locale } = useSitePreferences();
  const c = featureCopy[locale];
  const g = growthCopy[locale].auth;
  const [active, setActive] = useState<Mode>(mode);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const sync = () => { if (audience === "customer") { setActive(location.pathname === "/register" ? "register" : "login"); setError(""); } };
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [audience]);

  function switchMode(next: Mode) {
    if (busy || next === active || audience === "staff") return;
    setError("");
    setActive(next);
    window.history.pushState(null, "", `/${next}${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""}`);
    requestAnimationFrame(() => root.current?.querySelector<HTMLInputElement>(`[data-kind="${next}"] input`)?.focus({ preventScroll: true }));
  }

  async function submit(event: FormEvent<HTMLFormElement>, kind: Mode) {
    event.preventDefault();
    if (busy || kind !== active) return;
    setError(""); setBusy(true);
    const data = { ...Object.fromEntries(new FormData(event.currentTarget)), audience };
    try {
      const response = await fetch(`/api/auth/${kind}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? t("requestFailed")); return; }
      router.replace(audience === "staff" ? "/admin" : redirectTo ?? "/portal");
      router.refresh();
    } catch { setError(t("serverUnavailable")); }
    finally { setBusy(false); }
  }

  return <section ref={root} className="original-auth" data-mode={active} data-audience={audience}>
    <div className="curved-shape" aria-hidden="true" /><div className="curved-shape2" aria-hidden="true" />
    <div className="original-auth-forms">
      {(["login", "register"] as const).filter(kind => audience === "customer" || kind === "login").map(kind => {
        const selected = kind === active;
        return <div className="original-auth-panel" data-kind={kind} key={kind} inert={!selected} aria-hidden={!selected}>
          <span className="eyebrow animation">{audience === "staff" ? t("staffLogin") : kind === "login" ? t("loginEyebrow") : t("registerEyebrow")}</span>
          <h1 className="animation">{audience === "staff" ? t("staffLoginTitle") : kind === "login" ? t("loginTitle") : t("registerTitle")}</h1>
          <form onSubmit={event => void submit(event, kind)}>
            <fieldset disabled={busy || !selected}>
              {kind === "register" && <div className="input-box animation"><input id={`${kind}-name`} name="name" autoComplete="name" minLength={2} maxLength={100} placeholder=" " required /><label htmlFor={`${kind}-name`}>{t("name")}</label></div>}
              <div className="input-box animation"><input id={`${kind}-email`} name="email" type="email" autoComplete="email" maxLength={254} placeholder=" " required /><label htmlFor={`${kind}-email`}>{t("email")}</label></div>
              <div className="input-box animation"><input id={`${kind}-password`} name="password" type="password" autoComplete={kind === "login" ? "current-password" : "new-password"} minLength={kind === "register" ? 8 : 1} maxLength={128} placeholder=" " required /><label htmlFor={`${kind}-password`}>{t("password")}</label></div>
              {kind === "register" && <p className="small animation">{t("minimum8Characters")}</p>}
              <button className="auth-submit animation" type="submit">{busy ? t("waiting") : kind === "login" ? t("signIn") : t("createAccountButton")}</button>
            </fieldset>
          </form>
          {audience === "customer" && <>
            {kind === "login" && <p className="auth-alt-links animation"><Link href="/login/reset">{g.forgot}</Link><Link href="/login/code">{g.phoneLogin}</Link></p>}
            <p className="regi-link animation">{kind === "login" ? t("noAccount") : t("alreadyHaveAccount")} <button type="button" disabled={busy} onClick={() => switchMode(kind === "login" ? "register" : "login")}>{kind === "login" ? t("registerLink") : t("signIn")}</button></p>
            {selected && <OAuthSignIn mode={kind} redirectTo={redirectTo} />}
          </>}
        </div>;
      })}
      <aside className="original-auth-info" aria-hidden="true">
        <strong>{audience === "staff" ? t("staffLogin") : active === "login" ? c.welcome : c.join}</strong>
        <p>{audience === "staff" ? c.staffNote : c.accountNote}</p>
      </aside>
    </div>
    <ToastMessage message={error} variant="error" />
  </section>;
}
