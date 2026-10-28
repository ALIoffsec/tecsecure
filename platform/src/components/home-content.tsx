"use client";

import Link from "next/link";
import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";
import { MediaGallery } from "@/components/media-uploader";
import { HomeHero } from "@/components/home-hero";

const fallbackPhones = ["+998200141455", "+998990782102", "+998931970006"];
const partnerBrands = [
  { name: "Cisco", logo: "/brands/cisco.svg" },
  { name: "MikroTik", logo: "/brands/mikrotik.svg" },
  { name: "TP-Link", logo: "/brands/tplink.svg" },
  { name: "Cudy", logo: "/brands/cudy.png" },
  { name: "Ubiquiti", logo: "/brands/ubiquiti.svg" },
  { name: "Juniper", logo: "/brands/juniper.svg" },
  { name: "D-Link", logo: "/brands/dlink.png" },
  { name: "Hikvision", logo: "/brands/hikvision.png" },
  { name: "Zyxel", logo: "/brands/zyxel.png" },
  { name: "Huawei", logo: "/brands/huawei.svg" },
  { name: "Grandstream", logo: "/brands/grandstream.png" },
  { name: "Tenda", logo: "/brands/tenda.png" },
  { name: "ASUS", logo: "/brands/asus.svg" }
];

export function HomeContent({ contact, work }: { contact: Record<string, string>; work: { id: string; title: string; description: string; media: unknown }[] }) {
  const { t } = useSitePreferences();
  const phones = (contact.phone || fallbackPhones.join("\n"))
    .split(/[\n,;|]+/)
    .map((phone) => phone.trim())
    .filter(Boolean);
  const email = contact.email || "itstars134567890@gmail.com";
  const telegram = (contact.telegram || "@abdiazizov_m_ali").replace(/^@/, "");
  const instagram = (contact.instagram || "@abdiazizov_m_ali").replace(/^@/, "");
  return (
    <div className="home-page">
      <HomeHero />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow">{t("aboutActivity")}</span><h2>{t("whatWeDoTitle")}</h2></div>
            <p>{t("whatWeDoDescription")}</p>
          </div>
          <div className="card-grid">
            <article className="card home-service-card"><div className="card-icon" aria-hidden="true"><UiIcon name="network" /></div><h3>{t("networkTitle")}</h3><p>{t("networkDescription")}</p><Link className="home-card-action" href="/services">{t("homeCardServicesAction")} <span aria-hidden="true">→</span></Link></article>
            <article className="card home-service-card"><div className="card-icon" aria-hidden="true"><UiIcon name="shield" /></div><h3>{t("securityTitle")}</h3><p>{t("securityDescription")}</p><Link className="home-card-action" href="/services">{t("homeCardServicesAction")} <span aria-hidden="true">→</span></Link></article>
            <article className="card home-service-card"><div className="card-icon" aria-hidden="true"><UiIcon name="settings" /></div><h3>{t("supportTitle")}</h3><p>{t("supportDescription")}</p><Link className="home-card-action" href="/learning">{t("homeCardLearningAction")} <span aria-hidden="true">→</span></Link></article>
          </div>
        </div>
      </section>

      <section className="section home-resource-section">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow">{t("homeExploreEyebrow")}</span><h2>{t("chooseDirectionTitle")}</h2></div>
            <p>{t("chooseDirectionDescription")}</p>
          </div>
          <div className="home-resource-grid">
            <article className="panel-card home-resource-card">
              <span className="home-resource-kicker">01 · {t("navEducation")}</span>
              <h3>{t("homeLearningResourceTitle")}</h3>
              <p>{t("homeLearningResourceDescription")}</p>
              <Link className="home-card-action" href="/learning">{t("homeLearningResourceAction")} <span aria-hidden="true">→</span></Link>
            </article>
            <article className="panel-card home-resource-card">
              <span className="home-resource-kicker">02 · {t("productCatalog")}</span>
              <h3>{t("homeProductsResourceTitle")}</h3>
              <p>{t("homeProductsResourceDescription")}</p>
              <Link className="home-card-action" href="/products">{t("homeProductsResourceAction")} <span aria-hidden="true">→</span></Link>
            </article>
            <article className="panel-card home-resource-card">
              <span className="home-resource-kicker">03 · {t("cctvCalculator")}</span>
              <h3>{t("homeToolResourceTitle")}</h3>
              <p>{t("homeToolResourceDescription")}</p>
              <Link className="home-card-action" href="/monitoring">{t("homeToolResourceAction")} <span aria-hidden="true">→</span></Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="intro-columns">
            <article className="intro-panel">
              <span className="eyebrow">{t("howWeWork")}</span>
              <h2>{t("clearProcessTitle")}</h2>
              <p className="muted">{t("clearProcessDescription")}</p>
              <Link className="home-card-action" href="/request-quote">{t("requestAQuote")} <span aria-hidden="true">→</span></Link>
            </article>
            <article className="intro-panel">
              <span className="eyebrow">{t("partnerships")}</span>
              <h2>{t("partnershipTitle")}</h2>
              <p className="muted">{t("partnershipDescription")}</p>
              <Link className="home-card-action" href="/consultation">{t("discussTechnicalNeeds")} <span aria-hidden="true">→</span></Link>
            </article>
            <article className="intro-panel">
              <span className="eyebrow">{t("outcomes")}</span>
              <h2>{t("outcomesTitle")}</h2>
              <p className="muted">{t("outcomesDescription")}</p>
              <Link className="home-card-action" href="/login">{t("signIn")} <span aria-hidden="true">→</span></Link>
            </article>
          </div>
          <aside className="home-account-panel">
            <div>
              <span className="eyebrow">{t("homeAccountEyebrow")}</span>
              <h2>{t("homeAccountTitle")}</h2>
              <p>{t("homeAccountDescription")}</p>
            </div>
            <div className="home-account-actions">
              <Link className="button" href="/register">{t("createAccountButton")}</Link>
              <Link className="button ghost" href="/login">{t("signIn")}</Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="brand-strip" aria-label={t("brandTickerTitle")}>
        <div className="container brand-strip-heading">
          <span className="eyebrow">{t("brandTickerTitle")}</span>
          <span className="small muted">{t("brandTickerNote")}</span>
        </div>
        <div className="brand-marquee">
          <div className="brand-track" role="list">
            {[...partnerBrands, ...partnerBrands].map((brand, index) => (
              <div className="brand-tile" aria-hidden={index >= partnerBrands.length} role="listitem" key={`${brand.name}-${index}`}>
                <img src={brand.logo} alt="" width="112" height="48" />
                <strong>{brand.name}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head"><div><span className="eyebrow">{t("sitePortfolioTitle")}</span><h2>{t("sitePortfolioTitle")}</h2></div></div>
          {work.length ? <div className="portfolio-grid">{work.map((item) => <article className="panel-card portfolio-public-card" key={item.id}><h3>{item.title}</h3><p>{item.description}</p><MediaGallery media={item.media} title={item.title} marquee /></article>)}</div> : <p className="muted">{t("sitePortfolioEmpty")}</p>}
        </div>
      </section>

      <section className="contact-hero" id="contact">
        <div className="container contact-panel">
          <div className="contact-brand">
            <span className="eyebrow">{t("quickContactEyebrow")}</span>
            <h2>{t("quickContactTitle")}</h2>
            <h3 className="contact-ready-title">{t("contactReadyTitle")}</h3>
            <p className="lead">{t("contactReadyDescription")}</p>
            <div className="hero-actions contact-actions">
              <Link className="button" href="/contact">{t("requestCallback")}</Link>
              <Link className="button ghost" href="/request-quote">{t("requestAQuote")}</Link>
            </div>
          </div>
          <nav className="contact-details" aria-label={t("quickContactTitle")}>
            <div className="contact-icon-group" role="group" aria-label={t("phoneNumbers")}>
              {phones.map((phone) => (
                <a className="contact-icon-link" key={phone} href={`tel:${phone.replace(/[^\d+]/g, "")}`} aria-label={`${t("phoneNumbers")}: ${phone}`} title={`${t("phoneNumbers")}: ${phone}`}>
                  <UiIcon name="phone" />
                  <span className="sr-only">{phone}</span>
                </a>
              ))}
            </div>
            <a className="contact-icon-link" href={`mailto:${email}`} aria-label={`${t("contactEmail")}: ${email}`} title={`${t("contactEmail")}: ${email}`}>
              <UiIcon name="mail" />
              <span className="sr-only">{email}</span>
            </a>
            <a className="contact-icon-link" href={`https://t.me/${telegram}`} target="_blank" rel="noreferrer" aria-label={`${t("contactTelegram")}: @${telegram}`} title={`${t("contactTelegram")}: @${telegram}`}>
              <UiIcon name="send" />
              <span className="sr-only">@{telegram}</span>
            </a>
            <a className="contact-icon-link" href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer" aria-label={`${t("contactInstagram")}: @${instagram}`} title={`${t("contactInstagram")}: @${instagram}`}>
              <UiIcon name="instagram" />
              <span className="sr-only">@{instagram}</span>
            </a>
          </nav>
        </div>
      </section>
    </div>
  );
}
