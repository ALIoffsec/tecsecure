"use client";

import { useEffect, useState } from "react";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";

export function AdminSecurityBoundary() {
  const [error, setError] = useState("");
  const { t } = useSitePreferences();

  useEffect(() => {
    let leaving = false;
    const lockAccess = () => {
      if (leaving) return;
      leaving = true;
      if (!navigator.sendBeacon("/api/admin/exit", new Blob([""], { type: "text/plain" }))) {
        void fetch("/api/admin/exit", { method: "POST", keepalive: true });
      }
    };
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const target = new URL(anchor.href, window.location.href);
      if (target.origin !== window.location.origin || target.pathname.startsWith("/admin")) return;
      event.preventDefault();
      if (leaving) return;
      leaving = true;
      void fetch("/api/admin/exit", { method: "POST", keepalive: true })
        .then((response) => {
          if (!response.ok) throw new Error("Admin access could not be locked");
          window.location.assign(target.href);
        })
        .catch(() => {
          leaving = false;
          setError(t("adminExitFailed"));
        });
    };
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    document.addEventListener("click", handleClick, true);
    window.addEventListener("pagehide", lockAccess);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("pagehide", lockAccess);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [t]);

  return <ToastMessage message={error} variant="error" />;
}
