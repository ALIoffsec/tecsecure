"use client";

import Link from "next/link";
import { useSitePreferences } from "./site-preferences";
import { UiIcon } from "./ui-icon";
import { serviceFactRows } from "./home-content";
import { homeCopy } from "@/lib/home-copy";
import { mainServices, type HomeFacts } from "@/lib/home-facts";

/** The services page opens with the four main services and the surveillance calculator. */
export function ServicesTop({ facts }: { facts: HomeFacts }) {
  const { locale } = useSitePreferences();
  const c = homeCopy[locale];
  return <>
    <div className="home-service-grid services-main">
      {mainServices[locale].map(service => {
        const rows = serviceFactRows(facts.services[service.id], c, locale);
        return <article className="home-service-card" key={service.id}>
          <h2>{service.title}</h2>
          <p className="muted">{service.hook}</p>
          <ul>{service.includes.map(item => <li key={item}>{item}</li>)}</ul>
          {rows.length > 0 && <dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
          <Link className="button" href={service.href}>{c.more}<span aria-hidden="true">→</span></Link>
        </article>;
      })}
    </div>
    <section className="services-calculator" aria-labelledby="services-calculator-title">
      <span className="services-calculator-icon" aria-hidden="true"><UiIcon name="camera" size={30} /></span>
      <div>
        <h2 id="services-calculator-title">{c.cctvTitle}</h2>
        <p className="muted">{c.cctvText}</p>
      </div>
      <Link className="button" href="/estimate?tab=cctv">{c.cctvCta}<span aria-hidden="true">→</span></Link>
    </section>
  </>;
}

/** The price question answered straight, mentioning "from" prices only when staff have entered some. */
export function priceAnswer(facts: HomeFacts, locale: keyof typeof homeCopy): string {
  const faq = homeCopy[locale].priceFaq;
  const anyFrom = Object.values(facts.services).some(service => service.from);
  return [faq.calc, anyFrom ? faq.from : "", faq.final].filter(Boolean).join(" ");
}
