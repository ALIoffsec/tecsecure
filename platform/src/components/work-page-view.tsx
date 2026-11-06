"use client";

import Link from "next/link";
import { WorkCarousel, type WorkPost } from "./work-carousel";
import { useSitePreferences } from "./site-preferences";
import { siteCopy } from "@/lib/site-copy";

export function WorkPageView({ posts }: { posts: WorkPost[] }) {
  const { locale, t } = useSitePreferences();
  const c = siteCopy[locale].work;
  const shots = posts.reduce((sum, post) => sum + (Array.isArray(post.media) ? post.media.length : 0), 0);
  return <section className="container page-shell work-page">
    <span className="eyebrow">{c.eyebrow}</span>
    <h1 className="page-title">{c.title}</h1>
    <p className="page-intro">{c.intro}</p>
    {posts.length > 0 && <p className="work-stats"><b>{posts.length}</b> {c.projects} · <b>{shots}</b> {c.shots}</p>}
    {posts.length ? <WorkCarousel posts={posts} /> : <div className="empty-state">{t("sitePortfolioEmpty")}</div>}
    <aside className="work-cta">
      <div><h2>{c.cta}</h2><p className="muted">{c.ctaHint}</p></div>
      <Link className="button" href="/request-service">{c.ctaButton}</Link>
    </aside>
  </section>;
}
