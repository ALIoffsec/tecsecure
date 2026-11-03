"use client";

import { useSitePreferences } from "./site-preferences";
import { shopCopy, type ShopKey } from "@/lib/shop-copy";
export function ShopText({ id }: { id: ShopKey }) {
  const { locale } = useSitePreferences();
  return <>{shopCopy[locale][id]}</>;
}
export function ShopSearchInput({ value }: { value?: string }) {
  const { locale } = useSitePreferences();
  return <input id="shop-search" type="search" name="q" defaultValue={value ?? ""} maxLength={80} placeholder={shopCopy[locale].search} />;
}
