type Kind = "camera" | "network" | "shield" | "box" | "recorder" | "wifi" | "access";

function kindOf(slug?: string | null): Kind {
  if (!slug) return "box";
  if (slug.includes("video")) return "camera";
  if (slug.includes("tarmoq")) return "network";
  if (slug.includes("xavfsizlik")) return "shield";
  return "box";
}

// Illustrative category artwork, not a product photograph.
export function ProductVisual({ categorySlug, productSlug, large = false }: { categorySlug?: string | null; productSlug?: string; large?: boolean }) {
  const kind = productSlug?.includes("nvr") ? "recorder" : productSlug?.includes("wifi") ? "wifi" : productSlug?.includes("kirish") ? "access" : kindOf(categorySlug);
  return <div className={`shop-visual shop-visual-${kind}${large ? " is-large" : ""}`} aria-hidden="true">
    <svg viewBox="0 0 160 120" role="presentation">
      <defs>
        <linearGradient id={`g-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity=".95" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity=".45" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#g-${kind})`} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        {kind === "recorder" && <>
          <rect x="20" y="38" width="120" height="48" rx="8" />
          <path d="M32 52h60m-60 12h60m-60 12h34" />
          <circle cx="119" cy="61" r="8" /><path d="M30 90h12m76 0h12" />
        </>}
        {kind === "wifi" && <>
          <ellipse cx="80" cy="78" rx="36" ry="15" /><path d="M44 78v8c0 20 72 20 72 0v-8" />
          <path d="M49 32a44 44 0 0 1 62 0M61 45a27 27 0 0 1 38 0M73 58a10 10 0 0 1 14 0" /><circle cx="80" cy="78" r="3" />
        </>}
        {kind === "access" && <>
          <rect x="25" y="45" width="25" height="62" rx="5" /><rect x="110" y="45" width="25" height="62" rx="5" />
          <path d="M50 63h30v40M80 63l28 22M80 63l28-20" /><rect x="59" y="13" width="42" height="28" rx="5" /><path d="m70 27 7 6 13-14" />
        </>}
        {kind === "camera" && <>
          <rect x="30" y="38" width="76" height="38" rx="10" />
          <path d="M106 50l24-10v36l-24-10z" />
          <circle cx="68" cy="57" r="11" />
          <circle cx="68" cy="57" r="3.5" fill="var(--accent)" />
          <path d="M60 76v16h16V76M44 100h48" />
        </>}
        {kind === "network" && <>
          <rect x="22" y="62" width="116" height="30" rx="8" />
          <circle cx="42" cy="77" r="3" fill="var(--accent)" />
          <circle cx="56" cy="77" r="3" fill="var(--accent)" />
          <path d="M92 77h34M80 62V44M52 36a40 40 0 0 1 56 0M64 46a24 24 0 0 1 32 0" />
        </>}
        {kind === "shield" && <>
          <path d="M80 18l40 14v28c0 24-17 40-40 48-23-8-40-24-40-48V32z" />
          <rect x="66" y="56" width="28" height="22" rx="5" />
          <path d="M71 56v-7a9 9 0 0 1 18 0v7" />
        </>}
        {kind === "box" && <>
          <path d="M80 20l46 22v44l-46 22-46-22V42z" />
          <path d="M34 42l46 22 46-22M80 64v44" />
        </>}
      </g>
    </svg>
  </div>;
}
