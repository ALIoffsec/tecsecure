"use client";

import { useSitePreferences } from "./site-preferences";
import { brandLogoSrc, partnerBrandsCopy, type PartnerBrands } from "@/lib/partner-brands";

/** A row is repeated until it is wider than a wide screen, so the loop never shows a gap. */
const MIN_TILES = 12;

/**
 * Two moving rows of brand logos: the first runs right to left, the second left to right. Hovering stops
 * them; with motion switched off in the site menu they stand still.
 */
export function BrandMarquee({ brands }: { brands: PartnerBrands }) {
  const { locale } = useSitePreferences();
  const title = brands.title[locale] || partnerBrandsCopy[locale].title;
  const note = brands.note[locale] || partnerBrandsCopy[locale].note;
  const rows = brands.rows.filter(row => row.length > 0);
  if (rows.length === 0) return null;
  return <section className="brand-strip" aria-label={title}>
    <div className="container brand-strip-heading">
      <h2 className="eyebrow">{title}</h2>
      <span className="small muted">{note}</span>
    </div>
    {rows.map((row, rowIndex) => {
      const half = Array.from({ length: Math.ceil(MIN_TILES / row.length) }, () => row).flat();
      return <div className="brand-marquee" key={rowIndex}>
        <div className={`brand-track${rowIndex === 1 ? " is-reverse" : ""}`} role="list" style={{ "--brand-duration": `${half.length * 3}s` } as React.CSSProperties}>
          {[...half, ...half].map((brand, index) => (
            <div className="brand-tile" role="listitem" aria-hidden={index >= row.length} key={`${brand.name}-${index}`}>
              <img src={brandLogoSrc(brand.logo)} alt="" width="112" height="48" decoding="async" />
              <strong>{brand.name}</strong>
            </div>
          ))}
        </div>
      </div>;
    })}
  </section>;
}
