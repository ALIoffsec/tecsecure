import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SEO_RU_BASE, SEO_UZ_BASE, seoPagesRu, seoPagesUz, type SeoPage } from "@/lib/seo-pages";
import { defaultContact } from "@/lib/site-contact";
import { siteOrigin } from "@/lib/site-origin";
import { SeoLocale } from "./growth-pages";

type Language = "uz" | "ru";
const pagesOf = (language: Language) => language === "uz" ? seoPagesUz : seoPagesRu;
const baseOf = (language: Language) => language === "uz" ? SEO_UZ_BASE : SEO_RU_BASE;
const otherOf = (language: Language): Language => language === "uz" ? "ru" : "uz";

export function seoMetadata(language: Language, slug: string): Metadata {
  const page = pagesOf(language).find(item => item.slug === slug);
  if (!page) return {};
  const here = `${baseOf(language)}/${page.slug}`;
  const there = `${baseOf(otherOf(language))}/${page.twin}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: here, languages: { [language]: here, [otherOf(language)]: there } },
    openGraph: { title: page.title, description: page.description, type: "website", locale: language === "uz" ? "uz_UZ" : "ru_RU", url: here }
  };
}

/** Rendered on the server in a fixed language, so search engines read the same words a visitor does. */
export function SeoLanding({ language, slug }: { language: Language; slug: string }) {
  const page: SeoPage | undefined = pagesOf(language).find(item => item.slug === slug);
  if (!page) notFound();
  const origin = siteOrigin();
  const structuredData = [
    { "@context": "https://schema.org", "@type": "Service", name: page.serviceName, description: page.description, areaServed: { "@type": "City", name: language === "uz" ? "Toshkent" : "Ташкент" }, provider: { "@type": "LocalBusiness", name: "Tecsecure", url: origin, telephone: defaultContact.phone, address: { "@type": "PostalAddress", addressLocality: language === "uz" ? "Toshkent" : "Ташкент", addressCountry: "UZ" } } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: page.faq.map(item => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) }
  ];
  const others = pagesOf(language).filter(item => item.slug !== slug);
  return <article className="container page-shell seo-landing" lang={language}>
    <SeoLocale language={language} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <span className="eyebrow">Tecsecure</span>
    <h1 className="page-title">{page.heading}</h1>
    <p className="page-intro">{page.intro}</p>
    <div className="hero-actions">
      <Link className="button" href={`/request-service?context=${encodeURIComponent(page.serviceName)}`}>{page.cta}</Link>
      <a className="button secondary" href={`tel:${defaultContact.phone}`}>{defaultContact.phone}</a>
    </div>
    <div className="seo-grid">
      <section className="panel-card"><h2>{page.includesTitle}</h2><ul>{page.includes.map(item => <li key={item}>{item}</li>)}</ul></section>
      <section className="panel-card"><h2>{page.stepsTitle}</h2><ol>{page.steps.map(item => <li key={item}>{item}</li>)}</ol></section>
    </div>
    <section className="seo-faq">
      <h2>{language === "uz" ? "Ko‘p beriladigan savollar" : "Частые вопросы"}</h2>
      {page.faq.map(item => <details className="panel-card" key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
    </section>
    <nav className="seo-others" aria-label={language === "uz" ? "Boshqa xizmatlar" : "Другие услуги"}>
      {others.map(item => <Link className="shop-chip" href={`${baseOf(language)}/${item.slug}`} key={item.slug}>{item.serviceName}</Link>)}
      <Link className="shop-chip" href={`${baseOf(otherOf(language))}/${page.twin}`} hrefLang={otherOf(language)}>{language === "uz" ? "Русский" : "O‘zbekcha"}</Link>
    </nav>
  </article>;
}
