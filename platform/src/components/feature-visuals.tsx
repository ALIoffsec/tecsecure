"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useSitePreferences } from "./site-preferences";
import { featureCopy } from "@/lib/feature-copy";

/** Deterministic stand-in for the original Math.random() particles, so server and client markup agree. */
const footerParticles = Array.from({ length: 56 }, (_, i) => ({
  left: (i * 37.3) % 100,
  size: 48 + (i * 13) % 96,
  uplift: 96 + (i * 29) % 128,
  duration: 4 + (i * 7) % 30 / 10,
  delay: -((i * 11) % 90) / 10
}));

export function FooterGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const filterId = `footer-water-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);
  return <div ref={ref} className="feature-footer-glow" data-running={visible && pageVisible} aria-hidden="true">
    <div className="feature-footer-liquid" style={{ filter: `url("#${filterId}")` }}>
      {footerParticles.map((p, i) => <i key={i} style={{ left: `${p.left}%`, width: p.size, height: p.size, "--uplift": `${p.uplift}px`, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` } as React.CSSProperties} />)}
    </div>
    {/* The supplied goo filter, followed by a specular pass that makes the surface read as water. */}
    <svg width="0" height="0"><defs><filter id={filterId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
      <feGaussianBlur in="goo" stdDeviation="5" result="height" />
      <feSpecularLighting in="height" surfaceScale="7" specularConstant=".85" specularExponent="26" lightingColor="#ffffff" result="shine"><feDistantLight azimuth="245" elevation="52" /></feSpecularLighting>
      <feComposite in="shine" in2="goo" operator="in" result="shineInside" />
      <feComposite in="goo" in2="shineInside" operator="arithmetic" k1="0" k2="1" k3=".55" k4="-.13" />
    </filter></defs></svg>
  </div>;
}

export function NotFoundView() {
  const { locale } = useSitePreferences();
  const c = featureCopy[locale];
  return <section className="feature-not-found">
    <div className="feature-lamp-stars" aria-hidden="true"><i /><i /><i /></div>
    <div className="feature-lamp" aria-hidden="true">
      <i className="feature-lamp-cable" />
      <i className="feature-lamp-cover" />
      <i className="feature-lamp-in-cover"><i className="feature-lamp-bulb" /></i>
      <i className="feature-lamp-light" />
    </div>
    <div className="feature-not-found-card">
      <strong className="feature-not-found-code" aria-hidden="true">404</strong>
      <h1>{c.notFound}</h1>
      <p className="muted">{c.notFoundHint}</p>
      <div className="hero-actions"><Link href="/" className="button">{c.home}</Link><Link href="/search" className="button secondary">{c.search}</Link></div>
    </div>
  </section>;
}
