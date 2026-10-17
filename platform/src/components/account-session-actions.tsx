"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";

export function AccountSessionActions() {
  const router = useRouter();
  const { t } = useSitePreferences();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        setError(t("signOutFailed"));
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch {
      setError(t("signOutFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {error && <div className="notice error" role="alert">{error}</div>}
      <button className="button secondary" type="button" disabled={busy} onClick={signOut}>
        {busy ? t("loggingOut") : t("logoutAccount")}
      </button>
    </>
  );
}
