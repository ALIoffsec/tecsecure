"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useSitePreferences } from "./site-preferences";
import { UiIcon, type IconName } from "./ui-icon";
import { siteCopy } from "@/lib/site-copy";
import { formatMinor } from "@/lib/format";
import type { SearchGroup, SearchItem, SearchResponse } from "@/lib/search-index";

const RECENT_KEY = "tecsecure-recent-searches";
const groupIcons: Record<SearchGroup, IconName> = { product: "box", service: "toolbox", learning: "book", news: "newspaper", page: "layout" };

function readRecent(): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}

export function rememberSearch(query: string) {
  const clean = query.trim();
  if (clean.length < 2) return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify([clean, ...readRecent().filter(item => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6)));
  } catch { /* history is a convenience */ }
}

/** Marks what was typed inside a result, when it appears there literally. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const words = query.trim().split(/\s+/).filter(word => word.length > 1).map(word => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!words.length) return <>{text}</>;
  const parts = text.split(new RegExp(`(${words.join("|")})`, "gi"));
  return <>{parts.map((part, index) => index % 2 ? <mark key={index}>{part}</mark> : part)}</>;
}

/** Fetches as the person types: quick, cancelled when overtaken, and remembered for the visit. */
export function useSearchSuggestions(query: string, scope: "all" | "products", perGroup = 5) {
  const { locale } = useSitePreferences();
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const memory = useRef(new Map<string, SearchResponse>());
  useEffect(() => {
    const clean = query.trim();
    if (!clean) { setData(null); setLoading(false); return; }
    const key = `${locale}|${scope}|${perGroup}|${clean.toLowerCase()}`;
    const known = memory.current.get(key);
    if (known) { setData(known); setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(() => {
      fetch(`/api/search/suggest?${new URLSearchParams({ q: clean, locale, scope, limit: String(perGroup) })}`, { signal: controller.signal })
        .then(response => response.ok ? response.json() as Promise<SearchResponse> : Promise.reject(new Error(String(response.status))))
        .then(result => { memory.current.set(key, result); setData(result); setLoading(false); })
        .catch((error: unknown) => { if (!(error instanceof DOMException && error.name === "AbortError")) setLoading(false); });
    }, 110);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, locale, scope, perGroup]);
  return { data, loading };
}

export function SearchResultRow({ item, query, active = false, id, onChoose }: { item: SearchItem; query: string; active?: boolean; id?: string; onChoose?: () => void }) {
  const { locale } = useSitePreferences();
  const [imageFailed, setImageFailed] = useState(false);
  return <Link className="search-row" href={item.href} id={id} role={id ? "option" : undefined} aria-selected={id ? active : undefined} data-active={active} onClick={onChoose}>
    <span className="search-row-icon">
      {item.imageId && !imageFailed ? <img src={`/api/media/${item.imageId}`} alt="" loading="lazy" onError={() => setImageFailed(true)} /> : <UiIcon name={groupIcons[item.group]} size={18} />}
    </span>
    <span className="search-row-text">
      <strong><Highlight text={item.title} query={query} /></strong>
      {item.subtitle && <small>{item.subtitle}</small>}
    </span>
    {item.priceMinor !== null && item.currency && <span className="search-row-price">{formatMinor(item.priceMinor, item.currency, locale)}</span>}
  </Link>;
}

/**
 * The input and its suggestions. It lives inside a normal GET form, so searching still works
 * before scripts load. `panel` keeps the list on screen for the full-screen search.
 */
export function SearchField({ id, name = "q", scope = "all", defaultValue = "", placeholder, variant = "dropdown", autoFocus = false, required = false, onChoose, resultsHref, leading }: {
  id: string;
  name?: string;
  scope?: "all" | "products";
  defaultValue?: string;
  placeholder?: string;
  variant?: "dropdown" | "panel";
  autoFocus?: boolean;
  required?: boolean;
  onChoose?: () => void;
  resultsHref?: (query: string) => string;
  leading?: ReactNode;
}) {
  const { locale } = useSitePreferences();
  const c = siteCopy[locale].search;
  const router = useRouter();
  const listId = useId();
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(variant === "panel");
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const { data, loading } = useSearchSuggestions(query, scope);
  const clean = query.trim();
  const fullResults = useCallback((value: string) => resultsHref ? resultsHref(value) : `/search?q=${encodeURIComponent(value)}`, [resultsHref]);

  useEffect(() => { setRecent(readRecent()); }, [open]);
  useEffect(() => { setActive(-1); }, [data, query]);
  useEffect(() => {
    if (variant === "panel") return;
    const onDown = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [variant]);

  const chips = clean ? data?.completions ?? [] : [];
  const rows = useMemo(() => data?.groups.flatMap(group => group.items) ?? [], [data]);
  const optionCount = chips.length + rows.length;
  const optionId = (index: number) => `${listId}-${index}`;
  const showEmptyState = !clean;
  const noResults = Boolean(clean && data && !loading && data.total === 0 && data.query.toLowerCase() === clean.toLowerCase());
  const popular = scope === "products" ? c.popularShop : c.popular;

  function finish() {
    rememberSearch(input.current?.value ?? query);
    setOpen(variant === "panel");
    onChoose?.();
  }
  function fill(value: string) {
    setQuery(value);
    setOpen(true);
    input.current?.focus();
  }
  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && variant === "dropdown") { setOpen(false); return; }
    if (!optionCount) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActive(value => (value + 1) % optionCount); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActive(value => (value <= 0 ? optionCount : value) - 1); }
    if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      if (active < chips.length) { fill(chips[active]); return; }
      const row = rows[active - chips.length];
      finish();
      router.push(row.href);
    }
  }

  let cursor = chips.length - 1;
  return <div className="search-field" ref={root} data-variant={variant} data-open={open}>
    <div className="search-field-box">
      {leading ?? <svg className="search-field-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></svg>}
      <input ref={input} id={id} name={name} type="search" value={query} maxLength={80} required={required} placeholder={placeholder ?? c.placeholder} autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="search" autoFocus={autoFocus}
        role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={active >= 0 ? optionId(active) : undefined}
        onChange={event => { setQuery(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={onKeyDown} />
      {loading && <span className="search-field-spin" aria-hidden="true" />}
      {query && <button type="button" className="search-field-clear" aria-label={c.clear} onClick={() => { setQuery(""); input.current?.focus(); }}>×</button>}
    </div>

    {open && <div className="search-drop" id={listId} role="listbox" aria-label={c.placeholder} onPointerDown={event => { if (!(event.target as HTMLElement).closest("input")) event.preventDefault(); }}>
      {showEmptyState && <div className="search-empty">
        {recent.length > 0 && <section>
          <header><h3>{c.recent}</h3><button type="button" onClick={() => { try { window.localStorage.removeItem(RECENT_KEY); } catch { /* nothing to clear */ } setRecent([]); }}>{c.clearRecent}</button></header>
          <div className="search-chips">{recent.map(item => <button type="button" key={item} onClick={() => fill(item)}><UiIcon name="clock" size={14} /><span>{item}</span></button>)}</div>
        </section>}
        <section>
          <header><h3>{c.popularTitle}</h3></header>
          <div className="search-chips">{popular.map(item => <button type="button" key={item} onClick={() => fill(item)}>{item}</button>)}</div>
        </section>
      </div>}

      {chips.length > 0 && <div className="search-chips search-completions">{chips.map((chip, index) => <button type="button" role="option" aria-selected={active === index} id={optionId(index)} data-active={active === index} key={chip} onClick={() => fill(chip)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></svg><span><Highlight text={chip} query={query} /></span>
      </button>)}</div>}

      {clean && data?.groups.map(group => <section className="search-group" key={group.group}>
        <h3>{c.groups[group.group]}</h3>
        {group.items.map(item => { cursor += 1; const index = cursor; return <SearchResultRow key={item.id} item={item} query={query} id={optionId(index)} active={active === index} onChoose={finish} />; })}
      </section>)}

      {noResults && <div className="search-none">
        <strong>{c.noResults}</strong>
        <p>{c.noResultsHint}</p>
        <Link className="button secondary" href="/request-service" onClick={finish}>{c.askUs}</Link>
      </div>}

      {clean && data && data.total > 0 && <Link className="search-all" href={fullResults(clean)} onClick={finish}>{c.all} ({data.total}) →</Link>}
    </div>}
  </div>;
}

/** Search from anywhere: the magnifier in the bar, Ctrl+K, or the "/" key. */
export function SearchPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { locale } = useSitePreferences();
  const c = siteCopy[locale].search;
  const router = useRouter();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLElement && event.target.matches("input, textarea, select, [contenteditable]");
      if ((event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        onOpenChange(true);
      }
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange]);
  useEffect(() => {
    if (!open) return;
    document.documentElement.dataset.sheetOpen = "";
    return () => { delete document.documentElement.dataset.sheetOpen; };
  }, [open]);
  if (!open) return null;
  return <>
    <button type="button" className="portal-sheet-scrim" aria-label={c.close} onClick={() => onOpenChange(false)} />
    <div className="search-palette" role="dialog" aria-modal="true" aria-label={c.placeholder}>
      <form action="/search" role="search" onSubmit={event => {
        event.preventDefault();
        const value = String(new FormData(event.currentTarget).get("q") ?? "").trim();
        if (!value) return;
        rememberSearch(value);
        onOpenChange(false);
        router.push(`/search?q=${encodeURIComponent(value)}`);
      }}>
        <SearchField id="palette-search" variant="panel" autoFocus onChoose={() => onOpenChange(false)} />
      </form>
      <button type="button" className="search-palette-close" onClick={() => onOpenChange(false)}>{c.close}</button>
    </div>
  </>;
}
