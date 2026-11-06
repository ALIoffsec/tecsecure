"use client";

import { useRouter } from "next/navigation";
import { rememberSearch, SearchField, SearchResultRow, useSearchSuggestions } from "./search-field";
import { useSitePreferences } from "./site-preferences";
import { siteCopy } from "@/lib/site-copy";
import Link from "next/link";

export function SearchResults({ query }: { query: string }) {
  const { locale } = useSitePreferences();
  const c = siteCopy[locale].search;
  const router = useRouter();
  const { data, loading } = useSearchSuggestions(query, "all", 30);
  return <div className="container page-shell search-page">
    <h1 className="page-title">{c.pageTitle}</h1>
    <form className="search-page-form" action="/search" role="search" onSubmit={event => {
      event.preventDefault();
      const value = String(new FormData(event.currentTarget).get("q") ?? "").trim();
      if (!value) return;
      rememberSearch(value);
      router.push(`/search?q=${encodeURIComponent(value)}`);
    }}>
      <SearchField key={query} id="global-query" defaultValue={query} />
      <button className="button" type="submit">{c.submit}</button>
    </form>
    {query && data && !loading && <p className="muted search-page-count" role="status">{data.total > 0 ? `${c.foundLabel}: ${data.total}` : ""}</p>}
    {query && loading && !data && <p className="muted" role="status">{c.loading}</p>}
    {query && data && data.total === 0 && !loading && <div className="empty-state search-none">
      <strong>{c.noResults}</strong>
      <p>{c.noResultsHint}</p>
      <Link className="button" href="/request-service">{c.askUs}</Link>
    </div>}
    {query && data && data.total > 0 && <div className="search-page-groups">
      {data.groups.map(group => <section className="panel-card search-group" key={group.group}>
        <h2>{c.groups[group.group]} <span className="muted small">({group.items.length})</span></h2>
        {group.items.map(item => <SearchResultRow key={item.id} item={item} query={query} />)}
      </section>)}
    </div>}
  </div>;
}
