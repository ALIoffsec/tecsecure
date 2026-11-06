"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Locale, MessageKey, messages } from "@/lib/messages";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { journeyCopy } from "@/lib/journey-copy";
import { FooterGlow } from "./feature-visuals";
import { siteCopy } from "@/lib/site-copy";
import { featureCopy } from "@/lib/feature-copy";

type ThemeMode = "light" | "dark" | "system";
type TextOverrides = Partial<Record<Locale, Partial<Record<MessageKey, string>>>>;
type Preferences = {
  locale: Locale;
  theme: ThemeMode;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeMode) => void;
  openCookieSettings: () => void;
  t: (key: MessageKey) => string;
};

const PreferencesContext = createContext<Preferences | null>(null);
const consentCookie = "tecsecure-cookie-consent";
const preferenceCookie = "tecsecure-preferences";
type CookieConsent = "essential" | "all";

function readCookie(name: string) {
  return document.cookie.split("; ").find((cookie) => cookie.startsWith(`${name}=`))?.slice(name.length + 1);
}

function writeCookie(name: string, value: string, maxAge = 31536000) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function SitePreferencesProvider({ children, overrides = {} }: { children: ReactNode; overrides?: TextOverrides }) {
  const [locale, setLocaleState] = useState<Locale>("uz");
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [ready, setReady] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<CookieConsent | null>(null);
  const [cookieSettingsOpen, setCookieSettingsOpen] = useState(false);
  const [cookieDetails, setCookieDetails] = useState(false);
  const [rememberChoice, setRememberChoice] = useState(true);

  useEffect(() => {
    const storedConsent = readCookie(consentCookie);
    const consent = storedConsent === "essential" || storedConsent === "all" ? storedConsent : null;
    setCookieConsent(consent);
    if (consent !== "all" && readCookie(preferenceCookie)) writeCookie(preferenceCookie, "", 0);
    const preferenceValue = consent === "all" ? readCookie(preferenceCookie) : null;
    let cookiePreferences: Partial<{ locale: Locale; theme: ThemeMode }> = {};
    if (preferenceValue) {
      try {
        cookiePreferences = JSON.parse(decodeURIComponent(preferenceValue)) as typeof cookiePreferences;
      } catch {
        cookiePreferences = {};
      }
    }
    const savedLocale = cookiePreferences.locale;
    if (savedLocale === "uz" || savedLocale === "ru" || savedLocale === "en") setLocaleState(savedLocale);

    const savedTheme = cookiePreferences.theme;
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") setThemeState(savedTheme);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
    if (cookieConsent === "all") {
      writeCookie(preferenceCookie, encodeURIComponent(JSON.stringify({ locale, theme })));
    }
  }, [locale, theme, ready, cookieConsent]);

  useEffect(() => {
    if (!ready) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const resolved = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
    };
    applyTheme();
    media.addEventListener("change", applyTheme);
    if (cookieConsent === "all") {
      writeCookie(preferenceCookie, encodeURIComponent(JSON.stringify({ locale, theme })));
    }
    return () => media.removeEventListener("change", applyTheme);
  }, [theme, locale, ready, cookieConsent]);

  const value = useMemo<Preferences>(() => ({
    locale,
    theme,
    setLocale: setLocaleState,
    setTheme: setThemeState,
    openCookieSettings: () => { setCookieDetails(true); setRememberChoice(readCookie(consentCookie) !== "essential"); setCookieSettingsOpen(true); },
    t: (key) => overrides[locale]?.[key] ?? messages[locale][key]
  }), [locale, theme, overrides]);

  function chooseCookieConsent(consent: CookieConsent) {
    setCookieConsent(consent);
    writeCookie(consentCookie, consent);
    if (consent === "all") {
      writeCookie(preferenceCookie, encodeURIComponent(JSON.stringify({ locale, theme })));
    } else {
      writeCookie(preferenceCookie, "", 0);
    }
    setCookieSettingsOpen(false);
    setCookieDetails(false);
  }

  const cookie = siteCopy[locale].cookie;
  return <PreferencesContext.Provider value={value}>
    {children}
    {(cookieConsent === null || cookieSettingsOpen) && (
      <aside className="cookie-consent" role="dialog" aria-modal="false" aria-labelledby="cookie-consent-title" data-details={cookieDetails}>
        <div className="cookie-consent-head">
          <strong id="cookie-consent-title">{cookie.title}</strong>
          {cookieSettingsOpen && <button className="cookie-consent-close" type="button" aria-label={cookie.close} onClick={() => { setCookieSettingsOpen(false); setCookieDetails(false); }}>×</button>}
        </div>
        <p>{cookie.text}</p>
        {cookieDetails && <div className="cookie-options">
          <div className="cookie-option">
            <div><strong>{cookie.necessary}</strong><span>{cookie.necessaryHint}</span></div>
            <span className="cookie-always">{cookie.always}</span>
          </div>
          <label className="cookie-option">
            <div><strong>{cookie.preferences}</strong><span>{cookie.preferencesHint}</span></div>
            <input className="switch" type="checkbox" role="switch" checked={rememberChoice} onChange={event => setRememberChoice(event.target.checked)} />
          </label>
          <p className="cookie-note">{cookie.none} <Link href="/privacy">{cookie.privacy}</Link></p>
        </div>}
        <div className="cookie-consent-actions">
          {cookieDetails
            ? <button className="button" type="button" onClick={() => chooseCookieConsent(rememberChoice ? "all" : "essential")}>{cookie.save}</button>
            : <>
              <button className="button" type="button" onClick={() => chooseCookieConsent("all")}>{cookie.acceptAll}</button>
              <button className="button ghost" type="button" onClick={() => chooseCookieConsent("essential")}>{cookie.essential}</button>
              <button className="cookie-customize" type="button" onClick={() => setCookieDetails(true)}>{cookie.customize}</button>
            </>}
        </div>
      </aside>
    )}
  </PreferencesContext.Provider>;
}

export function useSitePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("useSitePreferences must be used within SitePreferencesProvider");
  return value;
}

export function SiteFooter() {
  const { t, locale, openCookieSettings } = useSitePreferences();
  const c = journeyCopy[locale];
  const f = featureCopy[locale];
  const pathname = usePathname();
  // Inside the site the page should feel like an app: only the home page carries a full footer.
  // The water stays everywhere; only the columns of links belong to the home page.
  if (pathname !== "/") return (
    <footer className="footer feature-footer feature-footer-compact">
      <FooterGlow />
      <div className="feature-footer-body"><div className="container footer-compact-line">© {new Date().getFullYear()} Tecsecure</div></div>
    </footer>
  );
  return (
    <footer className="footer feature-footer">
      <FooterGlow />
      <div className="feature-footer-body">
        <div className="container footer-columns">
          <div className="footer-brand"><strong>Tecsecure</strong><span>{t("footerTagline")}</span></div>
          <nav aria-label={f.footerExplore}>
            <h2>{f.footerExplore}</h2>
            <Link href="/services">{c.services}</Link><Link href="/learning">{c.learning}</Link><Link href="/products">{c.shop}</Link><Link href="/work">{t("sitePortfolioTitle")}</Link>
          </nav>
          <nav aria-label={f.footerHelp}>
            <h2>{f.footerHelp}</h2>
            <Link href="/contact">{t("contact")}</Link><Link href="/terms">{c.delivery}</Link><Link href="/search">{c.search}</Link>
            <button className="footer-cookie-settings" onClick={openCookieSettings} type="button">{t("cookieSettings")}</button>
          </nav>
          <nav aria-label={f.footerCompany}>
            <h2>{f.footerCompany}</h2>
            <Link href="/careers">{t("navCareers")}</Link><Link href="/privacy">{t("privacyPolicy")}</Link><Link href="/terms">{t("termsOfUse")}</Link><Link href="/staff/login">{t("staffLogin")}</Link>
          </nav>
        </div>
        <div className="container footer-inner">
          <span>© {new Date().getFullYear()} Tecsecure</span>
        </div>
      </div>
    </footer>
  );
}

export function LocalizedText({ id }: { id: MessageKey }) {
  const { t } = useSitePreferences();
  return <>{t(id)}</>;
}

export function CookieSettingsButton() {
  const { t, openCookieSettings } = useSitePreferences();
  return <button className="button ghost" type="button" onClick={openCookieSettings}>{t("cookieSettings")}</button>;
}

export const preferenceBootstrapScript = `(()=>{const r=document.documentElement;try{if(localStorage.getItem("tecsecure-motion")==="off")r.dataset.motion="off"}catch{}try{const c=document.cookie.split("; ").find(x=>x.startsWith("${consentCookie}="))?.slice("${consentCookie}".length+1);const p=c==="all"?document.cookie.split("; ").find(x=>x.startsWith("${preferenceCookie}="))?.slice("${preferenceCookie}".length+1):null;const v=p?JSON.parse(decodeURIComponent(p)):{};const t=v.theme||"dark";const l=v.locale||"uz";const d=t==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;r.dataset.theme=d;r.style.colorScheme=d;r.lang=["uz","ru","en"].includes(l)?l:"uz"}catch{r.dataset.theme="dark";r.style.colorScheme="dark"}})()`;
