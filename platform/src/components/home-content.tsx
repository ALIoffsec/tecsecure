"use client";

import Link from "next/link";
import { useSitePreferences } from "./site-preferences";
import { HomeHero } from "./home-hero";
import { WorkCarousel } from "./work-carousel";
import { UiIcon } from "./ui-icon";
import { useLearningCatalog } from "./learning-catalog-context";
import { ModuleCard } from "./learning-catalog";
import { ProductCard } from "./product-card";
import { ShowcaseCarousel } from "./showcase-carousel";
import { BrandMarquee } from "./brand-marquee";
import type { PartnerBrands } from "@/lib/partner-brands";
import { journeyCopy } from "@/lib/journey-copy";
import { defaultContact } from "@/lib/site-contact";
import { homeCopy } from "@/lib/home-copy";
import { mainServices, type HomeFacts } from "@/lib/home-facts";
import { serviceGuideCopy } from "@/lib/service-journeys";
import type { ProductCardData } from "@/lib/product-listing";

const serviceIcons = ["camera", "network", "shield", "toolbox"] as const;

/** What staff entered for one service, as label/value rows; empty values are left out. */
export function serviceFactRows(facts: HomeFacts["services"][keyof HomeFacts["services"]], labels: { price: string; from: string; duration: string; warranty: string }, locale: string): [string, string][] {
  const from = facts.from ? (locale === "uz" ? `${facts.from} ${labels.from}` : `${labels.from} ${facts.from}`) : "";
  return ([[labels.price, from], [labels.duration, facts.duration], [labels.warranty, facts.warranty]] as [string, string][]).filter(([, value]) => value);
}

/** The four main services as the same 01–04 cards the home page uses for its three directions. */
export function MainServiceCards({ facts, carousel = false }: { facts: HomeFacts; carousel?: boolean }) {
  const { locale } = useSitePreferences();
  const h = homeCopy[locale];
  const cards = mainServices[locale].map((service, index) => {
      const rows = serviceFactRows(facts.services[service.id], h, locale);
      return <Link className="hub-path hub-path-services" href={service.href} key={service.id}>
        <div className="hub-path-top"><span className="hub-icon"><UiIcon name={serviceIcons[index]} size={28} /></span><span className="hub-number">0{index + 1}</span></div>
        <h3>{service.title}</h3><strong>{service.hook}</strong>
        <p>{service.includes.join(" · ")}</p>
        {rows.length > 0 && <p className="hub-path-facts">{rows.map(([label, value]) => <span key={label}>{label}: <b>{value}</b></span>)}</p>}
        <span className="hub-path-action">{h.more}<span aria-hidden="true">→</span></span>
      </Link>;
    });
  return carousel
    ? <ShowcaseCarousel kind="services" label={h.servicesTitle}>{cards}</ShowcaseCarousel>
    : <nav className="hub-paths hub-paths-four" aria-label={h.servicesTitle}>{cards}</nav>;
}

export function HomeContent({ contact, work, products, facts, brands }: {
  contact: Record<string, string>;
  work: { id: string; title: string; description: string; media: unknown }[];
  products: ProductCardData[];
  facts: HomeFacts;
  brands: PartnerBrands;
}) {
  const { locale, t } = useSitePreferences();
  const c = journeyCopy[locale];
  const h = homeCopy[locale];
  const catalog = useLearningCatalog();
  const phone = (contact.phone || defaultContact.phone).split(/[\n,;|]+/)[0].trim();
  const modules = catalog.modules;
  const lessonTotal = modules.reduce((total, module) => total + module.sections.length, 0);
  const featuredCourses = [...modules].sort((a, b) => Number(b.modulePriceTec === 0) - Number(a.modulePriceTec === 0)).slice(0, 8);
  const trust = ([[facts.trust.projects, h.projects], [facts.trust.years, h.years], [facts.trust.clients, h.clients], [facts.trust.warranty, h.warrantyLabel]] as [string, string][]).filter(([value]) => value);
  return <div className="home-page">
    <HomeHero />

    <section className="section home-main-services"><div className="container">
      <div className="section-head"><div><span className="eyebrow">{c.services}</span><h2>{h.servicesTitle}</h2></div><p>{h.servicesNote}</p></div>
      <MainServiceCards facts={facts} carousel />
    </div></section>

    {featuredCourses.length > 0 && <section className="section home-academy"><div className="container">
      <div className="section-head"><div><span className="eyebrow">{h.academyTitle}</span><h2>{modules.length} {h.courses} · {lessonTotal} {h.lessons}</h2></div><p>{h.academyNote}</p></div>
      <ShowcaseCarousel kind="courses" label={h.academyTitle}>{featuredCourses.map(module => <ModuleCard key={module.slug} module={module} percent={0} />)}</ShowcaseCarousel>
      <p className="home-more-link"><Link className="text-link" href="/learning">{h.allCourses} →</Link></p>
    </div></section>}

    {products.length > 0 && <section className="section home-shop"><div className="container">
      <div className="section-head"><div><span className="eyebrow">{c.shop}</span><h2>{h.shopTitle}</h2></div><p>{h.shopNote}</p></div>
      <ShowcaseCarousel kind="products" label={h.shopTitle}>{products.map(({ assets, ...product }) => <ProductCard key={product.id} product={product} assets={assets} />)}</ShowcaseCarousel>
      <p className="home-more-link"><Link className="text-link" href="/products">{h.allProducts} →</Link></p>
    </div></section>}

    <section className="section home-how"><div className="container">
      <div className="section-head"><div><span className="eyebrow">Tecsecure</span><h2>{h.howTitle}</h2></div></div>
      <ol className="journey-steps">{serviceGuideCopy[locale].steps.map((step, index) => <li key={step}><span>0{index + 1}</span><strong>{step}</strong></li>)}</ol>
    </div></section>

    {work.length > 0 && <section className="section home-portfolio"><div className="container">
      <div className="section-head"><div><span className="eyebrow">{c.portfolioEyebrow}</span><h2>{t("sitePortfolioTitle")}</h2></div><p>{c.portfolioNote}</p></div>
      <WorkCarousel posts={work} showLink />
    </div></section>}

    {trust.length > 0 && <section className="section home-trust"><div className="container">
      <div className="section-head"><div><span className="eyebrow">Tecsecure</span><h2>{h.trustTitle}</h2></div></div>
      <div className="hub-paths">{trust.map(([value, label]) => <div className="hub-path home-trust-card" key={label}><strong className="home-trust-value">{value}</strong><p>{label}</p></div>)}</div>
    </div></section>}

    <BrandMarquee brands={brands} />
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
