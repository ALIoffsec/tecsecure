"use client";

import Link from "next/link";
import { useSitePreferences } from "./site-preferences";
import { WorkCarousel } from "./work-carousel";
import { UiIcon } from "./ui-icon";
import { useLearningCatalog } from "./learning-catalog-context";
import { LearningCardArt } from "./learning-card-art";
import { ServiceRequestForm } from "./service-request-form";
import { homeCopy } from "@/lib/home-copy";
import { mainServices, type HomeFacts } from "@/lib/home-facts";
import { serviceGuideCopy } from "@/lib/service-journeys";
import { defaultContact } from "@/lib/site-contact";
import { formatMinor } from "@/lib/format";

const brands = ["Cisco", "MikroTik", "TP-Link", "Ubiquiti", "Hikvision", "Huawei"];
const FREE_COURSE = "linux-fundamentals";

export type HomeProduct = { id: string; name: string; slug: string; priceMinor: number; currency: string; imageId: string | null };

/** The figures staff entered for one service, as label/value pairs; empty ones are left out. */
export function serviceFactRows(facts: HomeFacts["services"][keyof HomeFacts["services"]], labels: { price: string; from: string; duration: string; warranty: string }, locale: string) {
  const from = facts.from ? (locale === "uz" ? `${facts.from} ${labels.from}` : `${labels.from} ${facts.from}`) : "";
  return [[labels.price, from], [labels.duration, facts.duration], [labels.warranty, facts.warranty]].filter(([, value]) => value) as [string, string][];
}

export function HomeContent({ contact, work, workPhoto, products, facts }: {
  contact: Record<string, string>;
  work: { id: string; title: string; description: string; media: unknown }[];
  workPhoto: { id: string; title: string } | null;
  products: HomeProduct[];
  facts: HomeFacts;
}) {
  const { locale } = useSitePreferences();
  const c = homeCopy[locale];
  const catalog = useLearningCatalog();
  const services = mainServices[locale];
  const steps = serviceGuideCopy[locale].steps;
  const phone = (contact.phone || defaultContact.phone).split(/[\n,;|]+/)[0].trim();
  const telegram = (contact.telegram || defaultContact.telegram).replace(/^@/, "");

  const modules = catalog.modules;
  const lessonTotal = modules.reduce((total, module) => total + module.sections.length, 0);
  const freeCourse = modules.find(module => module.slug === FREE_COURSE) ?? modules.find(module => module.modulePriceTec === 0) ?? null;
  const featuredCourses = [...modules].sort((a, b) => Number(b.modulePriceTec === 0) - Number(a.modulePriceTec === 0)).slice(0, 3);
  const calculateHref = "/estimate?tab=cctv";
  const inspectHref = `/contact?mode=callback&topic=${encodeURIComponent(c.inspectTopic)}`;

  const trust = [
    [facts.trust.projects, c.projects], [facts.trust.years, c.years], [facts.trust.clients, c.clients], [facts.trust.warranty, c.warrantyLabel]
  ].filter(([value]) => value) as [string, string][];

  return <div className="home-page home-v2">
    <section className="home-intro" aria-labelledby="home-title">
      <div className="container">
        <div className="home-intro-copy">
          <span className="eyebrow">{c.eyebrow}</span>
          <h1 id="home-title">{c.title}</h1>
          <p className="lead">{c.lead}</p>
          <div className="home-intro-actions">
            <Link className="button" href={inspectHref}>{c.inspect}</Link>
            <Link className="button secondary" href={calculateHref}>{c.calculate}</Link>
          </div>
        </div>

        <div className="home-doors">
          <article className="home-door is-services">
            <span className="home-door-label"><UiIcon name="toolbox" size={18} />{c.doors.services.label}</span>
            <h2>{c.doors.services.hook}</h2>
            <div className="home-door-proof">
              {workPhoto
                ? <figure><img src={`/api/media/${workPhoto.id}`} alt={workPhoto.title} loading="eager" decoding="async" /><figcaption>{workPhoto.title}</figcaption></figure>
                : <p className="home-door-note">{c.doors.services.proofEmpty}</p>}
            </div>
            <Link className="button home-door-cta" href={calculateHref}>{c.doors.services.cta}<span aria-hidden="true">→</span></Link>
          </article>

          <article className="home-door is-academy">
            <span className="home-door-label"><UiIcon name="book" size={18} />{c.doors.academy.label}</span>
            <h2>{c.doors.academy.hook}</h2>
            <div className="home-door-proof">
              {freeCourse
                ? <Link className="home-door-course" href={`/learning/${freeCourse.slug}`}>
                    <LearningCardArt category={freeCourse.category} slug={freeCourse.slug} title={freeCourse.title[locale]} />
                    <span><strong>{freeCourse.title[locale]}</strong> · {freeCourse.sections.length} {c.doors.academy.lessons}{freeCourse.modulePriceTec === 0 ? ` · ${c.doors.academy.free}` : ""}</span>
                  </Link>
                : <p className="home-door-note">{c.academyNote}</p>}
            </div>
            <Link className="button home-door-cta" href={freeCourse ? `/learning/${freeCourse.slug}` : "/learning"}>{c.doors.academy.cta}<span aria-hidden="true">→</span></Link>
          </article>

          <article className="home-door is-shop">
            <span className="home-door-label"><UiIcon name="box" size={18} />{c.doors.shop.label}</span>
            <h2>{c.doors.shop.hook}</h2>
            <div className="home-door-proof">
              {products.length
                ? <ul className="home-door-products">{products.slice(0, 3).map(product => <li key={product.id}><Link href={`/products/${product.slug}`}>
                    <span className="home-door-thumb">{product.imageId ? <img src={`/api/media/${product.imageId}`} alt="" loading="lazy" decoding="async" /> : <UiIcon name="box" size={20} />}</span>
                    <span className="home-door-product-name">{product.name}</span>
                    <strong>{formatMinor(product.priceMinor, product.currency, locale)}</strong>
                  </Link></li>)}</ul>
                : <p className="home-door-note">{c.doors.shop.empty}</p>}
            </div>
            <Link className="button home-door-cta" href="/products">{c.doors.shop.cta}<span aria-hidden="true">→</span></Link>
          </article>
        </div>
      </div>
    </section>

    <section className="section home-block">
      <div className="container">
        <div className="section-head"><div><span className="eyebrow">{c.doors.services.label}</span><h2>{c.servicesTitle}</h2></div><p>{c.servicesNote}</p></div>
        <div className="home-service-grid">
          {services.map(service => {
            const rows = serviceFactRows(facts.services[service.id], c, locale);
            return <Link className="home-service-card" href={service.href} key={service.id}>
              <h3>{service.title}</h3>
              <p className="muted">{service.hook}</p>
              <ul>{service.includes.map(item => <li key={item}>{item}</li>)}</ul>
              {rows.length > 0 && <dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
              <span className="home-card-more">{c.more}<span aria-hidden="true">→</span></span>
            </Link>;
          })}
        </div>
      </div>
    </section>

    {featuredCourses.length > 0 && <section className="section home-block">
      <div className="container">
        <div className="section-head"><div><span className="eyebrow">{c.academyTitle}</span><h2>{modules.length} {c.courses} · {lessonTotal} {c.lessons}</h2></div><p>{c.academyNote}</p></div>
        <div className="home-course-grid">
          {featuredCourses.map(module => <Link className="home-course-card" href={`/learning/${module.slug}`} key={module.slug}>
            <LearningCardArt category={module.category} slug={module.slug} title={module.title[locale]} />
            <h3>{module.title[locale]}</h3>
            <p className="small muted">{module.sections.length} {c.lessons}{module.hours ? ` · ${module.hours} ${c.hours}` : ""}{module.modulePriceTec === 0 ? ` · ${c.free}` : ""}</p>
          </Link>)}
        </div>
        <Link className="text-link" href="/learning">{c.allCourses} →</Link>
      </div>
    </section>}

    {products.length > 0 && <section className="section home-block">
      <div className="container">
        <div className="section-head"><div><span className="eyebrow">{c.doors.shop.label}</span><h2>{c.shopTitle}</h2></div><p>{c.shopNote}</p></div>
        <div className="home-product-grid">
          {products.map(product => <Link className="home-product-card" href={`/products/${product.slug}`} key={product.id}>
            <span className="home-product-image">{product.imageId ? <img src={`/api/media/${product.imageId}`} alt="" loading="lazy" decoding="async" /> : <UiIcon name="box" size={32} />}</span>
            <span className="home-product-name">{product.name}</span>
            <strong>{formatMinor(product.priceMinor, product.currency, locale)}</strong>
          </Link>)}
        </div>
        <Link className="text-link" href="/products">{c.allProducts} →</Link>
      </div>
    </section>}

    <section className="section home-block">
      <div className="container">
        <h2>{c.howTitle}</h2>
        <ol className="home-steps">{steps.map((step, index) => <li key={step}><span>{index + 1}</span><strong>{step}</strong></li>)}</ol>
      </div>
    </section>

    {work.length > 0 && <section className="section home-portfolio"><div className="container">
      <div className="section-head"><div><h2>{c.workTitle}</h2></div></div>
      <WorkCarousel posts={work} showLink />
    </div></section>}

    {trust.length > 0 && <section className="section home-block">
      <div className="container">
        <h2>{c.trustTitle}</h2>
        <dl className="home-trust">{trust.map(([value, label]) => <div key={label}><dt>{value}</dt><dd>{label}</dd></div>)}</dl>
      </div>
    </section>}

    <section className="section home-contact-section"><div className="container"><div className="home-contact">
      <div>
        <h2>{c.contactTitle}</h2>
        <p className="muted">{c.contactText}</p>
        <div className="home-contact-links">
          <a className="button secondary" href={`tel:${phone.replace(/[^\d+]/g, "")}`}><UiIcon name="phone" />{phone}</a>
          <a className="button secondary" href={`https://t.me/${telegram}`} target="_blank" rel="noreferrer"><UiIcon name="send" />Telegram</a>
        </div>
      </div>
      <ServiceRequestForm services={[]} initialMode="callback" />
    </div></div></section>

    <section className="section home-brands"><div className="container">
      <h2>{c.brandsTitle}</h2><p className="small muted">{c.brandsNote}</p>
      <ul>{brands.map(brand => <li key={brand}>{brand}</li>)}</ul>
    </div></section>
  </div>;
}
