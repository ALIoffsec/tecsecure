"use client";

import { useRouter } from "next/navigation";
import { TwoFactorStep } from "./two-factor";
import { safeNext } from "@/lib/safe-next";

export function TwoFactorLanding({ ticket }: { ticket: string }) {
  const router = useRouter();
  return <div className="container page-shell code-page">
    <section className="panel-card code-card">
      <TwoFactorStep ticket={ticket} onRestart={() => router.replace("/login")} onDone={next => { router.replace(safeNext(next, "/portal")); router.refresh(); }} />
    </section>
  </div>;
}
