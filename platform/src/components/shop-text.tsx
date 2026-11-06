"use client";

import { useRouter } from "next/navigation";
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

export function ShopSortSelect({ value, options }: { value: string; options: { value: ShopKey; href: string }[] }) {
  const { locale } = useSitePreferences();
  const router = useRouter();
  const c = shopCopy[locale];
  return <label className="shop-sort">
    <span>{c.sort}</span>
    <select value={value} onChange={event => {
      const next = options.find(option => option.value === event.currentTarget.value);
      if (next) router.push(next.href);
    }}>
      {options.map(option => <option key={option.value} value={option.value}>{c[option.value]}</option>)}
    </select>
  </label>;
}
