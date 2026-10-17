"use client";

import Link from "next/link";
import { useState } from "react";
import { Locale } from "@/lib/messages";
import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon } from "@/components/ui-icon";

const locales: Locale[] = ["uz", "ru", "en"];
const themes = ["light", "dark", "system"] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const { locale, setLocale, theme, setTheme, t } = useSitePreferences();
  const nextLocale = locales[(locales.indexOf(locale) + 1) % locales.length];
  const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
  const themeIcon = theme === "light" ? "sun" : theme === "dark" ? "moon" : "monitor";
  const themeLabel = theme === "light" ? t("themeLight") : theme === "dark" ? t("themeDark") : t("themeSystem");

  return (
    <header className="site-nav">
      <nav className="container nav-inner" aria-label={t("navLabel")}>
        <Link className="brand" href="/" onClick={() => setOpen(false)}>
          <span className="brand-mark"><img src="/icon.ico" alt="" width="34" height="34" /></span>
          <span className="brand-word" aria-label="Tecsecure">
            {"Tecsecure".split("").map((letter, index) => (
              <span key={`${letter}-${index}`} aria-hidden="true" style={{ animationDelay: `${index * 35}ms` }}>{letter}</span>
            ))}
          </span>
        </Link>
        <button className="button ghost mobile-nav-toggle" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? t("close") : t("menu")}
        </button>
        <div className={`nav-links ${open ? "open" : ""}`}>
          <Link className="home-nav-button" href="/" aria-label={t("home")} title={t("home")} onClick={() => setOpen(false)}>
            <UiIcon name="home" />
          </Link>
          <div className="nav-group">
            <Link href="/services" onClick={() => setOpen(false)}>{t("navServices")}</Link>
            <div className="nav-submenu">
              <Link href="/services">{t("allServices")}</Link>
              <Link href="/cybersecurity">{t("cybersecurity")}</Link>
              <Link href="/monitoring">{t("monitoring")}</Link>
              <Link href="/consultation">{t("consultation")}</Link>
              <Link href="/contact">{t("contact")}</Link>
            </div>
          </div>
          <div className="nav-group">
            <Link href="/products" onClick={() => setOpen(false)}>{t("navMarket")}</Link>
            <div className="nav-submenu">
              <Link href="/products">{t("productCatalog")}</Link>
              <Link href="/request-quote">{t("requestProjectQuote")}</Link>
            </div>
          </div>
          <div className="nav-group">
            <Link href="/learning" onClick={() => setOpen(false)}>{t("navEducation")}</Link>
            <div className="nav-submenu">
              <Link href="/learning">{t("learning")}</Link>
              <Link href="/news">{t("news")}</Link>
            </div>
          </div>
          <div className="nav-utilities">
            <button
              className="preference-button locale-button"
              type="button"
              aria-label={`${t("language")}: ${locale.toUpperCase()}. ${t("switchLanguage")}`}
              title={`${t("switchLanguage")}: ${nextLocale.toUpperCase()}`}
              onClick={() => setLocale(nextLocale)}
            >
              {locale.toUpperCase()}
            </button>
            <button
              className="preference-button theme-button"
              type="button"
              aria-label={`${t("theme")}: ${themeLabel}. ${t("switchTheme")}`}
              title={`${t("switchTheme")}: ${nextTheme === "light" ? t("themeLight") : nextTheme === "dark" ? t("themeDark") : t("themeSystem")}`}
              onClick={() => setTheme(nextTheme)}
            >
              <UiIcon name={themeIcon} />
            </button>
            <Link className="account-button" href="/portal/profile" aria-label={t("profile")} title={t("profile")} onClick={() => setOpen(false)}>
              <UiIcon name="user" />
              <span>{t("profile")}</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
