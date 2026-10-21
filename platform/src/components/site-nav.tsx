"use client";

import Link from "next/link";
import { useState } from "react";
import { Locale } from "@/lib/messages";
import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";

const locales: Locale[] = ["uz", "ru", "en"];
const themes = ["light", "dark", "system"] as const;
type NavGroup = "services" | "market" | "education";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<NavGroup | null>(null);
  const { locale, setLocale, theme, setTheme, t } = useSitePreferences();
  const nextLocale = locales[(locales.indexOf(locale) + 1) % locales.length];
  const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
  const themeIcon = theme === "light" ? "sun" : theme === "dark" ? "moon" : "monitor";
  const themeLabel = theme === "light" ? t("themeLight") : theme === "dark" ? t("themeDark") : t("themeSystem");

  function closeMenu() {
    setOpen(false);
    setOpenGroup(null);
  }

  function toggleGroup(group: NavGroup) {
    setOpenGroup((current) => current === group ? null : group);
  }

  return (
    <header className="site-nav">
      <nav className="container nav-inner" aria-label={t("navLabel")}>
        <Link className="brand" href="/" onClick={closeMenu}>
          <span className="brand-mark"><img src="/icon.ico" alt="" width="34" height="34" /></span>
          <span className="brand-word" aria-label="Tecsecure">
            {"Tecsecure".split("").map((letter, index) => (
              <span key={`${letter}-${index}`} aria-hidden="true" style={{ animationDelay: `${index * 35}ms` }}>{letter}</span>
            ))}
          </span>
        </Link>
        <button
          className={`mobile-nav-toggle${open ? " open" : ""}`}
          type="button"
          aria-label={open ? t("close") : t("menu")}
          aria-expanded={open}
          aria-controls="site-navigation"
          onClick={() => open ? closeMenu() : setOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className={`nav-links ${open ? "open" : ""}`} id="site-navigation">
          <Link className="home-nav-button" href="/" aria-label={t("home")} title={t("home")} onClick={closeMenu}>
            <UiIcon name="home" />
          </Link>
          <div className={`nav-group${openGroup === "services" ? " is-open" : ""}`}>
            <div className="nav-group-trigger">
              <Link href="/services" onClick={closeMenu}>{t("navServices")}</Link>
              <button className="nav-group-toggle" type="button" aria-label={t("navServices")} aria-expanded={openGroup === "services"} aria-controls="services-submenu" onClick={() => toggleGroup("services")} />
            </div>
            <div className="nav-submenu" id="services-submenu">
              <Link href="/services" onClick={closeMenu}>{t("allServices")}</Link>
              <Link href="/cybersecurity" onClick={closeMenu}>{t("cybersecurity")}</Link>
              <Link href="/monitoring" onClick={closeMenu}>{t("monitoring")}</Link>
              <Link href="/consultation" onClick={closeMenu}>{t("consultation")}</Link>
              <Link href="/contact" onClick={closeMenu}>{t("contact")}</Link>
            </div>
          </div>
          <div className={`nav-group${openGroup === "market" ? " is-open" : ""}`}>
            <div className="nav-group-trigger">
              <Link href="/products" onClick={closeMenu}>{t("navMarket")}</Link>
              <button className="nav-group-toggle" type="button" aria-label={t("navMarket")} aria-expanded={openGroup === "market"} aria-controls="market-submenu" onClick={() => toggleGroup("market")} />
            </div>
            <div className="nav-submenu" id="market-submenu">
              <Link href="/products" onClick={closeMenu}>{t("productCatalog")}</Link>
              <Link href="/request-quote" onClick={closeMenu}>{t("requestProjectQuote")}</Link>
            </div>
          </div>
          <div className={`nav-group${openGroup === "education" ? " is-open" : ""}`}>
            <div className="nav-group-trigger">
              <Link href="/learning" onClick={closeMenu}>{t("navEducation")}</Link>
              <button className="nav-group-toggle" type="button" aria-label={t("navEducation")} aria-expanded={openGroup === "education"} aria-controls="education-submenu" onClick={() => toggleGroup("education")} />
            </div>
            <div className="nav-submenu" id="education-submenu">
              <Link href="/learning" onClick={closeMenu}>{t("learning")}</Link>
              <Link href="/learning/dashboard" onClick={closeMenu}>{t("learningDashboard")}</Link>
              <Link href="/store" onClick={closeMenu}>{t("learningStore")}</Link>
              <Link href="/news" onClick={closeMenu}>{t("news")}</Link>
            </div>
          </div>
          <div className="nav-utilities">
            <button
              className="preference-button locale-button"
              type="button"
              aria-label={`${t("language")}: ${locale.toUpperCase()}. ${t("switchLanguage")}`}
              title={`${t("switchLanguage")}: ${nextLocale.toUpperCase()}`}
              onClick={() => { setLocale(nextLocale); closeMenu(); }}
            >
              {locale.toUpperCase()}
            </button>
            <button
              className="preference-button theme-button"
              type="button"
              aria-label={`${t("theme")}: ${themeLabel}. ${t("switchTheme")}`}
              title={`${t("switchTheme")}: ${nextTheme === "light" ? t("themeLight") : nextTheme === "dark" ? t("themeDark") : t("themeSystem")}`}
              onClick={() => { setTheme(nextTheme); closeMenu(); }}
            >
              <UiIcon name={themeIcon} />
            </button>
            <Link className="account-button" href="/portal/profile" aria-label={t("profile")} title={t("profile")} onClick={closeMenu}>
              <UiIcon name="user" />
              <span>{t("profile")}</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
