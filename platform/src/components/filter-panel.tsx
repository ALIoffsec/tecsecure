"use client";

import { useState, type ReactNode } from "react";

export function FilterPanel({ children, activeCount }: { children: ReactNode; activeCount: number }) {
  const [open, setOpen] = useState(false);
  return <div>
    <button type="button" className="button secondary shop-filters-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
      Filtrlar{activeCount > 0 ? ` (${activeCount})` : ""}
    </button>
    <aside className="shop-filters" data-open={open} aria-label="Filtrlar">{children}</aside>
  </div>;
}
