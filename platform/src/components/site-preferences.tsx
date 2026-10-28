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
  t: (key: MessageKey) => string;
};

const PreferencesContext = createContext<Preferences | null>(null);
const localeStorageKey = "tecsecure-locale";
const themeStorageKey = "tecsecure-theme";

export function SitePreferencesProvider({ children, overrides = {} }: { children: ReactNode; overrides?: TextOverrides }) {
  const [locale, setLocaleState] = useState<Locale>("uz");
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedLocale = localStorage.getItem(localeStorageKey);
    if (savedLocale === "uz" || savedLocale === "ru" || savedLocale === "en") setLocaleState(savedLocale);

    const savedTheme = localStorage.getItem(themeStorageKey);
    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") setThemeState(savedTheme);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
    document.title = messages[locale].siteTitle;
    localStorage.setItem(localeStorageKey, locale);
  }, [locale, ready]);

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
    return () => media.removeEventListener("change", applyTheme);
  }, [theme, ready]);

  const value = useMemo<Preferences>(() => ({
    locale,
    theme,
    setLocale: setLocaleState,
    setTheme: setThemeState,
    t: (key) => overrides[locale]?.[key] ?? messages[locale][key]
  }), [locale, theme, overrides]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function useSitePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("useSitePreferences must be used within SitePreferencesProvider");
  return value;
}

export function SiteFooter() {
  const { t } = useSitePreferences();
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© {new Date().getFullYear()} Tecsecure</span>
        <span>{t("footerTagline")}</span>
        <div className="footer-legal-links">
          <Link href="/careers">{t("navCareers")}</Link>
          <Link href="/privacy">{t("privacyPolicy")}</Link>
          <Link href="/terms">{t("termsOfUse")}</Link>
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

export const preferenceBootstrapScript = `(()=>{const r=document.documentElement;try{const t=localStorage.getItem("${themeStorageKey}")||"dark";const l=localStorage.getItem("${localeStorageKey}")||"uz";const d=t==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;r.dataset.theme=d;r.style.colorScheme=d;r.lang=["uz","ru","en"].includes(l)?l:"uz"}catch{r.dataset.theme="dark";r.style.colorScheme="dark"}})()`;
