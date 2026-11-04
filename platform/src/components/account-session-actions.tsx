"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";
import { LogoutFigure } from "./feature-visuals";

export function AccountSessionActions({ compact = false, redirectTo = "/login" }: { compact?: boolean; redirectTo?: "/login" | "/staff/login" }) {
  const router = useRouter();
  const { t } = useSitePreferences();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signOut() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        setError(t("signOutFailed"));
        return;
      }
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError(t("signOutFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <ToastMessage message={error} variant="error" />
      <button className={`${compact ? "icon-button" : "button secondary"} feature-logout`} type="button" disabled={busy} aria-busy={busy} onClick={signOut} title={t("logoutAccount")} aria-label={compact ? t("logoutAccount") : undefined}>
        <LogoutFigure />
        {!compact && <span>{busy ? t("loggingOut") : t("logoutAccount")}</span>}
      </button>
    </>
  );
}
