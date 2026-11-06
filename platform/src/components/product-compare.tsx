"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useSitePreferences } from "./site-preferences";
import { shopCopy } from "@/lib/shop-copy";
import { ToastMessage } from "./toast-provider";

type Selection = { id: string; name: string; category: string };
const CompareContext = createContext<{
  items: Selection[]; toggle: (item: Selection) => void; clear: () => void;
} | null>(null);
const key = "tecsecure-comparison-v1";

export function ProductCompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Selection[]>([]);
  const [error, setError] = useState("");
  const { locale } = useSitePreferences();
  const c = shopCopy[locale];
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(key) ?? "[]");
      if (!Array.isArray(saved) || !saved.every((item): item is Selection => item && typeof item.id === "string" && typeof item.name === "string" && typeof item.category === "string")) {
        throw new Error("Invalid comparison data");
      }
      setItems(saved.slice(0, 3));
    } catch (issue) { console.error("Comparison storage failed", issue); setError(c.storageError); }
  }, [c.storageError]);
  function write(next: Selection[]) {
    setItems(next);
    setError("");
    try { sessionStorage.setItem(key, JSON.stringify(next)); }
    catch (issue) { console.error("Comparison storage failed", issue); setError(c.storageError); }
  }
  function toggle(item: Selection) {
    if (items.some(current => current.id === item.id)) { write(items.filter(current => current.id !== item.id)); return; }
    if (items.length >= 3 || items.some(current => current.category !== item.category)) { setError(c.compareLimit); return; }
    write([...items, item]);
  }
  return <CompareContext.Provider value={{ items, toggle, clear: () => write([]) }}>{children}<ToastMessage message={error} variant="error" /></CompareContext.Provider>;
}

function useComparison() {
  const value = useContext(CompareContext);
  if (!value) throw new Error("Comparison provider is missing");
  return value;
}

export function CompareButton({ product, iconOnly = false }: { product: Selection; iconOnly?: boolean }) {
  const { items, toggle } = useComparison();
  const { locale } = useSitePreferences();
  const selected = items.some(item => item.id === product.id);
  const label = shopCopy[locale].compare;
  if (iconOnly) return <button type="button" className="shop-icon-tool" aria-pressed={selected} aria-label={label} title={label} onClick={() => toggle(product)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v13M7 4 3.5 7.5M7 4l3.5 3.5M17 20V7M17 20l-3.5-3.5M17 20l3.5-3.5" /></svg></button>;
  return <button type="button" className="shop-compare-button" aria-pressed={selected} onClick={() => toggle(product)}>{selected ? "✓ " : "+ "}{label}</button>;
}

export function CompareTray() {
  const { items, toggle, clear } = useComparison();
  const { locale } = useSitePreferences();
  const c = shopCopy[locale];
  if (!items.length) return null;
  return <aside className="compare-tray" aria-label={c.compareTitle}>
    {items.map(item => <button type="button" className="shop-compare-button" key={item.id} aria-label={`${c.remove}: ${item.name}`} onClick={() => toggle(item)}>{item.name} ×</button>)}
    {items.length > 1 ? <Link className="button" href={`/products/compare?ids=${items.map(item => encodeURIComponent(item.id)).join(",")}`}>{c.compare} ({items.length})</Link> : <span className="small muted">{c.compareEmpty}</span>}
    <button className="button secondary" type="button" onClick={clear}>{c.clear}</button>
  </aside>;
}
