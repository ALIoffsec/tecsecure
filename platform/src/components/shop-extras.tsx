"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSitePreferences } from "./site-preferences";
import { UiIcon, type IconName } from "./ui-icon";
import { siteCopy } from "@/lib/site-copy";
import { defaultContact } from "@/lib/site-contact";
import { formatMinor } from "@/lib/format";
import { addToCart } from "./cart";

const RECENT_KEY = "tecsecure-recent-products";
const RECENT_LIMIT = 8;
type RecentProduct = { slug: string; name: string; imageId: string | null; priceMinor: number | null; currency: string };

function readRecent(): RecentProduct[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(item => typeof item?.slug === "string" && typeof item?.name === "string").slice(0, RECENT_LIMIT) : [];
  } catch {
    return [];
  }
}

/** Remembers the product on this device only, so it can be offered again later. */
export function TrackProductView({ product }: { product: RecentProduct }) {
  const { slug, name, imageId, priceMinor, currency } = product;
  useEffect(() => {
    try {
      const next = [{ slug, name, imageId, priceMinor, currency }, ...readRecent().filter(item => item.slug !== slug)].slice(0, RECENT_LIMIT);
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch { /* a private window simply has no history */ }
  }, [slug, name, imageId, priceMinor, currency]);
  return null;
}

export function RecentlyViewed({ exclude }: { exclude?: string }) {
  const { locale } = useSitePreferences();
  const c = siteCopy[locale].shop;
  const [items, setItems] = useState<RecentProduct[]>([]);
  useEffect(() => { setItems(readRecent().filter(item => item.slug !== exclude)); }, [exclude]);
  if (!items.length) return null;
  return <section className="recent-products" aria-labelledby="recent-products-title">
    <div><h2 id="recent-products-title">{c.recent}</h2><p className="small muted">{c.recentHint}</p></div>
    <div className="recent-products-row">
      {items.map(item => <Link className="recent-product" href={`/products/${item.slug}`} key={item.slug}>
        <span className="recent-product-image">{item.imageId ? <img src={`/api/media/${item.imageId}`} alt="" loading="lazy" /> : <UiIcon name="box" size={24} />}</span>
        <span className="recent-product-text"><strong>{item.name}</strong>{item.priceMinor !== null && <small>{formatMinor(item.priceMinor, item.currency, locale)}</small>}</span>
      </Link>)}
    </div>
  </section>;
}

export function ProductTrust() {
  const { locale } = useSitePreferences();
  const c = siteCopy[locale].shop.trust;
  const items: { icon: IconName; title: string; hint: string }[] = [
    { icon: "box", title: c.delivery, hint: c.deliveryHint },
    { icon: "shield", title: c.warranty, hint: c.warrantyHint },
    { icon: "toolbox", title: c.install, hint: c.installHint }
  ];
  return <ul className="product-trust">
    {items.map(item => <li key={item.title}><UiIcon name={item.icon} size={20} /><span><strong>{item.title}</strong><small>{item.hint}</small></span></li>)}
  </ul>;
}

/** On phones the buy box scrolls away quickly; this keeps the price and the button within reach. */
export function MobileBuyBar({ line, priceMinor, currency, available, anchor }: {
  line: { productId: string; slug: string; name: string; categorySlug?: string | null };
  priceMinor: number | null;
  currency: string;
  available: boolean;
  anchor: string;
}) {
  const { locale } = useSitePreferences();
  const c = siteCopy[locale].shop;
  const [visible, setVisible] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    const target = document.querySelector(anchor);
    if (!target) return;
    observer.current = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.current.observe(target);
    return () => observer.current?.disconnect();
  }, [anchor]);
  if (!available) return null;
  return <div className="mobile-buy-bar" data-visible={visible} aria-hidden={!visible}>
    <strong>{priceMinor !== null ? formatMinor(priceMinor, currency, locale) : siteCopy[locale].orders.totalPending}</strong>
    <button className="button" type="button" tabIndex={visible ? 0 : -1} onClick={() => addToCart(line)}>{c.buy}</button>
  </div>;
}

/** A person is one tap away on the pages where people are deciding whether to call. */
export function ContactDock() {
  const pathname = usePathname();
  const { locale } = useSitePreferences();
  const c = siteCopy[locale];
  const relevant = ["/services", "/cybersecurity", "/monitoring", "/consultation"].some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!relevant) return null;
  return <div className="contact-dock">
    <a href={`tel:${defaultContact.phone}`} aria-label={c.contactDock.call} title={c.contactDock.call}><UiIcon name="phone" size={20} /><span>{c.contactDock.call}</span></a>
    <a href={`https://t.me/${defaultContact.telegram.replace("@", "")}`} target="_blank" rel="noreferrer" aria-label="Telegram" title="Telegram"><UiIcon name="send" size={20} /><span>Telegram</span></a>
  </div>;
}
