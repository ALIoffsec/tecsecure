"use client";

import Link from "next/link";
import { useSitePreferences } from "./site-preferences";
import { journeyCopy, inquiryHref } from "@/lib/journey-copy";
import { serviceJourneys, serviceGuideCopy } from "@/lib/service-journeys";
import { mainServices, type MainServiceId } from "@/lib/home-facts";
import type { ReactNode } from "react";

/** Which main service each problem card leads to; the others stay a plain inquiry. */
const needService: Record<string, MainServiceId> = { cctv: "cctv", wifi: "network", office: "network", support: "support" };

export function ServiceJourneys({ priceAnswer }: { priceAnswer?: string } = {}) {
  const { locale, t } = useSitePreferences();
  const c = journeyCopy[locale];
  const guide = serviceGuideCopy[locale];
  const faq = guide.faq.map(([q, a], index) => [q, index === 0 && priceAnswer ? priceAnswer : a] as const);
  return <section className="service-journeys" id="needs">
    <h2>{guide.title}</h2><p className="page-intro">{guide.intro}</p>
    <div className="need-grid">
      {serviceJourneys[locale].map(item => <details className="need-card" key={item.id} id={`need-${item.id}`}>
        <summary><span><strong>{item.title}</strong><span>{item.summary}</span></span><span className="need-plus" aria-hidden="true">+</span></summary>
        <div className="need-body">
          <dl>{[[guide.scope, item.scope], [guide.result, item.result], [guide.factors, item.factors], [guide.prepare, item.prepare]].map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl>
          <p className="small muted">{guide.exclusions}</p>
          {(() => {
            const service = needService[item.id] && mainServices[locale].find(entry => entry.id === needService[item.id]);
            return service
              ? <div className="journey-actions"><Link className="button" href={service.href}>{service.title}</Link><Link className="text-link" href={inquiryHref(item.title)}>{c.discuss}</Link></div>
              : <Link className="button" href={inquiryHref(item.title)}>{c.discuss}</Link>;
          })()}
        </div>
      </details>)}
    </div>
    <ol className="journey-steps">{guide.steps.map((step, index) => <li key={step}><span>0{index + 1}</span><strong>{step}</strong></li>)}</ol>
    <p className="muted">{guide.after}</p>
    <div className="journey-faq"><h2>{c.faq}</h2>{faq.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
    <div className="journey-actions">
      <Link href="/products" className="button secondary">{c.shopAction}</Link>
      <Link href="/learning" className="button secondary">{c.learningLink}</Link>
      <Link href="/estimate" className="text-link">{t("cctvCalculator")}</Link>
      <Link href="/cybersecurity" className="text-link">{t("cybersecurity")}</Link>
      <Link href="/consultation" className="text-link">{t("consultation")}</Link>
    </div>
  </section>;
}

export function TechnicalServices({ children }: { children: ReactNode }) {
  const { locale } = useSitePreferences();
  return <details className="technical-services"><summary>{locale === "uz" ? "Texnik yo‘nalishlar va xizmatlarning to‘liq ro‘yxati" : locale === "ru" ? "Полный список технических направлений и услуг" : "Full technical scope and service list"}</summary>{children}</details>;
}
