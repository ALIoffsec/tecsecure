"use client";

import Link from "next/link";
import { useSitePreferences } from "./site-preferences";
import { journeyCopy, inquiryHref } from "@/lib/journey-copy";

export function ProductGuidance({ name, warranty }: { name: string; warranty?: string | null }) {
  const { locale } = useSitePreferences();
  const c = journeyCopy[locale];
  return <section className="product-decision">
    <div className="journey-grid">
      {[[c.compatibility, c.compatibilityNote], [c.warranty, warranty || c.warrantyNote], [c.delivery, c.deliveryNote]].map(([heading, text]) => <article className="panel-card" key={heading}><h3>{heading}</h3><p>{text}</p></article>)}
    </div>
    <div className="hub-account panel-card">
      <div><h3>{c.setup}</h3><p className="small muted">{c.setupNote}</p><p className="small muted">{c.equipmentNote}</p></div>
      <div className="journey-actions"><Link className="button secondary" href={inquiryHref(name)}>{c.discuss}</Link><Link href="/learning/modules" className="text-link">{c.learningLink}</Link><Link href="/terms" className="text-link">{c.terms}</Link></div>
    </div>
  </section>;
}
