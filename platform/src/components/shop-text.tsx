"use client";

import { SearchField } from "./search-field";
import { siteCopy } from "@/lib/site-copy";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "./site-preferences";
import { shopCopy, type ShopKey } from "@/lib/shop-copy";

export function ShopText({ id }: { id: ShopKey }) {
  const { locale } = useSitePreferences();
  return <>{shopCopy[locale][id]}</>;
}

export function ShopSearchInput({ value }: { value?: string }) {
  const { locale } = useSitePreferences();
  return <SearchField id="shop-search" scope="products" defaultValue={value ?? ""} placeholder={siteCopy[locale].search.shopPlaceholder} resultsHref={query => `/products?q=${encodeURIComponent(query)}`} />;
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
