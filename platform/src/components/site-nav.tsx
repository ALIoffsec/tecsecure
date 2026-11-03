"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { useSitePreferences } from "./site-preferences";
import { UiIcon } from "./ui-icon";
import { useCart } from "./cart";
import { journeyCopy } from "@/lib/journey-copy";
import type { Locale } from "@/lib/messages";
import { AppInstallButton } from "./app-install-button";

export function SiteNav() {
  const { locale, setLocale, theme, setTheme, t } = useSitePreferences();
  const c = journeyCopy[locale];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const count = useCart().reduce((sum, line) => sum + line.quantity, 0);
  const entries = [
    { href: "/services", title: c.services, active: ["/services", "/contact", "/request-service", "/request-quote", "/consultation", "/cybersecurity", "/monitoring"] },
    { href: "/learning", title: c.learning, active: ["/learning", "/store"] },
    { href: "/products", title: c.shop, active: ["/products", "/cart"] },
  ];
  return <header className="portal-nav" onKeyDown={event => {
    if (event.key === "Escape" && open) { setOpen(false); toggle.current?.focus(); }
  }}>
    <a className="skip-link" href="#main-content">{locale === "uz" ? "Asosiy mazmunga o‘tish" : locale === "ru" ? "К содержимому" : "Skip to content"}</a>
    <div className="container portal-nav-inner">
      <Link className="portal-brand" href="/" onClick={() => setOpen(false)}><img src="/icon.ico" width="32" height="32" alt="" />Tecsecure</Link>
      <nav className="portal-primary" aria-label={t("navLabel")}>
        {entries.map(item => <Link href={item.href} key={item.href} onClick={() => setOpen(false)} aria-current={item.active.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`)) ? "page" : undefined}>{item.title}</Link>)}
      </nav>
      <div className="portal-tools">
        <Link className="portal-icon-link" href="/search" aria-label={c.search} title={c.search}><span aria-hidden="true">⌕</span></Link>
        <Link className="portal-icon-link" href="/cart" aria-label={`${c.cart}${count ? `: ${count}` : ""}`} title={c.cart}><UiIcon name="box" />{count > 0 && <span className="portal-count">{count}</span>}</Link>
        <Link className="portal-account" href="/portal/profile" aria-label={c.account}><UiIcon name="user" /><span>{c.account}</span></Link>
        <button ref={toggle} type="button" className="portal-icon-link" aria-expanded={open} aria-controls="portal-menu" aria-label={open ? c.close : t("menu")} onClick={() => setOpen(value => !value)}><UiIcon name={open ? "layout" : "settings"} /></button>
      </div>
      {open && <div className="portal-menu" id="portal-menu">
        <label>{t("language")}<select value={locale} onChange={event => setLocale(event.target.value as Locale)}><option value="uz">O‘zbekcha</option><option value="ru">Русский</option><option value="en">English</option></select></label>
        <button className="button secondary" type="button" onClick={() => setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark")}><UiIcon name={theme === "dark" ? "moon" : theme === "light" ? "sun" : "monitor"} />{theme === "dark" ? t("themeDark") : theme === "light" ? t("themeLight") : t("themeSystem")}</button>
        <Link href="/contact" onClick={() => setOpen(false)}>{t("contact")}</Link>
        <Link href="/store" onClick={() => setOpen(false)}>{t("learningStore")}</Link>
        <Link href="/about" onClick={() => setOpen(false)}>{t("aboutActivity")}</Link>
        <Link href="/careers" onClick={() => setOpen(false)}>{t("navCareers")}</Link>
        <Link href="/news" onClick={() => setOpen(false)}>{t("news")}</Link>
        <AppInstallButton />
      </div>}
    </div>
  </header>;
}
