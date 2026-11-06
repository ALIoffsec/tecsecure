"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSitePreferences } from "./site-preferences";
import { UiIcon, type IconName } from "./ui-icon";
import { useCart } from "./cart";
import { siteCopy } from "@/lib/site-copy";
import type { Locale } from "@/lib/messages";
import { AppInstallButton } from "./app-install-button";

const languages: { id: Locale; label: string }[] = [{ id: "uz", label: "O‘zbekcha" }, { id: "ru", label: "Русский" }, { id: "en", label: "English" }];

function isActive(pathname: string, prefixes: string[]) {
  return prefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** Hides on the way down and returns on the first move up, without reacting to tiny scroll jitter. */
function useHideOnScroll(locked: boolean) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - last;
      if (Math.abs(delta) < 6) return;
      setHidden(delta > 0 && y > 96);
      last = y;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, []);
  return hidden && !locked;
}

export function SiteNav() {
  const { locale, setLocale, theme, setTheme } = useSitePreferences();
  const c = siteCopy[locale];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef(0);
  const count = useCart().reduce((sum, line) => sum + line.quantity, 0);
  const hidden = useHideOnScroll(open || mega !== null);

  useEffect(() => { setOpen(false); setMega(null); }, [pathname]);

  // The dock would ride on top of the on-screen keyboard, so it steps aside while someone types.
  useEffect(() => {
    const isField = (target: EventTarget | null) => target instanceof HTMLElement && target.matches("input:not([type=checkbox]):not([type=radio]):not([type=file]), textarea, select");
    const onIn = (event: FocusEvent) => { if (isField(event.target)) setTyping(true); };
    const onOut = (event: FocusEvent) => { if (isField(event.target)) setTyping(false); };
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => { document.removeEventListener("focusin", onIn); document.removeEventListener("focusout", onOut); };
  }, []);

  useEffect(() => {
    if (!open) return;
    document.documentElement.dataset.sheetOpen = "";
    return () => { delete document.documentElement.dataset.sheetOpen; };
  }, [open]);

  const primary = [
    { key: "services", group: c.menu.services, active: ["/services", "/contact", "/request-service", "/request-quote", "/consultation", "/cybersecurity", "/monitoring"] },
    { key: "learning", group: c.menu.learning, active: ["/learning", "/store"] },
    { key: "shop", group: c.menu.shop, active: ["/products", "/cart"] }
  ];
  const dock: { href: string; title: string; icon: IconName; active: string[]; badge?: number }[] = [
    { href: "/", title: c.nav.home, icon: "home", active: [] },
    { href: "/services", title: c.menu.services.title, icon: "toolbox", active: primary[0].active },
    { href: "/learning", title: c.menu.learning.title, icon: "book", active: primary[1].active },
    { href: "/products", title: c.menu.shop.title, icon: "box", active: primary[2].active },
    { href: "/portal/profile", title: c.nav.account, icon: "user", active: ["/portal", "/login", "/register", "/admin", "/staff"] }
  ];
  const dockIndex = dock.findIndex(item => item.href === "/" ? pathname === "/" : isActive(pathname, item.active));
  const openMega = (key: string) => { window.clearTimeout(closeTimer.current); setMega(key); };
  const closeMega = () => { closeTimer.current = window.setTimeout(() => setMega(null), 140); };
  const groups = [c.menu.services, c.menu.learning, c.menu.shop, c.menu.company];

  return <>
    <header className="portal-nav" data-hidden={hidden} onKeyDown={event => {
      if (event.key !== "Escape") return;
      if (open) { setOpen(false); toggle.current?.focus(); }
      setMega(null);
    }}>
      <a className="skip-link" href="#main-content">{locale === "uz" ? "Asosiy mazmunga o‘tish" : locale === "ru" ? "К содержимому" : "Skip to content"}</a>
      <div className="container portal-nav-inner">
        <Link className="portal-brand" href="/"><img src="/icon.ico" width="32" height="32" alt="" />Tecsecure</Link>
        <nav className="portal-primary" aria-label={c.nav.primary} onMouseLeave={closeMega}>
          {primary.map(item => <div className="portal-primary-item" key={item.key} onMouseEnter={() => openMega(item.key)} onFocus={() => openMega(item.key)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) closeMega(); }}>
            <Link href={item.group.href} aria-current={isActive(pathname, item.active) ? "page" : undefined}>{item.group.title}</Link>
            {mega === item.key && <div className="portal-mega" onMouseEnter={() => openMega(item.key)}>
              {item.group.links.map(link => <Link href={link.href} key={link.href}><strong>{link.title}</strong><span>{link.hint}</span></Link>)}
            </div>}
          </div>)}
        </nav>
        <div className="portal-tools">
          <Link className="portal-icon-link" href="/search" aria-label={c.nav.search} title={c.nav.search}><span aria-hidden="true">⌕</span></Link>
          <Link className="portal-icon-link" href="/cart" aria-label={`${c.nav.cart}${count ? `: ${count}` : ""}`} title={c.nav.cart}><UiIcon name="box" />{count > 0 && <span className="portal-count">{count}</span>}</Link>
          <Link className="portal-account" href="/portal/profile" aria-label={c.nav.account}><UiIcon name="user" /><span>{c.nav.account}</span></Link>
          <button ref={toggle} type="button" className="portal-icon-link portal-menu-toggle" aria-expanded={open} aria-controls="portal-menu" aria-label={open ? c.nav.close : c.nav.menu} onClick={() => setOpen(value => !value)}>
            <span className="portal-burger" data-open={open} aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </div>
    </header>

    {open && <>
      <button type="button" className="portal-sheet-scrim" aria-label={c.nav.close} onClick={() => setOpen(false)} />
      <div className="portal-sheet" id="portal-menu" role="dialog" aria-label={c.nav.menu}>
        <div className="portal-sheet-grip" aria-hidden="true" />
        <div className="portal-sheet-groups">
          {groups.map(group => <section key={group.title}>
            <h2>{group.title}</h2>
            {group.links.map(link => <Link href={link.href} key={link.href}>{link.title}</Link>)}
          </section>)}
        </div>
        <div className="portal-sheet-prefs">
          <div role="group" aria-label={c.nav.language}>
            <span>{c.nav.language}</span>
            <div className="segmented">{languages.map(item => <button type="button" key={item.id} aria-pressed={locale === item.id} onClick={() => setLocale(item.id)}>{item.label}</button>)}</div>
          </div>
          <div role="group" aria-label={c.nav.theme}>
            <span>{c.nav.theme}</span>
            <div className="segmented">
              {(["dark", "light", "system"] as const).map(mode => <button type="button" key={mode} aria-pressed={theme === mode} onClick={() => setTheme(mode)}>{c.nav[mode]}</button>)}
            </div>
          </div>
          <AppInstallButton />
        </div>
      </div>
    </>}

    <nav className="mobile-dock" aria-label={c.nav.primary} data-typing={typing} style={{ "--dock-index": Math.max(dockIndex, 0), "--dock-count": dock.length } as React.CSSProperties}>
      {dockIndex >= 0 && <span className="mobile-dock-drop" aria-hidden="true" />}
      {dock.map((item, index) => <Link href={item.href} key={item.href} aria-current={index === dockIndex ? "page" : undefined}>
        <UiIcon name={item.icon} size={21} />
        <span>{item.title}</span>
      </Link>)}
    </nav>
  </>;
}
