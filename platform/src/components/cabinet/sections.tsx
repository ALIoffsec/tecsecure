"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { ProjectRequestForm } from "@/components/project-request-form";
import { OrganizationSetupForm } from "@/components/organization-setup-form";
import { DeviceRegisterForm } from "@/components/device-register-form";
import { SubscriptionManager } from "@/components/subscription-manager";
import { PortalMessageForm } from "@/components/portal-message-form";
import { ToastMessage } from "@/components/toast-provider";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { statusLabel, toneClass, type StatusKind } from "@/lib/status-labels";
import { cabinetLabels } from "@/lib/cabinet-routes";

/** A status badge in words, from the shared list; colour always comes with text. */
export function StatusBadge({ kind, code }: { kind: StatusKind; code: string }) {
  const { locale } = useSitePreferences();
  const label = statusLabel(kind, code, locale);
  return <span className={`order-status ${toneClass[label.tone]}`.trim()}>{label.text}</span>;
}

/** Each cabinet page starts with its one h1. */
export function CabinetTitle({ section }: { section: keyof typeof cabinetLabels.uz }) {
  const { locale } = useSitePreferences();
  return <h1 className="cab-title" tabIndex={-1}>{cabinetLabels[locale][section]}</h1>;
}

type RequestRecord = {
  id: string; reference: string; service: { name: string } | null; description: string; status: string; createdAt: Date | string;
  history: { id: string; toStatus: string; createdAt: Date | string }[];
};
type ProjectRecord = { id: string; reference: string; name: string; status: string; quotations: { id: string; number: string; status: string; currency: string; items: { quantity: number; unitPriceMinor: number; discountMinor: number }[] }[] };
type InvoiceRecord = {
  id: string; number: string; status: string; currency: string; dueAt: Date | string | null; totalMinor: number; paidMinor: number;
  quotation: { project: { name: string } } | null;
  payments: { id: string; reference: string; status: string }[];
};

/** Requests, projects with their quotes, and invoices: the old three blocks, one after another. */
export function RequestsSection({ requests, projects, invoices, catalog }: {
  requests: RequestRecord[]; projects: ProjectRecord[]; invoices: InvoiceRecord[]; catalog: { id: string; name: string; kind: "product" | "service" }[];
}) {
  const router = useRouter();
  const { locale, t } = useSitePreferences();
  const [error, setError] = useState("");

  async function send(url: string, method: string, body: object) {
    setError("");
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setError(result.error ?? t("requestFailed")); return false; }
    router.refresh();
    return true;
  }

  async function submitPayment(event: FormEvent<HTMLFormElement>, invoiceId: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const ok = await send(`/api/invoices/${invoiceId}/payments`, "POST", {
      amountMinor: Math.round(Number(String(data.amount).replace(",", ".")) * 100), method: data.method, reference: data.reference
    });
    if (ok) form.reset();
  }

  return <>
    <ToastMessage message={error} variant="error" />
    <section className="panel-card" id="requests">
      <div className="portal-section-heading"><h2>{cabinetLabels[locale].requests}</h2><Link className="button" href="/request-service">{t("newServiceRequest")}</Link></div>
      {requests.length ? <ul className="list">{requests.map((item) => (
        <li className="list-row" key={item.id}>
          <div>
            <strong>{item.service?.name ?? t("technicalAdvice")}</strong>
            <p className="small muted">{item.reference} · {formatDate(item.createdAt)}</p>
            <p>{item.description}</p>
            <p className="small muted">{t("history")}: {item.history.map((event) => `${statusLabel("request", event.toStatus, locale).text} (${formatDate(event.createdAt)})`).join(" → ")}</p>
          </div>
          <div className="stack">
            <StatusBadge kind="request" code={item.status} />
            {!["COMPLETED", "REJECTED", "CANCELLED"].includes(item.status) && <button className="button danger small" type="button" onClick={() => void send(`/api/requests/${item.id}`, "PATCH", { status: "CANCELLED" })}>{t("cancel")}</button>}
          </div>
        </li>
      ))}</ul> : <div className="empty-state checkout-empty"><p>{t("noRequestsYet")}</p><Link className="button" href="/request-service">{t("newServiceRequest")}</Link></div>}
    </section>

    <section className="panel-card" id="projects">
      <h2>{t("projectsAndQuotes")}</h2>
      {projects.length ? <ul className="list">{projects.map((project) => (
        <li className="list-row" key={project.id}>
          <div><strong>{project.name}</strong><p className="small muted">{project.reference}</p>
            {project.quotations.map((quote) => {
              const totalMinor = quote.items.reduce((sum, item) => sum + item.quantity * item.unitPriceMinor - item.discountMinor, 0);
              return <div key={quote.number}>
                <p>{t("quote")} {quote.number} · <StatusBadge kind="quote" code={quote.status} /> · {formatNumber(totalMinor / 100)} {quote.currency}</p>
                {quote.status === "ISSUED" && <div className="hero-actions">
                  <button className="button" type="button" onClick={() => void send(`/api/quotations/${quote.id}`, "PATCH", { status: "ACCEPTED" })}>{t("acceptQuote")}</button>
                  <button className="button danger" type="button" onClick={() => void send(`/api/quotations/${quote.id}`, "PATCH", { status: "REJECTED" })}>{t("reject")}</button>
                </div>}
              </div>;
            })}
          </div>
          <StatusBadge kind="project" code={project.status} />
        </li>
      ))}</ul> : <p className="muted">{t("noProjectsOrQuotes")}</p>}
      <h3>{t("requestProjectQuote")}</h3>
      <ProjectRequestForm catalog={catalog} />
    </section>

    <section className="panel-card" id="invoices">
      <h2>{t("invoicesAndManualPayments")}</h2>
      <p className="small muted">{t("paymentsManualNotice")}</p>
      {invoices.length ? <ul className="list">{invoices.map((invoice) => (
        <li className="list-row" key={invoice.id}>
          <div>
            <strong>{invoice.number} · {invoice.quotation?.project.name ?? t("projectName")}</strong>
            <p><StatusBadge kind="invoice" code={invoice.status} /> · {t("total")} {formatNumber(invoice.totalMinor / 100)} {invoice.currency} · {t("approved")} {formatNumber(invoice.paidMinor / 100)} {invoice.currency}</p>
            <p className="small muted">{t("dueDate")}: {invoice.dueAt ? formatDate(invoice.dueAt) : t("notSet")}</p>
            {invoice.payments.map((payment) => <p className="small muted" key={payment.id}>{t("paymentReference")} {payment.reference}: {statusLabel("invoicePayment", payment.status, locale).text}</p>)}
          </div>
          {["ISSUED", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status) && <form className="form" onSubmit={(event) => void submitPayment(event, invoice.id)}>
            <div className="field"><label htmlFor={`pay-amount-${invoice.id}`}>{t("amountMinor")}</label><input id={`pay-amount-${invoice.id}`} name="amount" type="number" min="0.01" step="0.01" max={(invoice.totalMinor - invoice.paidMinor) / 100} required /></div>
            <div className="field"><label htmlFor={`pay-method-${invoice.id}`}>{t("paymentMethod")}</label><select id={`pay-method-${invoice.id}`} name="method"><option value="BANK_TRANSFER">{t("bankTransfer")}</option><option value="CASH">{t("cash")}</option><option value="OTHER">{t("other")}</option></select></div>
            <div className="field"><label htmlFor={`pay-ref-${invoice.id}`}>{t("paymentReferenceReceipt")}</label><input id={`pay-ref-${invoice.id}`} name="reference" minLength={2} maxLength={160} required /></div>
            <button className="button secondary" type="submit">{t("sendForReview")}</button>
          </form>}
        </li>
      ))}</ul> : <div className="empty-state checkout-empty"><p>{t("noInvoices")}</p></div>}
    </section>
  </>;
}

type Organization = {
  id: string; name: string; locations: { id: string; name: string; address: string }[];
  devices: { id: string; type: string; model: string | null; status: string; lastCheckAt: Date | string | null; monitored: boolean }[];
};
type PlanRecord = { id: string; name: string; interval: string; priceMinor: number | null; currency: string; trialDays: number; features: unknown };
type SubscriptionRecord = {
  id: string; status: string; trialEndsAt: Date | null; consentAt: Date | null;
  plan: { name: string; interval: string; priceMinor: number | null; currency: string };
  organization: { name: string };
};

/** Organisations, their devices, adding the first one, and monitoring subscriptions. */
export function DevicesSection({ organizations, plans, subscriptions }: { organizations: Organization[]; plans: PlanRecord[]; subscriptions: SubscriptionRecord[] }) {
  const { locale, t } = useSitePreferences();
  return <>
    <section className="panel-card" id="organizations">
      <h2>{cabinetLabels[locale].devices}</h2>
      {organizations.length ? organizations.map((organization) => (
        <div key={organization.id} className="cab-block">
          <h3>{organization.name}</h3>
          {organization.locations.map((location) => <p className="small muted" key={location.id}>{location.name} · {location.address}</p>)}
          {organization.devices.length ? <ul className="list">{organization.devices.map((device) => <li key={device.id} className="list-row">
            <span>{device.type} {device.model ?? ""}<small className="muted"> · {t("monitoring")}: {device.monitored ? t("enabled") : t("disabled")}{device.lastCheckAt ? ` · ${formatDateTime(device.lastCheckAt)}` : ""}</small></span>
            <StatusBadge kind="device" code={device.status} />
          </li>)}</ul> : <p className="muted">{t("noDeviceDetails")}</p>}
        </div>
      )) : <div className="empty-state checkout-empty"><p>{t("noOrganizations")}</p></div>}
      <h3>{t("addOrganization")}</h3>
      <OrganizationSetupForm />
      <h3>{t("registerDevice")}</h3>
      <DeviceRegisterForm organizations={organizations.map(({ id, name }) => ({ id, name }))} />
    </section>
    <div id="subscriptions"><SubscriptionManager organizations={organizations.map(({ id, name }) => ({ id, name }))} plans={plans} subscriptions={subscriptions} /></div>
  </>;
}

const messageCopy = {
  uz: { placeholder: "Xabaringizni yozing...", submit: "Xabar yuborish", submitting: "Yuborilmoqda...", sent: "Xabar yuborildi. Javob shu yerda ko‘rinadi.", botUnavailable: "Xabar saytda saqlandi, ammo administratorga bildirishnoma yuborilmadi.", failed: "Xabar yuborilmadi. Qayta urinib ko‘ring.", empty: "Xabarlaringiz va javoblar shu yerda ko‘rinadi." },
  ru: { placeholder: "Напишите сообщение...", submit: "Отправить сообщение", submitting: "Отправка...", sent: "Сообщение отправлено. Ответ появится здесь.", botUnavailable: "Сообщение сохранено на сайте, но уведомление администратору не отправлено.", failed: "Не удалось отправить сообщение. Попробуйте ещё раз.", empty: "Ваши сообщения и ответы появятся здесь." },
  en: { placeholder: "Write your message...", submit: "Send message", submitting: "Sending...", sent: "Message sent. Replies will appear here.", botUnavailable: "Message saved on the site, but the administrator notification was not delivered.", failed: "Could not send the message. Please try again.", empty: "Your messages and replies will appear here." }
} as const;

type ConversationRecord = { id: string; reference: string; category: string; subject: string; createdAt: Date | string; messages: { id: string; sender: string; body: string; createdAt: Date | string }[] };

/** The message form and the conversations, as before. */
export function MessagesSection({ conversations, userName }: { conversations: ConversationRecord[]; userName: string }) {
  const router = useRouter();
  const { locale, t } = useSitePreferences();
  const c = messageCopy[locale];
  return <section className="panel-card">
    <div className="portal-section-heading"><h2>{cabinetLabels[locale].messages}</h2><button className="button ghost" type="button" onClick={() => router.refresh()}>{t("refresh")}</button></div>
    <PortalMessageForm copy={{ placeholder: c.placeholder, submit: c.submit, submitting: c.submitting, sent: c.sent, botUnavailable: c.botUnavailable, failed: c.failed }} />
    {conversations.length ? <div className="portal-conversations">{conversations.map((conversation) => <article className="portal-conversation" key={conversation.id}>
      <header><div><span className="tag">{conversation.category}</span><h3>{conversation.subject}</h3><small className="muted">{conversation.reference} · {formatDate(conversation.createdAt)}</small></div></header>
      <div className="portal-message-list">{conversation.messages.map((message) => <div className={`portal-message ${message.sender === "ADMIN" ? "from-admin" : ""}`} key={message.id}>
        <strong>{message.sender === "ADMIN" ? "Tecsecure" : userName}</strong>
        <p>{message.body}</p>
        <small className="muted">{formatDateTime(message.createdAt)}</small>
      </div>)}</div>
    </article>)}</div> : <div className="empty-state checkout-empty"><p>{c.empty}</p></div>}
  </section>;
}
