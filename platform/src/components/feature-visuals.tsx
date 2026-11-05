"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useSitePreferences } from "./site-preferences";
import { featureCopy } from "@/lib/feature-copy";

export function FooterGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const { locale } = useSitePreferences();
  const c = featureCopy[locale];
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);
  return <>
    <div ref={ref} className="feature-footer-glow" data-running={visible && pageVisible && !paused} aria-hidden="true">
      <div className="feature-footer-liquid" style={{ filter: `url("#${id}")` }}>
        {Array.from({ length: 40 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 101}%`, width: `${48 + i % 7 * 10}px`, height: `${48 + i % 7 * 10}px`, animationDuration: `${3 + i % 4}s`, animationDelay: `${-(i % 11)}s` }} />)}
      </div>
      <svg width="0" height="0"><defs><filter id={id}><feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" /></filter></defs></svg>
    </div>
    <button className="feature-footer-pause" type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? c.resumeMotion : c.pauseMotion}</button>
  </>;
}

export function NotFoundView() {
  const { locale } = useSitePreferences();
  const c = featureCopy[locale];
  return <section className="container page-shell feature-not-found">
    <div className="feature-lamp-scene" aria-hidden="true">
      <div className="feature-lamp"><i className="feature-lamp-cord" /><i className="feature-lamp-shade" /><i className="feature-lamp-beam" /></div>
      <span>404</span>
    </div>
    <h1>{c.notFound}</h1><p className="muted">{c.notFoundHint}</p>
    <div className="hero-actions"><Link href="/" className="button">{c.home}</Link><Link href="/search" className="button secondary">{c.search}</Link></div>
  </section>;
}
