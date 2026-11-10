"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSitePreferences } from "./site-preferences";
import { ToastMessage } from "./toast-provider";
import { BottomActions, TabIcon, TmaShell, callNumber, confirmAction, haptic, sendJson, telegramApp, useBackButton } from "./tma-kit";
import { longDay, tmaCopy } from "@/lib/tma-copy";
import { siteCopy } from "@/lib/site-copy";
import { regionNames, type RegionCode } from "@/lib/delivery";
import { formatDateTime, formatMinor } from "@/lib/format";
import { nextStatuses, type OrderStatusValue } from "@/lib/orders";
import { translateMessage } from "@/lib/server-messages";
import type { MessageKey } from "@/lib/messages";
import type { StaffDesk } from "@/lib/staff-desk";

type Request = NonNullable<StaffDesk["requests"]>[number];
type Order = NonNullable<StaffDesk["orders"]>[number];
type Tab = "today" | "requests" | "orders" | "profile";
type Detail = { kind: "request" | "order"; id: string } | null;

const requestStatusKey: Record<string, MessageKey> = {
  NEW: "requestStatusNew", UNDER_REVIEW: "requestStatusReview", CONTACTED: "requestStatusContacted", INSPECTION_REQUIRED: "requestStatusInspection",
  QUOTATION_SENT: "requestStatusQuotation", APPROVED: "requestStatusApproved", IN_PROGRESS: "requestStatusInProgress", COMPLETED: "requestStatusCompleted",
  REJECTED: "requestStatusRejected", CANCELLED: "requestStatusCancelled"
};
/** The usual next step for a request, offered as the big button; the other allowed steps sit below it. */
const requestNext: Record<string, string[]> = {
  NEW: ["UNDER_REVIEW", "CONTACTED", "REJECTED", "CANCELLED"],
  UNDER_REVIEW: ["CONTACTED", "INSPECTION_REQUIRED", "QUOTATION_SENT", "REJECTED", "CANCELLED"],
  CONTACTED: ["QUOTATION_SENT", "INSPECTION_REQUIRED", "APPROVED", "REJECTED", "CANCELLED"],
  INSPECTION_REQUIRED: ["QUOTATION_SENT", "REJECTED", "CANCELLED"],
  QUOTATION_SENT: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"]
};
const dangerous = new Set(["REJECTED", "CANCELLED"]);
const needsReceiptCheck = (order: Order) => order.paymentStatus === "AWAITING_CONFIRMATION" || (order.paymentStatus === "AWAITING_PAYMENT" && order.paymentMethod === "BANK_TRANSFER");

export function StaffMiniApp({ desk }: { desk: StaffDesk }) {
  const { locale, t } = useSitePreferences();
  const c = tmaCopy[locale].staff;
  const copy = siteCopy[locale];
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("today");
  const [detail, setDetail] = useState<Detail>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [requestFilter, setRequestFilter] = useState<"new" | "active" | "all">("new");
  const [orderFilter, setOrderFilter] = useState<"proof" | "all">("all");

  const requests = desk.requests;
  const orders = desk.orders;
  const newRequests = requests?.filter(item => item.status === "NEW") ?? [];
  const receiptOrders = orders?.filter(needsReceiptCheck) ?? [];
  const openRequest = detail?.kind === "request" ? requests?.find(item => item.id === detail.id) ?? null : null;
  const openOrder = detail?.kind === "order" ? orders?.find(item => item.id === detail.id) ?? null : null;

  // A finished item drops out of the lists after the refresh; its screen closes with it.
  useEffect(() => {
    if (detail && !openRequest && !openOrder) setDetail(null);
  }, [detail, openRequest, openOrder]);

  async function act(url: string, method: string, body: object, danger = false) {
    if (busy) return;
    if (danger && !(await confirmAction(c.confirmDanger))) return;
    setBusy(true); setError(""); setNotice("");
    const result = await sendJson("staff", url, method, body);
    setBusy(false);
    if (!result.ok) {
      haptic.error();
      setError(result.error ? translateMessage(result.error, locale) : c.failed);
      return;
    }
    haptic.success();
    setNotice(c.done);
    router.refresh();
  }

  const open = (kind: "request" | "order", id: string) => { haptic.tap(); setDetail({ kind, id }); window.scrollTo(0, 0); };
  const close = () => { setDetail(null); };
  useBackButton(detail ? close : null);

  const requestStatus = (status: string) => requestStatusKey[status] ? t(requestStatusKey[status]) : status;
  const money = (minor: number | null, currency = "UZS") => minor === null ? copy.orders.totalPending : formatMinor(minor, currency, locale);
  const timeOf = (value: Date | string) => formatDateTime(value);

  const toasts = <><ToastMessage message={error} variant="error" /><ToastMessage message={notice} variant="success" /></>;

  if (openRequest) {
    const steps = requestNext[openRequest.status] ?? [];
    const [primary, ...others] = steps;
    return <TmaShell app="staff">
      {toasts}
      <header className="tma-detail-head">
        <span className="tma-eyebrow">{openRequest.reference}</span>
        <h1>{openRequest.name}</h1>
        <span className={`tma-pill is-${openRequest.status.toLowerCase()}`}>{requestStatus(openRequest.status)}</span>
      </header>
      <section className="tma-section">
        <dl className="tma-rows">
          {openRequest.service && <div><dt>{c.service}</dt><dd>{openRequest.service.name}</dd></div>}
          <div><dt>{c.contact}</dt><dd><a href={`tel:${openRequest.phone.replace(/[^\d+]/g, "")}`}>{openRequest.phone}</a>{openRequest.email ? <><br />{openRequest.email}</> : null}</dd></div>
          {openRequest.organizationName && <div><dt>{c.organization}</dt><dd>{openRequest.organizationName}</dd></div>}
          {openRequest.city && <div><dt>{c.city}</dt><dd>{openRequest.city}</dd></div>}
          {openRequest.location && <div><dt>{c.location}</dt><dd>{openRequest.location}</dd></div>}
          {openRequest.budgetRange && <div><dt>{c.budget}</dt><dd>{openRequest.budgetRange}</dd></div>}
          {openRequest.preferredContactTime && <div><dt>{c.contactTime}</dt><dd>{openRequest.preferredContactTime}</dd></div>}
          <div><dt>{c.createdAt}</dt><dd>{timeOf(openRequest.createdAt)}</dd></div>
        </dl>
      </section>
      <h2 className="tma-section-title">{c.description}</h2>
      <section className="tma-section"><p className="tma-text">{openRequest.description}</p></section>
      {others.length > 0 && <>
        <h2 className="tma-section-title">{c.otherSteps}</h2>
        <section className="tma-section tma-list">
          {others.map(status => <button key={status} type="button" className={`tma-row-button${dangerous.has(status) ? " is-danger" : ""}`} disabled={busy}
            onClick={() => void act(`/api/requests/${openRequest.id}`, "PATCH", { status }, dangerous.has(status))}>{c.requestAction[status] ?? status}</button>)}
        </section>
      </>}
      <BottomActions
        main={primary ? { text: c.requestAction[primary] ?? primary, busy, tone: dangerous.has(primary) ? "danger" : "primary", onClick: () => void act(`/api/requests/${openRequest.id}`, "PATCH", { status: primary }, dangerous.has(primary)) } : null}
        secondary={{ text: c.call, onClick: () => callNumber(openRequest.phone) }} />
    </TmaShell>;
  }

  if (openOrder) {
    const next = nextStatuses(openOrder.status as OrderStatusValue);
    const forward = next.find(status => status !== "CANCELLED");
    const receipt = needsReceiptCheck(openOrder);
    const region = openOrder.region && regionNames[locale][openOrder.region as RegionCode];
    return <TmaShell app="staff">
      {toasts}
      <header className="tma-detail-head">
        <span className="tma-eyebrow">{openOrder.reference}</span>
        <h1>{openOrder.recipientName}</h1>
        <span className={`tma-pill is-${openOrder.status.toLowerCase()}`}>{copy.orders.status[openOrder.status] ?? openOrder.status}</span>
      </header>
      <h2 className="tma-section-title">{c.items}</h2>
      <section className="tma-section tma-list">
        {openOrder.items.map(item => <div className="tma-line" key={item.id}>
          <span className="tma-line-name">{item.name}</span>
          <span className="tma-line-qty">× {item.quantity}</span>
          <span className="tma-line-sum">{item.unitPriceMinor !== null ? formatMinor(item.unitPriceMinor * item.quantity, openOrder.currency, locale) : "—"}</span>
        </div>)}
        {openOrder.itemsTotalMinor !== null && openOrder.deliveryFeeMinor !== null && <>
          <div className="tma-line is-sub"><span className="tma-line-name">{c.goods}</span><span className="tma-line-sum">{formatMinor(openOrder.itemsTotalMinor, openOrder.currency, locale)}</span></div>
          <div className="tma-line is-sub"><span className="tma-line-name">{c.deliveryFee}</span><span className="tma-line-sum">{formatMinor(openOrder.deliveryFeeMinor, openOrder.currency, locale)}</span></div>
        </>}
        <div className="tma-line is-total"><span className="tma-line-name">{c.total}</span><span className="tma-line-sum">{money(openOrder.totalMinor, openOrder.currency)}</span></div>
      </section>
      <section className="tma-section">
        <dl className="tma-rows">
          <div><dt>{c.contact}</dt><dd><a href={`tel:${openOrder.phone.replace(/[^\d+]/g, "")}`}>{openOrder.phone}</a></dd></div>
          {openOrder.companyName && <div><dt>{c.company}</dt><dd>{openOrder.companyName}</dd></div>}
          <div><dt>{c.delivery}</dt><dd>{[openOrder.deliveryMethod ? c.deliveryMethod[openOrder.deliveryMethod] ?? openOrder.deliveryMethod : null, region, openOrder.city, openOrder.address].filter(Boolean).join(", ")}</dd></div>
          <div><dt>{c.payment}</dt><dd>{copy.orders.method[openOrder.paymentMethod] ?? openOrder.paymentMethod} · {copy.orders.paymentStatus[openOrder.paymentStatus] ?? openOrder.paymentStatus}</dd></div>
          {openOrder.note && <div><dt>{c.note}</dt><dd>{openOrder.note}</dd></div>}
          <div><dt>{c.createdAt}</dt><dd>{timeOf(openOrder.createdAt)}</dd></div>
        </dl>
      </section>
      <section className="tma-section tma-list">
        {openOrder.paymentProofMediaId && <a className="tma-row-button" href={`/api/media/${openOrder.paymentProofMediaId}`} target="_blank" rel="noreferrer">{c.proof}</a>}
        {receipt && forward && <button type="button" className="tma-row-button" disabled={busy} onClick={() => void act(`/api/orders/${openOrder.id}`, "PATCH", { status: forward })}>{copy.orders.statusAction[forward]}</button>}
        {next.includes("CANCELLED") && <button type="button" className="tma-row-button is-danger" disabled={busy} onClick={() => void act(`/api/orders/${openOrder.id}`, "PATCH", { status: "CANCELLED" }, true)}>{copy.orders.statusAction.CANCELLED}</button>}
      </section>
      <BottomActions
        main={receipt
          ? { text: c.confirmPayment, busy, onClick: () => void act(`/api/orders/${openOrder.id}`, "PATCH", { paymentStatus: "PAID" }) }
          : forward ? { text: copy.orders.statusAction[forward], busy, onClick: () => void act(`/api/orders/${openOrder.id}`, "PATCH", { status: forward }) } : null}
        secondary={{ text: c.call, onClick: () => callNumber(openOrder.phone) }} />
    </TmaShell>;
  }

  const tabs = [
    { id: "today", label: c.tabs.today, icon: TabIcon.today },
    { id: "requests", label: c.tabs.requests, icon: TabIcon.requests, badge: newRequests.length },
    { id: "orders", label: c.tabs.orders, icon: TabIcon.orders, badge: receiptOrders.length },
    { id: "profile", label: c.tabs.profile, icon: TabIcon.profile }
  ];

  return <TmaShell app="staff" tabs={tabs} active={tab} onTab={id => { setTab(id as Tab); window.scrollTo(0, 0); }}>
    {toasts}
    {tab === "today" && todayScreen()}

    {tab === "requests" && <>
      <h1 className="tma-title">{c.tabs.requests}</h1>
      {!requests ? <p className="tma-empty">{c.noAccess}</p> : <>
        {segmented(requestFilter, value => setRequestFilter(value as typeof requestFilter), [
          ["new", `${c.filterNew} · ${newRequests.length}`], ["active", `${c.filterActive} · ${requests.length - newRequests.length}`], ["all", `${c.filterAll} · ${requests.length}`]
        ])}
        {requestList(requests.filter(item => requestFilter === "all" || (requestFilter === "new" ? item.status === "NEW" : item.status !== "NEW")))}
      </>}
    </>}

    {tab === "orders" && <>
      <h1 className="tma-title">{c.tabs.orders}</h1>
      {!orders ? <p className="tma-empty">{c.noAccess}</p> : <>
        {segmented(orderFilter, value => setOrderFilter(value as typeof orderFilter), [["all", `${c.filterAll} · ${orders.length}`], ["proof", `${c.filterProof} · ${receiptOrders.length}`]])}
        {orderList(orderFilter === "proof" ? receiptOrders : orders)}
      </>}
    </>}

    {tab === "profile" && profileScreen()}
  </TmaShell>;

  function segmented(value: string, onChange: (value: string) => void, options: [string, string][]) {
    return <div className="tma-segmented" role="tablist">
      {options.map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={value === id} onClick={() => { haptic.select(); onChange(id); }}>{label}</button>)}
    </div>;
  }

  function requestList(items: Request[]) {
    if (items.length === 0) return <p className="tma-empty">{c.empty}</p>;
    return <section className="tma-section tma-list">
      {items.map(item => <button type="button" className="tma-item" key={item.id} onClick={() => open("request", item.id)}>
        <span className="tma-item-top"><strong>{item.name}</strong><span className={`tma-pill is-${item.status.toLowerCase()}`}>{requestStatus(item.status)}</span></span>
        <span className="tma-item-sub">{[item.reference, item.service?.name, item.city].filter(Boolean).join(" · ")}</span>
        <span className="tma-item-text">{item.description}</span>
        <span className="tma-item-meta">{timeOf(item.createdAt)}</span>
      </button>)}
    </section>;
  }

  function orderList(items: Order[]) {
    if (items.length === 0) return <p className="tma-empty">{c.empty}</p>;
    return <section className="tma-section tma-list">
      {items.map(item => <button type="button" className="tma-item" key={item.id} onClick={() => open("order", item.id)}>
        <span className="tma-item-top"><strong>{item.reference}</strong><span className={`tma-pill is-${item.status.toLowerCase()}`}>{copy.orders.status[item.status] ?? item.status}</span></span>
        <span className="tma-item-sub">{item.recipientName} · {money(item.totalMinor, item.currency)}</span>
        <span className="tma-item-text">{item.items.map(line => `${line.name} × ${line.quantity}`).join(", ")}</span>
        <span className="tma-item-meta">{timeOf(item.createdAt)}{needsReceiptCheck(item) ? ` · ${copy.orders.paymentStatus[item.paymentStatus] ?? item.paymentStatus}` : ""}</span>
      </button>)}
    </section>;
  }

  function todayScreen() {
    const data = desk;
    const fresh = newRequests;
    const receipts = receiptOrders;
    const firstName = data.me.name.split(/\s+/)[0];
    const stats = [
      data.requests ? { label: c.statNewRequests, value: fresh.length, go: "requests" as Tab } : null,
      data.orders ? { label: c.statActiveOrders, value: data.orders.length, go: "orders" as Tab } : null,
      data.orders ? { label: c.statProof, value: receipts.length, go: "orders" as Tab } : null,
      data.wallet ? { label: c.statWallet, value: data.wallet.length, go: null } : null
    ].filter(Boolean) as { label: string; value: number; go: Tab | null }[];
    const waiting = [
      ...receipts.map(order => ({ kind: "order" as const, id: order.id, title: order.reference, sub: `${order.recipientName} · ${copy.orders.paymentStatus[order.paymentStatus] ?? order.paymentStatus}`, at: order.createdAt })),
      ...[...fresh].reverse().map(request => ({ kind: "request" as const, id: request.id, title: request.name, sub: [request.reference, request.service?.name].filter(Boolean).join(" · "), at: request.createdAt }))
    ].slice(0, 6);
    return <>
      <header className="tma-hello">
        <span className="tma-eyebrow">{longDay(data.now, locale)}</span>
        <h1>{c.hello}, {firstName}</h1>
      </header>
      {stats.length > 0 && <div className="tma-stats">
        {stats.map(stat => stat.go
          ? <button type="button" key={stat.label} className="tma-stat" onClick={() => { haptic.select(); setTab(stat.go as Tab); }}><strong>{stat.value}</strong><span>{stat.label}</span></button>
          : <div key={stat.label} className="tma-stat"><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
      </div>}
      {(data.requests || data.orders) && <section className="tma-section tma-today-line">
        <span>{c.todayCame}: <strong>{data.today.came}</strong></span>
        <span>{c.todayDone}: <strong>{data.today.done}</strong></span>
      </section>}
      <h2 className="tma-section-title">{c.needNow}</h2>
      {waiting.length === 0 ? <p className="tma-empty">{c.allClear}</p> : <section className="tma-section tma-list">
        {waiting.map(item => <button type="button" className="tma-item" key={`${item.kind}-${item.id}`} onClick={() => open(item.kind, item.id)}>
          <span className="tma-item-top"><strong>{item.title}</strong><span className="tma-item-meta">{timeOf(item.at)}</span></span>
          <span className="tma-item-sub">{item.sub}</span>
        </button>)}
      </section>}
      {data.wallet && data.wallet.length > 0 && <>
        <h2 className="tma-section-title">{c.wallet}</h2>
        <section className="tma-section tma-list">
          {data.wallet.map(item => <div className="tma-item is-static" key={item.id}>
            <span className="tma-item-top"><strong>{item.kind === "DEPOSIT" ? c.deposit : c.withdrawal}</strong><strong>{formatMinor(item.amountMinor, "UZS", locale)}</strong></span>
            <span className="tma-item-sub">{item.user.name}{item.reference ? ` · ${item.reference}` : ""}</span>
            {item.details && <span className="tma-item-text">{item.details}</span>}
            <span className="tma-item-actions">
              {item.proofMediaId && <a className="tma-chip" href={`/api/media/${item.proofMediaId}`} target="_blank" rel="noreferrer">{c.proof}</a>}
              <button type="button" className="tma-chip is-danger" disabled={busy} onClick={() => void act("/api/admin/wallet", "PATCH", { id: item.id, status: "REJECTED" }, true)}>{c.reject}</button>
              <button type="button" className="tma-chip is-primary" disabled={busy} onClick={() => void act("/api/admin/wallet", "PATCH", { id: item.id, status: "APPROVED" })}>{c.approve}</button>
            </span>
          </div>)}
        </section>
      </>}
    </>;
  }

  function profileScreen() {
    const me = desk.me;
    const initials = me.name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
    async function logout() {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
      const app = telegramApp();
      if (app) app.close(); else window.location.assign("/");
    }
    return <>
      <header className="tma-profile">
        <span className="tma-avatar" aria-hidden="true">{initials}</span>
        <h1>{me.name}</h1>
        <span className="tma-item-sub">{me.email}</span>
        <span className="tma-pill">{c.role[me.role] ?? me.role}</span>
      </header>
      <h2 className="tma-section-title">{c.permissions}</h2>
      <section className="tma-section">
        <div className="tma-chips">{me.permissions === null ? <span className="tma-chip">{c.allModules}</span> : me.permissions.map(module => <span className="tma-chip" key={module}>{c.module[module] ?? module}</span>)}</div>
      </section>
      <section className="tma-section tma-list">
        {me.telegramLinked && <div className="tma-row-static">✓ {c.telegramLinked}</div>}
        <a className="tma-row-button" href="/admin">{c.fullPanel} →</a>
        <button type="button" className="tma-row-button is-danger" onClick={() => void logout()}>{c.logout}</button>
      </section>
    </>;
  }
}
