"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { shopCopy } from "@/lib/shop-copy";
import type { CatalogMedia } from "@/lib/catalog-utils";
import { ProductCard, type ProductCardRecord } from "./product-card";
import { useSitePreferences } from "./site-preferences";

type Card = ProductCardRecord & { assets: CatalogMedia[] };

/**
 * Keeps adding products under the ones already on screen. The button is a real link to the next
 * page, and the address follows along, so a reload or a shared link opens the same place.
 */
export function ShopGrid({ children, ids, page, pages, total, pageSize, query }: {
  children: ReactNode; ids: string[]; page: number; pages: number; total: number; pageSize: number; query: string;
}) {
  const { locale } = useSitePreferences();
  const c = shopCopy[locale];
  const [cards, setCards] = useState<Card[]>([]);
  const [position, setPosition] = useState({ page, pages, total });
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const grid = useRef<HTMLDivElement>(null);
  const focusFrom = useRef<number | null>(null);
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);
  // The button can disappear after the last batch, so keyboard users continue from the first new product.
  useEffect(() => {
    if (focusFrom.current === null) return;
    grid.current?.children[focusFrom.current]?.querySelector<HTMLElement>("h2 a")?.focus({ preventScroll: true });
    focusFrom.current = null;
  }, [cards]);

  const address = (target: number) => `/products?${[query, `page=${target}`].filter(Boolean).join("&")}`;

  async function showMore() {
    if (busy) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setFailed(false);
    const target = position.page + 1;
    try {
      const response = await fetch(`/api/products/list?${[query, `page=${target}`].filter(Boolean).join("&")}`, { signal: controller.signal });
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json() as { products: Card[]; total: number; pages: number };
      // A product published in the meantime shifts the order; nothing should appear twice.
      const seen = new Set([...ids, ...cards.map(card => card.id)]);
      focusFrom.current = (grid.current?.children.length ?? 0);
      setCards([...cards, ...data.products.filter(card => !seen.has(card.id))]);
      setPosition({ page: target, pages: data.pages, total: data.total });
      window.history.replaceState(null, "", address(target));
    } catch (error) {
      if (!controller.signal.aborted) { setFailed(true); console.error(error); }
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  const more = position.page < position.pages;
  return <>
    <div className="shop-grid" ref={grid}>
      {children}
      {cards.map(({ assets, ...product }) => <ProductCard key={product.id} product={product} assets={assets} />)}
    </div>
    {position.pages > 1 && <div className="shop-more">
      <p className="shop-more-count" role="status">{Math.min(position.page * pageSize, position.total)} / {position.total}</p>
      {failed && <p className="shop-more-error" role="alert">{c.loadMoreFailed}</p>}
      {more && <Link className="button secondary" rel="next" href={address(position.page + 1)} scroll={false} aria-busy={busy} onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        void showMore();
      }}>{busy ? c.loadingMore : c.showMore}</Link>}
    </div>}
  </>;
}
