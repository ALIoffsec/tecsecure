"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSitePreferences } from "./site-preferences";
import { shopCopy } from "@/lib/shop-copy";

export type CartLine = { productId: string; name: string; slug: string; categorySlug?: string | null; quantity: number };

const KEY = "tecsecure-cart-v1";
const EVENT = "tecsecure-cart-change";
let cachedRaw: string | null = null;
let cachedValue: CartLine[] = [];

function parse(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter((l) => l && typeof l.productId === "string" && typeof l.name === "string" && typeof l.slug === "string" && Number.isInteger(l.quantity) && l.quantity > 0)
      .slice(0, 50)
      .map((l) => ({ productId: l.productId, name: l.name, slug: l.slug, categorySlug: typeof l.categorySlug === "string" ? l.categorySlug : null, quantity: Math.min(l.quantity, 999) }));
  } catch {
    return [];
  }
}

function snapshot(): CartLine[] {
  const raw = window.localStorage.getItem(KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parse(raw);
  }
  return cachedValue;
}

const empty: CartLine[] = [];

export function useCart() {
  const lines = useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      window.addEventListener("storage", cb);
      return () => {
        window.removeEventListener(EVENT, cb);
        window.removeEventListener("storage", cb);
      };
    },
    snapshot,
    () => empty
  );
  return lines;
}

function write(lines: CartLine[]) {
  window.localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(EVENT));
}

export function addToCart(line: Omit<CartLine, "quantity">, quantity = 1) {
  const current = snapshot();
  const found = current.find((l) => l.productId === line.productId);
  write(found
    ? current.map((l) => (l.productId === line.productId ? { ...l, quantity: Math.min(l.quantity + quantity, 999) } : l))
    : [...current, { ...line, quantity }]);
}

export function setQuantity(productId: string, quantity: number) {
  write(snapshot().flatMap((l) => (l.productId === productId ? (quantity > 0 ? [{ ...l, quantity: Math.min(quantity, 999) }] : []) : [l])));
}

export function clearCart() {
  write([]);
}

export function CartIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 1.9-1.5L21 8H6" />
    <circle cx="10" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
  </svg>;
}

// A double tap on "add" must not also press the "go to cart" link that takes its place.
const DOUBLE_TAP_MS = 400;

export function AddToCartButton({ product, disabled }: { product: Omit<CartLine, "quantity">; disabled?: boolean }) {
  const { locale } = useSitePreferences();
  const c = shopCopy[locale];
  const quantity = useCart().find((line) => line.productId === product.productId)?.quantity ?? 0;
  const addedAt = useRef(0);
  const root = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  // The control that was pressed is replaced, so keyboard focus moves to the one that took its place.
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    root.current?.querySelector<HTMLElement>("a, button")?.focus({ preventScroll: true });
  }, [quantity]);
  if (disabled || quantity === 0) {
    return <div className="shop-cart-action" ref={root}>
      <button type="button" className="button shop-add-to-cart" disabled={disabled} onClick={() => { addedAt.current = Date.now(); moveFocus.current = true; addToCart(product); }}>
        <CartIcon />
        <span className="shop-add-label">{disabled ? c.OUT_OF_STOCK : c.add}</span>
      </button>
    </div>;
  }
  return <div className="shop-cart-action" ref={root}>
    <Link className="button shop-add-to-cart" href="/cart" onClick={(event) => { if (Date.now() - addedAt.current < DOUBLE_TAP_MS) event.preventDefault(); }}>
      <CartIcon />
      <span className="shop-add-label">{c.goToCart}</span>
    </Link>
    <div className="shop-qty" role="group" aria-label={product.name}>
      <button type="button" aria-label={c.decrease} onClick={() => { if (quantity === 1) moveFocus.current = true; setQuantity(product.productId, quantity - 1); }}>−</button>
      <span aria-live="polite">{quantity}</span>
      <button type="button" aria-label={c.increase} disabled={quantity >= 999} onClick={() => addToCart(product)}>+</button>
    </div>
  </div>;
}

