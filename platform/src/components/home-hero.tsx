"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useSitePreferences } from "./site-preferences";
import { UiIcon, type IconName } from "./ui-icon";
import { journeyCopy } from "@/lib/journey-copy";

export function HomeHero() {
  const { locale } = useSitePreferences();
  const c = journeyCopy[locale];
  const [selected, setSelected] = useState(0);
  const detailId = useId();
  const entries: { href: string; title: string; line: string; description: string; action: string; icon: IconName; tone: string }[] = [
    { href: "/services", title: c.services, line: c.serviceLine, description: c.serviceDesc, action: c.serviceAction, icon: "toolbox", tone: "services" },
    { href: "/learning", title: c.learning, line: c.learningLine, description: c.learningDesc, action: c.learningAction, icon: "book", tone: "learning" },
    { href: "/products", title: c.shop, line: c.shopLine, description: c.shopDesc, action: c.shopAction, icon: "box", tone: "shop" },
  ];
  const current = entries[selected];
  return <>
    <section className="brand-hero" aria-labelledby="home-hero-title">
      <div className="container brand-hero-layout">
        <div className="brand-hero-copy">
          <span className="eyebrow">{c.brandEyebrow}</span>
          <h1 id="home-hero-title">{c.brandTitle}<span>{c.brandHighlight}</span></h1>
          <p className="lead">{c.brandIntro}</p>
        </div>
        <div className="feature-hero-showcase" data-direction={selected}>
          <div className="brand-glass-scene" aria-hidden="true">
            <div className="brand-glass-color brand-glass-color-cyan" />
            <div className="brand-glass-color brand-glass-color-violet" />
            <div className="brand-glass-pane brand-glass-pane-back"><UiIcon name="book" size={40} /></div>
            <div className="brand-glass-pane brand-glass-pane-front" key={current.href}>
              <span className="brand-glass-mark">Tecsecure</span>
              <UiIcon name={current.icon} size={88} />
              <div className="brand-glass-lines"><span /><span /><span /></div>
            </div>
            <div className="brand-glass-pane brand-glass-pane-small"><UiIcon name="box" size={36} /></div>
          </div>
          <div className="feature-hero-selector" role="group" aria-label={c.eyebrow}>
            {entries.map((entry, index) => <button key={entry.href} type="button" aria-pressed={selected === index} aria-controls={detailId} onClick={() => setSelected(index)}><UiIcon name={entry.icon} size={16} />{entry.title}</button>)}
          </div>
          <p className="feature-hero-detail" id={detailId} aria-live="polite"><Link href={current.href}>{current.line} <span aria-hidden="true">→</span></Link></p>
        </div>
      </div>
    </section>
    <section className="hub-hero" id="directions" aria-labelledby="directions-title">
    <div className="container">
      <div className="hub-heading">
        <div><span className="eyebrow">{c.explore}</span><h2 id="directions-title">{c.directionsTitle}</h2></div>
        <p>{c.directionsIntro}</p>
      </div>
      <nav className="hub-paths" aria-label={c.eyebrow}>
        {entries.map((entry, index) => <Link className={`hub-path hub-path-${entry.tone}`} href={entry.href} key={entry.href}>
          <div className="hub-path-top"><span className="hub-icon"><UiIcon name={entry.icon} size={28} /></span><span className="hub-number">0{index + 1}</span></div>
          <h3>{entry.title}</h3><strong>{entry.line}</strong><p>{entry.description}</p>
          <span className="hub-path-action">{entry.action}<span aria-hidden="true">→</span></span>
        </Link>)}
      </nav>
      <form className="hub-search" action="/search" role="search">
        <label htmlFor="hub-search">{c.searchTitle}</label>
        <div><input id="hub-search" type="search" name="q" maxLength={80} placeholder={c.searchHint} required /><button className="button" type="submit">{c.search}</button></div>
      </form>
    </div>
  </section></>;
}
