"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { ProjectRequestForm } from "@/components/project-request-form";
import { OrganizationSetupForm } from "@/components/organization-setup-form";
import { DeviceRegisterForm } from "@/components/device-register-form";
import { SubscriptionManager } from "@/components/subscription-manager";
import { AccountSessionActions } from "@/components/account-session-actions";
import { ProfileDetails } from "@/components/profile-details";
import { WalletPanel } from "@/components/wallet-panel";
import { TecGiftNotifications } from "@/components/tec-gift-notifications";

type RequestRecord = {
  id: string; reference: string; name: string; serviceId: string | null; service: { name: string } | null;
  description: string; status: string; createdAt: Date;
  history: { id: string; fromStatus: string | null; toStatus: string; createdAt: Date; note: string | null }[];
};
type Organization = {
  id: string; name: string; locations: { id: string; name: string; address: string }[];
  devices: { id: string; type: string; model: string | null; status: string; lastCheckAt: Date | null; monitored: boolean }[];
};
type ProjectRecord = { id: string; name: string; status: string; quotations: { id: string; number: string; status: string; currency: string; items: { quantity: number; unitPriceMinor: number; discountMinor: number }[] }[] };
type InvoiceRecord = {
  id: string; number: string; status: string; currency: string; dueAt: Date | null; totalMinor: number; paidMinor: number;
  quotation: { project: { name: string } } | null;
  payments: { id: string; amountMinor: number; currency: string; method: string; reference: string; status: string }[];
};
type PlanRecord = { id: string; name: string; interval: string; priceMinor: number | null; currency: string; trialDays: number; features: unknown };
type SubscriptionRecord = {
  id: string; status: string; trialEndsAt: Date | null; consentAt: Date | null;
  plan: { name: string; interval: string; priceMinor: number | null; currency: string };
  organization: { name: string };
};

export function CustomerDashboard({ user, requests, organizations, projects, catalog, invoices, plans, subscriptions, wallet }: {
  user: { id: string; name: string; email: string; phone: string | null; role: string };
  requests: RequestRecord[];
  organizations: Organization[];
  projects: ProjectRecord[];
  catalog: { id: string; name: string; kind: "product" | "service" }[];
  invoices: InvoiceRecord[];
  plans: PlanRecord[];
  subscriptions: SubscriptionRecord[];
  wallet: { walletBalanceMinor: number; rewardPoints: number; walletTransactions: { id: string; kind: string; status: string; amountMinor: number; reference: string | null; details: string | null; proofMediaId: string | null; createdAt: Date }[] };
}) {
  const router = useRouter();
  const { locale, t } = useSitePreferences();
  const numberLocale = locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US";
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const sectionChoices = [
    { id: "overview", label: "dashboard" },
    { id: "profile", label: "profile" },
    { id: "wallet", label: "wallet" },
    ...(requests.length ? [{ id: "requests", label: "myRequests" }] : []),
    ...(requests.length || projects.length || invoices.length || subscriptions.length ? [{ id: "organizations", label: "organizationsAndDevices" }] : []),
    ...(invoices.length ? [{ id: "invoices", label: "invoices" }] : []),
    ...(organizations.length || subscriptions.length ? [{ id: "subscriptions", label: "monitoringTrials" }] : [])
  ];
  const sectionKeys: Record<string, "dashboard" | "profile" | "wallet" | "myRequests" | "organizationsAndDevices" | "invoices" | "monitoringTrials"> = {
    overview: "dashboard", profile: "profile", wallet: "wallet", requests: "myRequests",
    organizations: "organizationsAndDevices", invoices: "invoices", subscriptions: "monitoringTrials"
  };

  async function cancelRequest(id: string) {
    setError("");
    const response = await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" })
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? t("requestFailed"));
      return;
    }
    router.refresh();
  }

  async function respondToQuote(id: string, status: "ACCEPTED" | "REJECTED") {
    setError("");
    const response = await fetch(`/api/quotations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? t("requestFailed"));
      return;
    }
    router.refresh();
  }

  async function submitPayment(event: FormEvent<HTMLFormElement>, invoiceId: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        amountMinor: Number(data.amountMinor), method: data.method, reference: data.reference
      })
    });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? t("requestFailed")); return; }
    form.reset();
    router.refresh();
  }

  return (
    <div className="container page-shell">
      <section className="portal-welcome">
        <div className="portal-identity">
          <div className="portal-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</div>
          <div>
            <span className="eyebrow">{t("profile")}</span>
            <h1 className="page-title">{t("customerGreeting").replace("{name}", user.name)}</h1>
            <p className="page-intro">{user.email} · {t("privateDataNotice")}</p>
          </div>
        </div>
        <div className="portal-actions">
          <AccountSessionActions />
        </div>
      </section>
      <div className="dashboard-grid">
        <div className="metric"><strong>{requests.length}</strong><span>{t("requestsMetric")}</span></div>
        <div className="metric"><strong>{projects.length}</strong><span>{t("projectsMetric")}</span></div>
        <div className="metric"><strong>{organizations.reduce((sum, item) => sum + item.devices.length, 0)}</strong><span>{t("registeredDevices")}</span></div>
      </div>
      {error && <div className="notice error" role="alert">{error}</div>}
      <div className="customer-workspace">
        <aside className="customer-sidebar" aria-label={t("portalOverview")}>
          {sectionChoices.map((item, index) => <button key={item.id} type="button" className={`admin-sidebar-item ${activeSection === item.id ? "active" : ""}`} onClick={() => setActiveSection(item.id)}>
            <span className="admin-sidebar-marker" aria-hidden="true">{index + 1}</span><span>{t(sectionKeys[item.id])}</span>
            {item.id === "requests" && <span className="admin-sidebar-count">{requests.length}</span>}
          </button>)}
        </aside>
        <div className="customer-section-content">
        {activeSection === "overview" && <section className="panel-card">
          <h2>{t("portalOverview")}</h2>
          <p className="muted">{t("privateDataNotice")}</p>
          <div className="dashboard-grid"><div className="metric"><strong>{(wallet.walletBalanceMinor / 100).toLocaleString(numberLocale)} UZS</strong><span>{t("walletBalance")}</span></div><div className="metric"><strong>{wallet.rewardPoints.toLocaleString(numberLocale)}</strong><span>{t("rewardPoints")}</span></div></div>
          <TecGiftNotifications />
          {!requests.length && <div className="empty-state"><p>{t("noRequestsYet")}</p><Link className="button" href="/request-service">{t("newServiceRequest")}</Link></div>}
        </section>}
        {activeSection === "profile" && <ProfileDetails user={{ name: user.name, email: user.email, phone: user.phone, role: user.role }} />}
        {activeSection === "wallet" && <WalletPanel initialBalance={wallet.walletBalanceMinor} initialPoints={wallet.rewardPoints} transactions={wallet.walletTransactions} />}
        {activeSection === "requests" && requests.length > 0 && <section className="panel-card" id="requests">
          <h2>{t("myRequests")}</h2>
          {requests.length ? <div className="list">{requests.map((item) => (
            <article className="list-row" key={item.id}>
              <div>
                <strong>{item.reference} · {item.service?.name ?? t("technicalAdvice")}</strong>
                <p>{new Date(item.createdAt).toLocaleDateString(numberLocale)} · {item.description}</p>
                <div className="small muted">{t("history")}: {item.history.map((event) => `${event.toStatus} (${new Date(event.createdAt).toLocaleDateString(numberLocale)})`).join(" → ")}</div>
              </div>
              <div className="stack" style={{ justifyItems: "end" }}>
                <span className={`status ${item.status}`}>{item.status}</span>
                {!["COMPLETED", "REJECTED", "CANCELLED"].includes(item.status) && <button className="button danger small" onClick={() => cancelRequest(item.id)}>{t("cancel")}</button>}
              </div>
            </article>
          ))}</div> : <div className="empty-state">{t("noRequestsYet")}</div>}
        </section>}
        {activeSection === "organizations" && <section className="panel-card" id="organizations">
          <h2>{t("organizationsAndDevices")}</h2>
          {organizations.length ? organizations.map((organization) => (
            <div key={organization.id} className="list">
              <strong>{organization.name}</strong>
              {organization.locations.map((location) => <p className="small muted" key={location.id}>{location.name} · {location.address}</p>)}
              {organization.devices.length ? organization.devices.map((device) => <div key={device.id} className="list-row">
                <span>{device.type} {device.model ?? ""}<small className="muted"> · {t("monitoring")}: {device.monitored ? t("enabled") : t("disabled")}</small></span>
                <span className={`status ${device.status}`}>{device.status}</span>
              </div>) : <p className="muted">{t("noDeviceDetails")}</p>}
            </div>
          )) : <div className="empty-state">{t("noOrganizations")}</div>}
          <h2 style={{ marginTop: 24 }}>{t("addOrganization")}</h2>
          <OrganizationSetupForm />
          <h2 style={{ marginTop: 24 }}>{t("registerDevice")}</h2>
          <DeviceRegisterForm organizations={organizations.map(({ id, name }) => ({ id, name }))} />
          <h2 id="projects" style={{ marginTop: 28 }}>{t("projectsAndQuotes")}</h2>
          {projects.length ? <div className="list">{projects.map((project) => (
            <div className="list-row" key={project.id}>
              <div><strong>{project.name}</strong><p>{t("projectStatus")}: {project.status}</p>
                {project.quotations.map((quote) => {
                  const totalMinor = quote.items.reduce((sum, item) => sum + item.quantity * item.unitPriceMinor - item.discountMinor, 0);
                  return <div key={quote.number}>
                    <p>{t("quote")} {quote.number} · {quote.status} · {(totalMinor / 100).toLocaleString(numberLocale)} {quote.currency}</p>
                    {quote.status === "ISSUED" && <div className="hero-actions">
                      <button className="button" onClick={() => respondToQuote(quote.id, "ACCEPTED")}>{t("acceptQuote")}</button>
                      <button className="button danger" onClick={() => respondToQuote(quote.id, "REJECTED")}>{t("reject")}</button>
                    </div>}
                  </div>;
                })}
              </div>
            </div>
          ))}</div> : <p className="muted">{t("noProjectsOrQuotes")}</p>}
          <h2 style={{ marginTop: 28 }}>{t("requestProjectQuote")}</h2>
          <ProjectRequestForm catalog={catalog} />
        </section>}
      {activeSection === "invoices" && <section className="panel-card" id="invoices">
        <h2>{t("invoicesAndManualPayments")}</h2>
        <p className="small muted">{t("paymentsManualNotice")}</p>
        {invoices.length ? <div className="list">{invoices.map((invoice) => (
          <article className="list-row" key={invoice.id}>
            <div>
              <strong>{invoice.number} · {invoice.quotation?.project.name ?? t("projectName")}</strong>
              <p>{invoice.status} · {t("total")} {(invoice.totalMinor / 100).toLocaleString(numberLocale)} {invoice.currency} · {t("approved")} {(invoice.paidMinor / 100).toLocaleString(numberLocale)} {invoice.currency}</p>
              <p className="small muted">{t("dueDate")}: {invoice.dueAt?.toLocaleDateString(numberLocale) ?? t("notSet")}</p>
              {invoice.payments.map((payment) => <p className="small muted" key={payment.id}>{t("paymentReference")} {payment.reference}: {payment.status}</p>)}
            </div>
            {["ISSUED", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status) && <form className="form" onSubmit={(event) => submitPayment(event, invoice.id)}>
              <div className="field"><label>{t("amountMinor")}</label><input name="amountMinor" type="number" min="1" max={invoice.totalMinor - invoice.paidMinor} required /></div>
              <div className="field"><label>{t("paymentMethod")}</label><select name="method"><option value="BANK_TRANSFER">{t("bankTransfer")}</option><option value="CASH">{t("cash")}</option><option value="OTHER">{t("other")}</option></select></div>
              <div className="field"><label>{t("paymentReferenceReceipt")}</label><input name="reference" minLength={2} maxLength={160} required /></div>
              <button className="button secondary">{t("sendForReview")}</button>
            </form>}
          </article>
        ))}</div> : <div className="empty-state">{t("noInvoices")}</div>}
      </section>}
      {activeSection === "subscriptions" && <div id="subscriptions"><SubscriptionManager organizations={organizations.map(({ id, name }) => ({ id, name }))} plans={plans} subscriptions={subscriptions} /></div>}
        </div>
      </div>
      <p style={{ marginTop: 24 }}><Link className="button ghost" href="/">{t("home")}</Link></p>
    </div>
  );
}
