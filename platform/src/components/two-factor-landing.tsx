"use client";

import { useRouter } from "next/navigation";
import { TwoFactorStep } from "./two-factor";

export function TwoFactorLanding({ ticket }: { ticket: string }) {
  const router = useRouter();
  return <div className="container page-shell code-page">
    <section className="panel-card code-card">
      <TwoFactorStep ticket={ticket} onRestart={() => router.replace("/login")} onDone={next => { router.replace(next); router.refresh(); }} />
    </section>
  </div>;
}
