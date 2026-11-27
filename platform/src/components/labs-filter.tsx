"use client";

import Link from "next/link";
import { useSitePreferences } from "./site-preferences";

const words = {
  uz: { label: "Laboratoriya turi", labs: "Lab vazifalari", practice: "Amaliyot", ctf: "CTF" },
  ru: { label: "Тип лаборатории", labs: "Лабораторные задания", practice: "Практика", ctf: "CTF" },
  en: { label: "Lab type", labs: "Lab tasks", practice: "Practice", ctf: "CTF" }
} as const;

/** The filter inside Labs: lab tasks, practice and CTF, as links (so each view has its own address). */
export function LabsFilter({ current }: { current: "labs" | "practice" | "ctf" }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  return <nav className="learn-filter" aria-label={w.label}>
    {(["labs", "practice", "ctf"] as const).map(view => <Link key={view} className={`shop-chip${current === view ? " is-active" : ""}`} href={view === "labs" ? "/learning/labs" : `/learning/labs?tur=${view}`} aria-current={current === view ? "true" : undefined}>{w[view]}</Link>)}
  </nav>;
}
