"use client";

import { useState, type ReactNode } from "react";

export function FilterPanel({ children, activeCount, categories, results }: { children: ReactNode; activeCount: number; categories: ReactNode; results: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <>
    <div className="shop-category-row">
      {categories}
      <button type="button" className="button secondary shop-filters-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        Filtrlar{activeCount > 0 ? ` (${activeCount})` : ""}
      </button>
    </div>
    <div className="shop-layout">
      <aside className="shop-filters" data-open={open} aria-label="Filtrlar" onChange={(event) => {
        const target = event.target;
        if (target instanceof HTMLInputElement && target.type === "radio") target.form?.requestSubmit();
      }}>{children}</aside>
      {results}
    </div>
  </>;
}
