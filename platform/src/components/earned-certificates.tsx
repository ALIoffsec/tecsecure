"use client";

import Link from "next/link";
import { useSitePreferences } from "./site-preferences";
import { formatDate } from "@/lib/format";

const words = {
  uz: { title: "Mening sertifikatlarim", verify: "Tekshirish sahifasi", score: "ball" },
  ru: { title: "Мои сертификаты", verify: "Страница проверки", score: "балл" },
  en: { title: "My certificates", verify: "Verification page", score: "score" }
} as const;

/** The learner's own certificates, each with its public verification page. */
export function EarnedCertificates({ certificates }: { certificates: { code: string; examSlug: string; scorePercent: number; issuedAt: string; title: string | null }[] }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  return <section className="panel-card learn-earned" aria-labelledby="earned-title">
    <h2 id="earned-title">{w.title}</h2>
    <ul className="list">{certificates.map(item => <li className="list-row" key={item.code}>
      <span><strong>{item.title ?? item.examSlug}</strong><small className="muted"> · {item.scorePercent}% · {formatDate(item.issuedAt)}</small></span>
      <Link className="text-link" href={`/verify/${item.code}`}>{w.verify}<span className="sr-only"> · {item.code}</span></Link>
    </li>)}</ul>
  </section>;
}
