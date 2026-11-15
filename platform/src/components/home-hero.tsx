"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useSitePreferences } from "./site-preferences";
import { UiIcon, type IconName } from "./ui-icon";
import { journeyCopy } from "@/lib/journey-copy";
import { homeCopy } from "@/lib/home-copy";

export function HomeHero() {
  const { locale } = useSitePreferences();
  const c = journeyCopy[locale];
  const h = homeCopy[locale];
  const [selected, setSelected] = useState(0);
  const [turn, setTurn] = useState(0);
  const detailId = useId();
  const entries: { href: string; title: string; line: string; icon: IconName }[] = [
    { href: "/services", title: c.services, line: c.serviceLine, icon: "toolbox" },
    { href: "/learning", title: c.learning, line: c.learningLine, icon: "book" },
    { href: "/products", title: c.shop, line: c.shopLine, icon: "box" },
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
  </>;
}
