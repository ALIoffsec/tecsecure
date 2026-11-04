"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSitePreferences } from "./site-preferences";
import { featureCopy } from "@/lib/feature-copy";

export function LogoutFigure() {
  return <svg className="feature-logout-figure" viewBox="0 0 48 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path className="feature-door" d="M29 32V4h14v28M32 18h2" />
    <g className="feature-person"><circle cx="15" cy="8" r="3" /><path d="m15 12-3 10 8 8m-8-8-6 8m9-17 6 7h6M14 14l-7 6" /></g>
  </svg>;
}

export function OrderMotion({ state }: { state: "idle" | "pending" | "success" }) {
  return <span className="feature-order-motion" data-state={state} aria-hidden="true">
    <svg viewBox="0 0 90 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path className="feature-order-road" d="M2 34h86" />
      <g className="feature-order-truck"><path d="M18 10h34v20H18zM52 17h12l9 9v4H52M58 18v8h14" /><circle cx="29" cy="31" r="4" /><circle cx="61" cy="31" r="4" /><path className="feature-order-box" d="M28 15h13v11H28zM34 15v5" /></g>
      <path className="feature-order-check" d="m32 20 9 9 18-20" />
    </svg>
  </span>;
}

export function LoadingVisual({ label }: { label?: string }) {
  const { locale } = useSitePreferences();
  const c = featureCopy[locale];
  return <div className="feature-loading" role="status">
    <svg viewBox="0 0 180 90" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M22 70h136M105 35h42v29h-42zM117 70v-6" />
      <circle cx="62" cy="22" r="10" />
      <path d="M58 35 48 60v10M58 36l18 13" />
      <path className="feature-loading-arm" d="m76 49 17 10h16" />
      <path className="feature-loading-signal" d="m117 45 5 5-5 5m12 0h8" />
    </svg>
    <strong>{label ?? c.loading}</strong>
    <span className="feature-loading-track" aria-hidden="true"><i /></span>
  </div>;
}

export function FooterGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="feature-footer-glow" data-visible={visible} aria-hidden="true">
    {Array.from({ length: 8 }, (_, i) => <i key={i} style={{ left: `${6 + i * 12}%`, animationDelay: `${i % 3 * 150}ms` }} />)}
  </div>;
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
