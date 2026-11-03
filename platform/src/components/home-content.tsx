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
    <section className="section">
      <div className="container">
        <div className="section-head"><div><span className="eyebrow">{c.explore}</span><h2>{c.helpTitle}</h2></div><p>{c.helpText}</p></div>
        <div className="journey-grid">
          {[
            { title: c.serviceSample, text: c.serviceExample, action: c.serviceLine, href: "/services#needs" },
            { title: c.learningSample, text: c.learningExample, action: c.learningLine, href: "/learning#start" },
            { title: c.shopSample, text: c.shopExample, action: c.shopLine, href: "/products" },
          ].map(item => <article className="panel-card journey-card" key={item.href}><h3>{item.title}</h3><p className="muted">{item.text}</p><Link className="text-link" href={item.href}>{item.action} →</Link></article>)}
        </div>
      </div>
    </section>
    <section className="section alt">
      <div className="container">
        <h2>{c.trustTitle}</h2>
        <div className="journey-grid">
          {[[c.services, c.trustService], [c.learning, c.trustLearning], [c.shop, c.trustShop]].map(([title, text]) => <article key={title}><h3>{title}</h3><p className="muted">{text}</p></article>)}
        </div>
        <div className="hub-account panel-card">
          <div><h2>{c.accountTitle}</h2><p className="muted">{c.accountNote}</p></div>
          <nav className="journey-actions" aria-label={c.account}>
            <Link className="button secondary" href="/portal/requests">{c.requests}</Link>
            <Link className="button secondary" href="/learning/dashboard">{c.studies}</Link>
            <Link className="button secondary" href="/portal/orders">{c.orders}</Link>
          </nav>
        </div>
      </div>
    </section>
    {work.length > 0 && <section className="section"><div className="container">
      <div className="section-head"><h2>{t("sitePortfolioTitle")}</h2><p>{c.portfolioNote}</p></div>
      <div className="portfolio-grid">{work.map(item => <article className="panel-card portfolio-public-card" key={item.id}>
        <h3>{item.title}</h3><p>{item.description}</p><MediaGallery media={item.media} title={item.title} marquee />
      </article>)}</div>
    </div></section>}
    <section className="section hub-brands"><div className="container">
      <h2>{c.equipmentBrands}</h2><p className="small muted">{c.brandNote}</p>
      <ul>{brands.map(brand => <li key={brand}>{brand}</li>)}</ul>
    </div></section>
    <section className="section alt"><div className="container hub-contact">
      <div><h2>{c.contactTitle}</h2><p className="muted">{c.contactText}</p></div>
      <div className="journey-actions">
        <Link className="button" href="/contact?mode=callback">{c.callback}</Link>
        <a className="button secondary" href={`tel:${phone.replace(/[^\d+]/g, "")}`}><UiIcon name="phone" />{phone}</a>
        <Link className="text-link" href="/terms">{c.terms}</Link>
      </div>
    </div></section>
  </div>;
}
