"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useSitePreferences } from "./site-preferences";
import { UiIcon, type IconName } from "./ui-icon";
import { journeyCopy } from "@/lib/journey-copy";
import { SearchField } from "./search-field";
import { CurrencyPrice } from "./currency-context";
import { homeCopy } from "@/lib/home-copy";

/** Small evidence under each door's hook: what the course is, which goods the shop really has. */
export type HeroProof = { course: { title: string; lessons: number; free: boolean } | null; products: { id: string; name: string; priceMinor: number; currency: string }[] };

export function HomeHero({ proof }: { proof: HeroProof }) {
  const { locale } = useSitePreferences();
  const c = journeyCopy[locale];
  const h = homeCopy[locale];
  const [selected, setSelected] = useState(0);
  const [turn, setTurn] = useState(0);
  const detailId = useId();
  const entries: { href: string; title: string; line: string; hook: string; description: React.ReactNode; action: string; icon: IconName; tone: string }[] = [
    { href: "/services", title: c.services, line: c.serviceLine, hook: h.doors.services.hook, description: h.doors.services.proofEmpty, action: c.serviceAction, icon: "toolbox", tone: "services" },
    { href: "/learning", title: c.learning, line: c.learningLine, hook: h.doors.academy.hook, description: proof.course ? `${proof.course.title} · ${proof.course.lessons} ${h.doors.academy.lessons}${proof.course.free ? ` · ${h.doors.academy.free}` : ""}` : c.learningDesc, action: c.learningAction, icon: "book", tone: "learning" },
    { href: "/products", title: c.shop, line: c.shopLine, hook: h.doors.shop.hook, description: proof.products.length
      ? <span className="hub-path-proof">{proof.products.slice(0, 3).map(product => <span key={product.id}>{product.name} — <CurrencyPrice amountMinor={product.priceMinor} currency={product.currency} /></span>)}</span>
      : c.shopDesc, action: c.shopAction, icon: "box", tone: "shop" },
  ];
  const current = entries[selected];
  // The wheel only ever turns one way, like the supplied landing page, whichever entry is chosen.
  const choose = (index: number) => {
    if (index === selected) return;
    setTurn(value => value - ((index - selected + entries.length) % entries.length) * 120);
    setSelected(index);
  };
  return <>
    <section className="brand-hero" data-direction={selected} aria-labelledby="home-hero-title">
      <div className="container brand-hero-layout">
        <div className="brand-hero-copy">
          <span className="eyebrow">{c.brandEyebrow}</span>
          <h1 id="home-hero-title">{h.title}<span>{h.highlight}</span></h1>
          <p className="lead">{h.lead}</p>
          <div className="journey-actions">
            <Link className="button" href={`/contact?mode=callback&topic=${encodeURIComponent(h.inspectTopic)}`}>{h.inspect}</Link>
            <Link className="button secondary" href="/estimate?tab=cctv">{h.calculate}</Link>
          </div>
        </div>
        <div className="feature-hero-showcase" data-direction={selected}>
          <div className="hero-wheel-scene" aria-hidden="true">
            <div className="hero-wheel-back" style={{ transform: `rotate(${turn * -.5}deg)` }}><i /><i /><i /></div>
            <div className="hero-wheel" style={{ transform: `rotate(${turn}deg)` }}>
              {entries.map((entry, index) => <div className="hero-wheel-item" key={entry.href} style={{ "--spoke": `${index * 120}deg` } as React.CSSProperties}>
                <div className="brand-glass-pane hero-wheel-pane" data-current={selected === index}>
                  <span className="brand-glass-mark">Tecsecure</span>
                  <UiIcon name={entry.icon} size={84} />
                  <div className="brand-glass-lines"><span /><span /><span /></div>
                </div>
              </div>)}
            </div>
          </div>
          <div className="feature-hero-selector" role="group" aria-label={c.eyebrow}>
            {entries.map((entry, index) => <button key={entry.href} type="button" aria-pressed={selected === index} aria-controls={detailId} onClick={() => choose(index)}><UiIcon name={entry.icon} size={16} />{entry.title}</button>)}
          </div>
          <p className="feature-hero-detail" key={current.href} id={detailId} aria-live="polite"><Link href={current.href}>{current.line} <span aria-hidden="true">→</span></Link></p>
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
          <h3>{entry.title}</h3><strong>{entry.hook}</strong><p>{entry.description}</p>
          <span className="hub-path-action">{entry.action}<span aria-hidden="true">→</span></span>
        </Link>)}
      </nav>
      <form className="hub-search" action="/search" role="search">
        <label htmlFor="hub-search">{c.searchTitle}</label>
        <div><SearchField id="hub-search" required placeholder={c.searchHint} /><button className="button" type="submit">{c.search}</button></div>
      </form>
    </div>
  </section></>;
}
