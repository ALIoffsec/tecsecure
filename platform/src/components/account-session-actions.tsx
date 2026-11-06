"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";
import { OriginalLogoutArt } from "./original-logout-art";
import { setLogoutPose, startLogoutMotion, type ButtonMotion } from "@/lib/button-motion";

export function AccountSessionActions({ compact = false, redirectTo = "/login" }: { compact?: boolean; redirectTo?: "/login" | "/staff/login" }) {
  const router = useRouter();
  const { t } = useSitePreferences();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const animation = useRef<ButtonMotion | null>(null);
  useEffect(() => () => animation.current?.cancel(), []);

  async function signOut() {
    if (busy) return;
    // The shorter "signing out" label must not pull the door out from under the walking figure.
    if (button.current) button.current.style.minWidth = `${button.current.offsetWidth}px`;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        setError(t("signOutFailed"));
        return;
      }
      if (button.current) {
        animation.current = startLogoutMotion(button.current);
        await animation.current.ready;
      }
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError(t("signOutFailed"));
    } finally {
      animation.current?.cancel();
      animation.current = null;
      button.current?.style.removeProperty("min-width");
      setBusy(false);
    }
  }

  return (
    <>
      <ToastMessage message={error} variant="error" />
      <button ref={button} className="original-logout" data-compact={compact} type="button" disabled={busy} aria-busy={busy} onClick={signOut} onMouseEnter={() => { if (!busy && button.current) setLogoutPose(button.current, "hover"); }} onMouseLeave={() => { if (!busy && button.current) setLogoutPose(button.current, "default"); }} title={t("logoutAccount")} aria-label={busy ? t("loggingOut") : t("logoutAccount")}>
        <OriginalLogoutArt />
        <span className="button-text">{busy ? t("loggingOut") : t("logoutAccount")}</span>
      </button>
    </>
  );
}
