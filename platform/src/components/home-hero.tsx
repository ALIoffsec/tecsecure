"use client";

import Link from "next/link";
import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";

export function HomeHero() {
  const { t } = useSitePreferences();

  return (
    <section className="hero home-hero" aria-labelledby="home-hero-title">
      <div className="container home-hero-content">
        <div className="home-hero-copy">
          <span className="eyebrow">{t("heroEyebrow")}</span>
          <h1 id="home-hero-title">{t("introTitle")}</h1>
          <p className="lead">{t("introDescription")}</p>
          <div className="hero-actions home-hero-actions">
            <Link className="button" href="/contact">{t("requestCallback")}</Link>
            <Link className="button ghost" href="/services">{t("browseServices")}</Link>
          </div>
          <nav className="home-hero-shortcuts" aria-label={t("explorePlatform")}>
            <Link href="/learning">{t("navEducation")} <span aria-hidden="true">↗</span></Link>
            <Link href="/products">{t("productCatalog")} <span aria-hidden="true">↗</span></Link>
          </nav>
        </div>

        <aside className="home-hero-reasons" aria-labelledby="home-hero-reasons-title">
          <h2 id="home-hero-reasons-title">{t("heroWhyTitle")}</h2>
          <ul className="home-hero-reasons-list">
            <li>
              <span className="home-hero-reason-mark" aria-hidden="true"><UiIcon name="network" size={18} /></span>
              <div>
                <h3>{t("heroWhyIntegratedTitle")}</h3>
                <p className="sr-only">{t("heroWhyIntegratedDescription")}</p>
              </div>
            </li>
            <li>
              <span className="home-hero-reason-mark" aria-hidden="true"><UiIcon name="clipboard" size={18} /></span>
              <div>
                <h3>{t("heroWhyPlanTitle")}</h3>
                <p className="sr-only">{t("heroWhyPlanDescription")}</p>
              </div>
            </li>
            <li>
              <span className="home-hero-reason-mark" aria-hidden="true"><UiIcon name="users" size={18} /></span>
              <div>
                <h3>{t("heroWhyNoPressureTitle")}</h3>
                <p className="sr-only">{t("heroWhyNoPressureDescription")}</p>
              </div>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
