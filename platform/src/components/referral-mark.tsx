"use client";

import { useEffect } from "react";

/** Tells the server, once per visit, that this shop's page brought the visitor (for the shop's lower commission). */
export function ReferralMark({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `tec-ref-${slug}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, "1"); } catch { /* private mode: mark anyway */ }
    void fetch("/api/ref", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) }).catch(() => undefined);
  }, [slug]);
  return null;
}
