"use client";

import Link from "next/link";
import { useSitePreferences } from "./site-preferences";
import { HomeHero } from "./home-hero";
import { MediaGallery } from "./media-uploader";
import { UiIcon } from "./ui-icon";
import { journeyCopy } from "@/lib/journey-copy";

const brands = ["Cisco", "MikroTik", "TP-Link", "Ubiquiti", "Hikvision", "Huawei"];

export function HomeContent({ contact, work }: { contact: Record<string, string>; work: { id: string; title: string; description: string; media: unknown }[] }) {
  const { locale, t } = useSitePreferences();
  const c = journeyCopy[locale];
  const phone = (contact.phone || "+998200141455").split(/[\n,;|]+/)[0].trim();
  return <div className="home-page">
    <HomeHero />
    {work.length > 0 && <section className="section home-portfolio"><div className="container">
      <div className="section-head"><div><span className="eyebrow">{c.portfolioEyebrow}</span><h2>{t("sitePortfolioTitle")}</h2></div><p>{c.portfolioNote}</p></div>
      <div className="portfolio-grid">{work.map(item => <article className="panel-card portfolio-public-card" key={item.id}>
        <div className="portfolio-story"><h3>{item.title}</h3><p>{item.description}</p></div><MediaGallery media={item.media} title={item.title} marquee />
      </article>)}</div>
    </div></section>}
    <section className="section hub-brands"><div className="container">
      <h2>{c.equipmentBrands}</h2><p className="small muted">{c.brandNote}</p>
      <ul>{brands.map(brand => <li key={brand}>{brand}</li>)}</ul>
    </div></section>
    <section className="section home-contact-section"><div className="container"><div className="hub-contact">
      <div><span className="eyebrow">TECSECURE / {c.details}</span><h2>{c.contactTitle}</h2><p className="muted">{c.contactText}</p></div>
      <div className="journey-actions">
        <Link className="button" href="/contact?mode=callback">{c.callback}</Link>
        <a className="button secondary" href={`tel:${phone.replace(/[^\d+]/g, "")}`}><UiIcon name="phone" />{phone}</a>
        <Link className="text-link" href="/terms">{c.terms}</Link>
      </div>
    </div></div></section>
  </div>;
}
