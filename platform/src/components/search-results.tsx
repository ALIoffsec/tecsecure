"use client";

import Link from "next/link";
import { useSitePreferences } from "./site-preferences";
import { useLearningCatalog } from "./learning-catalog-context";
import { journeyCopy } from "@/lib/journey-copy";
import { serviceJourneys } from "@/lib/service-journeys";

type Result = { id: string; name: string; slug: string; description: string };
export function SearchResults({ query, products, services }: { query: string; products: Result[]; services: Result[] }) {
  const { locale } = useSitePreferences();
  const c = journeyCopy[locale];
  const catalog = useLearningCatalog();
  const includes = (text: string) => text.toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale));
  const topics = query ? catalog.modules.filter(module => includes(`${module.title[locale]} ${module.summary[locale]}`)) : [];
  const needs = query ? serviceJourneys[locale].filter(item => includes(`${item.title} ${item.summary} ${item.scope} ${item.prepare}`)) : [];
  const groups = [
    { title: c.services, href: "/services", items: [...needs.map(item => ({ id: item.id, name: item.title, description: item.summary, href: `/services#need-${item.id}` })), ...services.map(item => ({ ...item, href: `/services/${item.slug}` }))] },
    { title: c.learning, href: "/learning/modules", items: topics.map(module => ({ id: module.slug, name: module.title[locale], description: module.summary[locale], href: `/learning/${module.slug}` })) },
    { title: c.shop, href: `/products?q=${encodeURIComponent(query)}`, items: products.map(item => ({ ...item, href: `/products/${item.slug}` })) }
  ];
  return <div className="container page-shell">
    <h1 className="page-title">{c.searchTitle}</h1>
    <p className="muted">{c.searchStart}</p>
    <form className="hub-search" action="/search" role="search">
      <label htmlFor="global-query">{c.search}</label><div><input id="global-query" type="search" name="q" defaultValue={query} maxLength={80} required placeholder={c.searchHint} /><button className="button">{c.search}</button></div>
    </form>
    {query && <div className="search-results">{groups.map(group => <section className="panel-card" key={group.title}>
      <h2>{group.title} <span className="muted small">({group.items.length})</span></h2>
      {group.items.length ? <ul>{group.items.map(item => <li key={item.id}><Link href={item.href}>{item.name} →</Link><p>{item.description}</p></li>)}</ul> : <p className="muted">{c.searchEmpty}</p>}
      <Link href={group.href} className="text-link">{c.more} →</Link>
    </section>)}</div>}
  </div>;
}
