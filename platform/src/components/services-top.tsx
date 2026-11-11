"use client";

import Link from "next/link";
import { useSitePreferences } from "./site-preferences";
import { MainServiceCards } from "./home-content";
import { ServiceJourneys } from "./service-journeys";
import { homeCopy } from "@/lib/home-copy";
import type { HomeFacts } from "@/lib/home-facts";

/** The four main services and the surveillance calculator, in the home page's card and contact-box styles. */
export function ServicesTop({ facts }: { facts: HomeFacts }) {
  const { locale } = useSitePreferences();
  const h = homeCopy[locale];
  return <>
    <MainServiceCards facts={facts} />
    <div className="home-contact-section services-calculator"><div className="hub-contact">
      <div><span className="eyebrow">{h.calculate}</span><h2>{h.cctvTitle}</h2><p className="muted">{h.cctvText}</p></div>
      <div className="journey-actions"><Link className="button" href="/estimate?tab=cctv">{h.cctvCta}</Link></div>
    </div></div>
  </>;
}

/** The problem cards and FAQ; the price question is answered with "from" prices only when staff entered some. */
export function ServicesGuide({ facts }: { facts: HomeFacts }) {
  const { locale } = useSitePreferences();
  const faq = homeCopy[locale].priceFaq;
  const anyFrom = Object.values(facts.services).some(service => service.from);
  return <ServiceJourneys priceAnswer={[faq.calc, anyFrom ? faq.from : "", faq.final].filter(Boolean).join(" ")} />;
}
