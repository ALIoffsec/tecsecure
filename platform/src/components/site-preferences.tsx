"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Locale, MessageKey, messages } from "@/lib/messages";
import Link from "next/link";

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
const localeStorageKey = "tecsecure-locale";
const themeStorageKey = "tecsecure-theme";
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
    const savedLocale = cookiePreferences.locale ?? localStorage.getItem(localeStorageKey);
    if (savedLocale === "uz" || savedLocale === "ru" || savedLocale === "en") setLocaleState(savedLocale);

    const savedTheme = cookiePreferences.theme ?? localStorage.getItem(themeStorageKey);
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") setThemeState(savedTheme);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
    document.title = messages[locale].siteTitle;
    localStorage.setItem(localeStorageKey, locale);
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
    localStorage.setItem(themeStorageKey, theme);
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
    openCookieSettings: () => setCookieSettingsOpen(true),
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
  }

  return <PreferencesContext.Provider value={value}>
    {children}
    {(cookieConsent === null || cookieSettingsOpen) && (
      <aside className="cookie-consent" role="dialog" aria-modal="false" aria-labelledby="cookie-consent-title">
        <div>
          <strong id="cookie-consent-title">{messages[locale].cookieConsentTitle}</strong>
          <p>{messages[locale].cookieConsentDescription}</p>
        </div>
        <div className="cookie-consent-actions">
          <button className="button ghost" type="button" onClick={() => chooseCookieConsent("essential")}>{messages[locale].cookieEssentialOnly}</button>
          <button className="button" type="button" onClick={() => chooseCookieConsent("all")}>{messages[locale].cookieAcceptPreferences}</button>
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
  const { t, openCookieSettings } = useSitePreferences();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© {new Date().getFullYear()} Tecsecure</span>
        <span>{t("footerTagline")}</span>
        <div className="footer-legal-links">
          <Link href="/careers">{t("navCareers")}</Link>
          <Link href="/privacy">{t("privacyPolicy")}</Link>
          <Link href="/terms">{t("termsOfUse")}</Link>
          <button className="footer-cookie-settings" onClick={openCookieSettings} type="button">{t("cookieSettings")}</button>
        </div>
        <Link className="footer-staff-link" href="/staff/login">{t("staffLogin")}</Link>
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

export const preferenceBootstrapScript = `(()=>{const r=document.documentElement;try{const c=document.cookie.split("; ").find(x=>x.startsWith("${consentCookie}="))?.slice("${consentCookie}".length+1);const p=c==="all"?document.cookie.split("; ").find(x=>x.startsWith("${preferenceCookie}="))?.slice("${preferenceCookie}".length+1):null;const v=p?JSON.parse(decodeURIComponent(p)):{};const t=v.theme||localStorage.getItem("${themeStorageKey}")||"dark";const l=v.locale||localStorage.getItem("${localeStorageKey}")||"uz";const d=t==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;r.dataset.theme=d;r.style.colorScheme=d;r.lang=["uz","ru","en"].includes(l)?l:"uz"}catch{r.dataset.theme="dark";r.style.colorScheme="dark"}})()`;
