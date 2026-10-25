"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";

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

export function AddToCartButton({ product, disabled }: { product: Omit<CartLine, "quantity">; disabled?: boolean }) {
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(t);
  }, [added]);
  const label = disabled ? "Omborda yo‘q" : added ? "Savatga qo‘shildi" : "Savatga qo‘shish";
  return <button type="button" className="button shop-add-to-cart" aria-label={label} title={label} disabled={disabled} onClick={() => { addToCart(product); setAdded(true); }}>
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 1.9-1.5L21 8H6" />
      <circle cx="10" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
    <span className="shop-add-label">{disabled ? "Omborda yo‘q" : added ? "Savatga qo‘shildi" : "Savatga qo‘shish"}</span>
  </button>;
}

export function CartFab() {
  const lines = useCart();
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  if (count === 0) return null;
  return <Link className="shop-fab" href="/cart" aria-label={`Savat: ${count} ta mahsulot`}>
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 1.9-1.5L21 8H6" />
      <circle cx="10" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
    <span>Savat</span>
    <b>{count}</b>
  </Link>;
}