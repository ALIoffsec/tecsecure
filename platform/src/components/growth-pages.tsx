"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { CctvBuilder } from "./cctv-builder";
import { useSitePreferences } from "./site-preferences";
import { UiIcon } from "./ui-icon";
import { WorkCarousel, type WorkPost } from "./work-carousel";
import { growthCopy } from "@/lib/growth-copy";
import { checkoutCopy } from "@/lib/checkout-copy";
import { inquiryHref } from "@/lib/journey-copy";
import { buildNetworkEstimate } from "@/lib/network-estimate";
import { scoreSecurityCheck, securityQuestions } from "@/lib/security-check";
import { formatDate, formatNumber, formatMinor } from "@/lib/format";
import { trackGoal } from "@/lib/analytics";
import type { CompanyRequisites } from "@/lib/payment-card";

/* ---------- Estimate ---------- */
export function EstimateView() {
  const { locale } = useSitePreferences();
  const c = growthCopy[locale].estimate;
  const [tab, setTab] = useState<"network" | "cctv">("network");
  // Links from the home and services pages open the surveillance tab directly.
  useEffect(() => { if (new URLSearchParams(window.location.search).get("tab") === "cctv") setTab("cctv"); }, []);
  const [estimate, setEstimate] = useState<ReturnType<typeof buildNetworkEstimate> | null>(null);

  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const read = (name: string) => Math.max(0, Number(form.get(name)) || 0);
    setEstimate(buildNetworkEstimate({ workplaces: read("workplaces"), floors: Math.max(1, read("floors")), areaM2: read("area"), wifiUsers: read("users"), cameras: read("cameras"), server: form.get("server") === "on" }));
    trackGoal("estimate_built");
  }

  const rows: [string, string][] = estimate ? [
    [c.accessPoints, `${estimate.accessPoints} ${c.pcs}`],
    [c.ports, `${estimate.ports}`],
    ...estimate.switches.map(item => [item.ports === 48 ? c.switch48 : c.switch24, `${item.count} ${c.pcs}`] as [string, string]),
    [c.cable, `≈ ${formatNumber(estimate.cableMetres, 0)} m · ${estimate.cableBoxes} ${c.boxes}`],
    [c.router, `${estimate.routers} ${c.pcs}`],
    [c.rack, `${estimate.rackUnits}U`],
    [c.ups, `${estimate.ups} ${c.pcs}`],
    [c.poe, `≈ ${estimate.poeWatts} W`]
  ] : [];

  return <div className="container page-shell estimate-page">
    <div className="print-hide">
      <span className="eyebrow">{c.eyebrow}</span>
      <h1 className="page-title">{c.title}</h1>
      <p className="page-intro">{c.intro}</p>
      <div className="segmented estimate-tabs" role="group" aria-label={c.eyebrow}>
        <button type="button" aria-pressed={tab === "network"} onClick={() => setTab("network")}>{c.tabNetwork}</button>
        <button type="button" aria-pressed={tab === "cctv"} onClick={() => setTab("cctv")}>{c.tabCctv}</button>
      </div>
    </div>
    {tab === "cctv" && <CctvBuilder />}
    {tab === "network" && <>
      <form className="panel-card form estimate-form print-hide" onSubmit={calculate}>
        <div className="form-row">
          <div className="field"><label htmlFor="est-workplaces">{c.workplaces}</label><input id="est-workplaces" name="workplaces" type="number" min="1" max="5000" defaultValue="20" required /></div>
          <div className="field"><label htmlFor="est-floors">{c.floors}</label><input id="est-floors" name="floors" type="number" min="1" max="60" defaultValue="1" required /></div>
        </div>
        <div className="form-row">
          <div className="field"><label htmlFor="est-area">{c.area}</label><input id="est-area" name="area" type="number" min="10" max="200000" defaultValue="300" required /></div>
          <div className="field"><label htmlFor="est-users">{c.users}</label><input id="est-users" name="users" type="number" min="0" max="20000" defaultValue="30" required /></div>
        </div>
        <div className="form-row">
          <div className="field"><label htmlFor="est-cameras">{c.cameras}</label><input id="est-cameras" name="cameras" type="number" min="0" max="2000" defaultValue="0" required /></div>
          <label className="estimate-check"><input className="switch" type="checkbox" role="switch" name="server" />{c.server}</label>
        </div>
        <button className="button" type="submit">{c.build}</button>
      </form>
      {estimate && <section className="panel-card estimate-result" aria-live="polite">
        <header><div><strong className="estimate-brand">Tecsecure</strong><h2>{c.resultTitle}</h2></div><span className="small muted">{c.dateLabel}: {formatDate(new Date())}</span></header>
        <table className="table"><tbody>{rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table>
        <p className="small muted">{c.preliminary}</p>
        <div className="hero-actions print-hide">
          <button className="button secondary" type="button" onClick={() => window.print()}>{c.print}</button>
          <Link className="button" href={inquiryHref(`${c.tabNetwork}: ${rows.map(([label, value]) => `${label} ${value}`).join("; ")}`)}>{c.send}</Link>
        </div>
      </section>}
    </>}
  </div>;
}

/* ---------- Security check ---------- */
export function SecurityCheckView() {
  const { locale } = useSitePreferences();
  const c = growthCopy[locale].check;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const question = securityQuestions[index];

  function answer(value: number) {
    setAnswers(current => ({ ...current, [question.id]: value }));
    if (index === securityQuestions.length - 1) {
      setDone(true);
      trackGoal("security_check_done");
    } else {
      setIndex(index + 1);
    }
  }

  if (done) {
    const result = scoreSecurityCheck(answers);
    return <div className="container page-shell check-page">
      <span className="eyebrow">{c.eyebrow}</span>
      <section className="panel-card check-result" data-level={result.level}>
        <div className="check-score" style={{ "--score": `${result.percent * 3.6}deg` } as React.CSSProperties}><strong>{result.percent}%</strong></div>
        <div><span className="muted">{c.result}</span><h1>{c.levels[result.level]}</h1></div>
      </section>
      {result.weak.length > 0 && <section className="panel-card">
        <h2>{c.adviceTitle}</h2>
        <ol className="check-advice">{result.weak.map(item => <li key={item.id}>{item.advice[locale]}</li>)}</ol>
      </section>}
      <div className="hero-actions">
        <Link className="button" href={inquiryHref(`${c.eyebrow}: ${result.percent}%`)}>{c.cta}</Link>
        <Link className="button secondary" href="/sample-report">{c.audit}</Link>
        <button className="button ghost" type="button" onClick={() => { setAnswers({}); setIndex(0); setDone(false); }}>{c.again}</button>
      </div>
    </div>;
  }

  return <div className="container page-shell check-page">
    <span className="eyebrow">{c.eyebrow}</span>
    <h1 className="page-title">{c.title}</h1>
    {index === 0 && <p className="page-intro">{c.intro}</p>}
    <section className="panel-card check-question" key={question.id}>
      <div className="check-progress" aria-hidden="true"><i style={{ width: `${(index + 1) / securityQuestions.length * 100}%` }} /></div>
      <span className="small muted">{c.progress} {index + 1} / {securityQuestions.length}</span>
      <h2>{question.question[locale]}</h2>
      <div className="check-options">
        {[2, 1, 0].map(value => <button className="check-option" type="button" key={value} aria-pressed={answers[question.id] === value} onClick={() => answer(value)}>{question.options[value][locale]}</button>)}
      </div>
      {index > 0 && <button className="button ghost" type="button" onClick={() => setIndex(index - 1)}>← {c.back}</button>}
    </section>
  </div>;
}

/* ---------- Support plans ---------- */
export type PublicPlan = { id: string; name: string; interval: string; priceMinor: number | null; currency: string; features: string[] };

export function SupportPlansView({ plans }: { plans: PublicPlan[] }) {
  const { locale } = useSitePreferences();
  const c = growthCopy[locale].plans;
  const tiers = plans.length
    ? plans.map(plan => ({ name: plan.name, fit: "", features: plan.features, price: plan.priceMinor !== null ? `${formatMinor(plan.priceMinor, plan.currency, locale)}${/month|мес|oy/i.test(plan.interval) ? ` / ${c.perMonth}` : ""}` : c.priceOnRequest }))
    : c.tiers.map(tier => ({ ...tier, price: c.priceOnRequest }));
  const featured = tiers.length >= 3 ? 1 : -1;
  return <div className="container page-shell plans-page">
    <span className="eyebrow">{c.eyebrow}</span>
    <h1 className="page-title">{c.title}</h1>
    <p className="page-intro">{c.intro}</p>
    <div className="plans-grid">
      {tiers.map((tier, index) => <article className="panel-card plan-card" key={tier.name} data-featured={index === featured}>
        {index === featured && <span className="plan-badge">{c.popular}</span>}
        <h2>{tier.name}</h2>
        {tier.fit && <p className="muted small">{tier.fit}</p>}
        <p className="plan-price">{tier.price}</p>
        <ul>{tier.features.map(feature => <li key={feature}><UiIcon name="shield" size={15} />{feature}</li>)}</ul>
        <Link className={index === featured ? "button" : "button secondary"} href={inquiryHref(`${c.title}: ${tier.name}`)}>{c.choose}</Link>
      </article>)}
    </div>
    <section className="panel-card plans-how">
      <h2>{c.how}</h2>
      <ol>{c.steps.map(step => <li key={step}>{step}</li>)}</ol>
      <p className="small muted">{c.note}</p>
    </section>
  </div>;
}

/* ---------- Corporate learning ---------- */
export function BusinessLearningView() {
  const { locale } = useSitePreferences();
  const c = growthCopy[locale].business;
  return <div className="container page-shell business-page">
    <span className="eyebrow">{c.eyebrow}</span>
    <h1 className="page-title">{c.title}</h1>
    <p className="page-intro">{c.intro}</p>
    <div className="plans-grid">{c.offers.map(offer => <article className="panel-card" key={offer.title}><h2>{offer.title}</h2><p className="muted">{offer.text}</p></article>)}</div>
    <section className="panel-card plans-how">
      <h2>{c.benefitsTitle}</h2>
      <ul>{c.benefits.map(item => <li key={item}>{item}</li>)}</ul>
    </section>
    <div className="hero-actions">
      <Link className="button" href={inquiryHref(c.title)}>{c.cta}</Link>
      <Link className="button secondary" href="/learning">{c.catalog}</Link>
    </div>
  </div>;
}

/* ---------- Project story ---------- */
export type WorkStory = WorkPost & { slug: string; location: string | null; task: string | null; work: string | null; result: string | null; clientName: string | null; clientRole: string | null; clientQuote: string | null };

export function WorkStoryView({ post }: { post: WorkStory }) {
  const { locale } = useSitePreferences();
  const c = growthCopy[locale].work;
  const sections = [[c.task, post.task], [c.done, post.work], [c.result, post.result]].filter((row): row is [string, string] => Boolean(row[1]));
  return <article className="container page-shell work-story">
    <Link className="small text-link" href="/work">← {c.all}</Link>
    <span className="eyebrow">{c.story}{post.location ? ` · ${post.location}` : ""}</span>
    <h1 className="page-title">{post.title}</h1>
    <p className="page-intro">{post.description}</p>
    <WorkCarousel posts={[post]} />
    {sections.length > 0 && <div className="work-story-grid">{sections.map(([title, text]) => <section className="panel-card" key={title}><h2>{title}</h2><p>{text}</p></section>)}</div>}
    {post.clientQuote && <blockquote className="panel-card work-quote"><p>“{post.clientQuote}”</p>{post.clientName && <footer><strong>{post.clientName}</strong>{post.clientRole ? ` · ${post.clientRole}` : ""}</footer>}</blockquote>}
    <aside className="work-cta"><h2>{c.cta}</h2><Link className="button" href={inquiryHref(post.title)}>{c.ctaButton}</Link></aside>
  </article>;
}

export function WorkProjectList({ posts }: { posts: WorkStory[] }) {
  const { locale } = useSitePreferences();
  const c = growthCopy[locale].work;
  if (!posts.length) return null;
  return <section className="work-projects">
    <h2>{c.list}</h2>
    <div className="plans-grid">{posts.map(post => {
      const cover = Array.isArray(post.media) ? post.media.find((id): id is string => typeof id === "string") : undefined;
      return <Link className="panel-card work-project" href={`/work/${post.slug}`} key={post.id}>
        {cover && <img src={`/api/media/${cover}`} alt="" loading="lazy" onError={event => { event.currentTarget.style.display = "none"; }} />}
        <strong>{post.title}</strong>
        {post.location && <span className="small muted">{post.location}</span>}
        <span className="text-link small">{c.more} →</span>
      </Link>;
    })}</div>
  </section>;
}

/* ---------- Invoice ---------- */
export type InvoiceOrder = { reference: string; createdAt: Date | string; companyName: string | null; companyTin: string | null; recipientName: string; totalMinor: number | null; currency: string; deliveryMethod?: string | null; deliveryFeeMinor?: number | null; vatMinor?: number | null; items: { id: string; name: string; quantity: number; unitPriceMinor: number | null }[] };

export function InvoiceView({ order, seller }: { order: InvoiceOrder; seller: CompanyRequisites | null }) {
  const { locale } = useSitePreferences();
  const c = growthCopy[locale].invoice;
  const d = checkoutCopy[locale];
  const money = (value: number | null) => value === null ? "—" : formatMinor(value, order.currency, locale);
  return <div className="container page-shell invoice-page">
    <section className="panel-card invoice">
      <header className="invoice-head"><div><strong className="estimate-brand">Tecsecure</strong><h1>{c.title}</h1></div><dl><dt>{c.number}</dt><dd>{order.reference}</dd><dt>{c.date}</dt><dd>{formatDate(order.createdAt)}</dd></dl></header>
      {!seller && <p role="alert">{c.unavailable}</p>}
      <div className="invoice-parties">
        {seller && <div><h2>{c.seller}</h2><p><strong>{seller.legalName}</strong></p><p>{c.tin}: {seller.tin}</p>{seller.address && <p>{c.address}: {seller.address}</p>}<p>{c.bank}: {seller.bankName}</p><p>{c.account}: {seller.account}</p><p>{c.mfo}: {seller.mfo}</p></div>}
        <div><h2>{c.buyer}</h2><p><strong>{order.companyName ?? order.recipientName}</strong></p>{order.companyTin && <p>{c.tin}: {order.companyTin}</p>}</div>
      </div>
      <table className="table invoice-table">
        <thead><tr><th>{c.item}</th><th>{c.qty}</th><th>{c.price}</th><th>{c.sum}</th></tr></thead>
        <tbody>
          {order.items.map(item => <tr key={item.id}><td>{item.name}</td><td>{item.quantity}</td><td>{money(item.unitPriceMinor)}</td><td>{money(item.unitPriceMinor === null ? null : item.unitPriceMinor * item.quantity)}</td></tr>)}
          {order.deliveryFeeMinor != null && order.deliveryFeeMinor > 0 && <tr><td>{d.deliveryRow}{order.deliveryMethod === "EXPRESS" || order.deliveryMethod === "COURIER" ? `: ${d.delivery[order.deliveryMethod].title}` : ""}</td><td>1</td><td>{money(order.deliveryFeeMinor)}</td><td>{money(order.deliveryFeeMinor)}</td></tr>}
        </tbody>
        <tfoot>
          <tr><th colSpan={3}>{c.total}</th><td><strong>{money(order.totalMinor)}</strong></td></tr>
          {order.vatMinor != null && <tr><th colSpan={3}>{d.vatIncluded}</th><td>{money(order.vatMinor)}</td></tr>}
        </tfoot>
      </table>
      <p><strong>{c.purpose}:</strong> {c.purposeText} {order.reference}</p>
      <p className="small muted">{c.note}</p>
      <div className="hero-actions print-hide"><button className="button" type="button" onClick={() => window.print()}>{c.print}</button><Link className="button ghost" href="/portal/orders">←</Link></div>
    </section>
  </div>;
}

/* ---------- Language of a page found through search ---------- */
export function SeoLocale({ language }: { language: "uz" | "ru" }) {
  const { setLocale } = useSitePreferences();
  useEffect(() => {
    // A saved choice wins; otherwise the menu follows the language the visitor searched in.
    if (!document.cookie.split("; ").some(cookie => cookie.startsWith("tecsecure-preferences="))) setLocale(language);
  }, [language, setLocale]);
  return null;
}
