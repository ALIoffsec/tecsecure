"use client";

import Link from "next/link";
import { useSitePreferences } from "./site-preferences";
import { UiIcon, type IconName } from "./ui-icon";
import { journeyCopy } from "@/lib/journey-copy";

export function HomeHero() {
  const { locale } = useSitePreferences();
  const c = journeyCopy[locale];
  const entries: { href: string; title: string; line: string; description: string; action: string; icon: IconName; tone: string }[] = [
    { href: "/services", title: c.services, line: c.serviceLine, description: c.serviceDesc, action: c.serviceAction, icon: "toolbox", tone: "services" },
    { href: "/learning", title: c.learning, line: c.learningLine, description: c.learningDesc, action: c.learningAction, icon: "book", tone: "learning" },
    { href: "/products", title: c.shop, line: c.shopLine, description: c.shopDesc, action: c.shopAction, icon: "box", tone: "shop" },
  ];
  return <section className="hub-hero" aria-labelledby="home-hero-title">
    <div className="container">
      <div className="hub-heading">
        <span className="eyebrow">{c.eyebrow}</span>
        <h1 id="home-hero-title">{c.title}</h1>
        <p className="lead">{c.intro}</p>
      </div>
      <nav className="hub-paths" aria-label={c.eyebrow}>
        {entries.map((entry, index) => <Link className={`hub-path hub-path-${entry.tone}`} href={entry.href} key={entry.href}>
          <div className="hub-path-top"><span className="hub-icon"><UiIcon name={entry.icon} size={28} /></span><span className="hub-number">0{index + 1}</span></div>
          <h2>{entry.title}</h2><strong>{entry.line}</strong><p>{entry.description}</p>
          <span className="hub-path-action">{entry.action}<span aria-hidden="true">→</span></span>
        </Link>)}
      </nav>
      <form className="hub-search" action="/search" role="search">
        <label htmlFor="hub-search">{c.searchTitle}</label>
        <div><input id="hub-search" type="search" name="q" maxLength={80} placeholder={c.searchHint} required /><button className="button" type="submit">{c.search}</button></div>
      </form>
    </div>
  </section>;
}
