"use client";

import Link from "next/link";
import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";
import { MediaGallery } from "@/components/media-uploader";
import { HomeHeroAlbum } from "@/components/home-hero-album";

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
    <>
      <HomeHeroAlbum />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow">{t("aboutActivity")}</span><h2>{t("whatWeDoTitle")}</h2></div>
            <p>{t("whatWeDoDescription")}</p>
          </div>
          <div className="card-grid">
            <article className="card"><div className="card-icon" aria-hidden="true"><UiIcon name="network" /></div><h3>{t("networkTitle")}</h3><p>{t("networkDescription")}</p></article>
            <article className="card"><div className="card-icon" aria-hidden="true"><UiIcon name="shield" /></div><h3>{t("securityTitle")}</h3><p>{t("securityDescription")}</p></article>
            <article className="card"><div className="card-icon" aria-hidden="true"><UiIcon name="settings" /></div><h3>{t("supportTitle")}</h3><p>{t("supportDescription")}</p></article>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container intro-columns">
          <article className="intro-panel">
            <span className="eyebrow">{t("howWeWork")}</span>
            <h2>{t("clearProcessTitle")}</h2>
            <p className="muted">{t("clearProcessDescription")}</p>
          </article>
          <article className="intro-panel">
            <span className="eyebrow">{t("partnerships")}</span>
            <h2>{t("partnershipTitle")}</h2>
            <p className="muted">{t("partnershipDescription")}</p>
          </article>
          <article className="intro-panel">
            <span className="eyebrow">{t("outcomes")}</span>
            <h2>{t("outcomesTitle")}</h2>
            <p className="muted">{t("outcomesDescription")}</p>
          </article>
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
          <div className="contact-details">
            <div className="contact-detail">
              <span>{t("phoneNumbers")}</span>
              {phones.map((phone) => <a key={phone} href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a>)}
            </div>
            <div className="contact-detail">
              <span>{t("contactEmail")}</span>
              <a href={`mailto:${email}`}>{email}</a>
            </div>
            <div className="contact-detail">
              <span>{t("contactTelegram")}</span>
              <a href={`https://t.me/${telegram}`} target="_blank" rel="noreferrer">@{telegram}</a>
            </div>
            <div className="contact-detail">
              <span>{t("contactInstagram")}</span>
              <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer">@{instagram}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
