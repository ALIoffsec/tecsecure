"use client";

import { useState, type ReactNode } from "react";
import { useSitePreferences } from "./site-preferences";
import { shopCopy } from "@/lib/shop-copy";

export function FilterPanel({ children, activeCount, categories, results }: { children: ReactNode; activeCount: number; categories: ReactNode; results: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { locale } = useSitePreferences();
  const c = shopCopy[locale];
  return <>
    <div className="shop-category-row">
      {categories}
      <button type="button" className="button secondary shop-filters-toggle" aria-expanded={open} aria-controls="shop-filters" onClick={() => setOpen((v) => !v)}>
        {c.filter}{activeCount > 0 ? ` (${activeCount})` : ""}
      </button>
    </div>
    <div className="shop-layout">
      <aside className="shop-filters" id="shop-filters" data-open={open} aria-label={c.filter}>{children}</aside>
      {results}
    </div>
  </>;
}
