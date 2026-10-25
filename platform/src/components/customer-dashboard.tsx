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
import { ProfileHero } from "@/components/profile-hero";
import { PortalMessageForm } from "@/components/portal-message-form";
import type { ProfilePractice } from "@/lib/learning-profile-types";
import type { Locale } from "@/lib/messages";

type RequestRecord = {
  id: string; reference: string; name: string; serviceId: string | null; service: { name: string } | null;
  description: string; status: string; createdAt: Date;
  history: { id: string; fromStatus: string | null; toStatus: string; createdAt: Date; note: string | null }[];
};
type OrderRecord = {
  id: string; reference: string; status: string; recipientName: string; city: string; address: string; createdAt: Date;
  items: { id: string; name: string; quantity: number }[];
  history: { id: string; fromStatus: string | null; toStatus: string; note: string | null; createdAt: Date }[];
};
type ConversationRecord = {
  id: string; reference: string; category: string; subject: string; createdAt: Date;
  messages: { id: string; sender: string; body: string; createdAt: Date }[];
};
type Organization = {
  id: string; name: string; locations: { id: string; name: string; address: string }[];
  devices: { id: string; type: string; model: string | null; status: string; lastCheckAt: Date | null; monitored: boolean }[];
};
type ProjectRecord = { id: string; reference: string; name: string; status: string; quotations: { id: string; number: string; status: string; currency: string; items: { quantity: number; unitPriceMinor: number; discountMinor: number }[] }[] };
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

const portalCopy: Record<Locale, {
  menu: string; appProfile: string; overview: string; services: string; orders: string; monitoring: string;
  projects: string; messages: string; orderStatus: string; emptyOrders: string; emptyMessages: string;
  messagePlaceholder: string; submitMessage: string; submittingMessage: string; messageSent: string;
  messageBotUnavailable: string; messageFailed: string; overviewHint: string; profileIntro: string;
}> = {
  uz: {
    menu: "Bo‘limlar", appProfile: "Mijoz profili", overview: "Umumiy ko‘rinish", services: "Mening xizmatlarim",
    orders: "Mening buyurtmalarim", monitoring: "Xizmatlar va monitoring", projects: "Loyihalar va so‘rovlar",
    messages: "Xabarlarim", orderStatus: "Buyurtma holati", emptyOrders: "Hali buyurtma yo‘q.",
    emptyMessages: "Xabarlaringiz va javoblar shu yerda ko‘rinadi.",
    messagePlaceholder: "Xabaringizni yozing...",
    submitMessage: "Xabar yuborish",
    submittingMessage: "Yuborilmoqda...",
    messageSent: "Xabar yuborildi. Javob shu yerda ko‘rinadi.",
    messageBotUnavailable: "Xabar saytda saqlandi, ammo administratorga bildirishnoma yuborilmadi.",
    messageFailed: "Xabar yuborilmadi. Qayta urinib ko‘ring.",
    overviewHint: "Xizmatlar, buyurtmalar, monitoring va o‘qish bo‘limlarini chap menyudan boshqaring.",
    profileIntro: "Shaxsiy ma’lumotlar va akkaunt sozlamalari."
  },
  ru: {
    menu: "Разделы", appProfile: "Профиль клиента", overview: "Обзор", services: "Мои услуги",
    orders: "Мои заказы", monitoring: "Услуги и мониторинг", projects: "Проекты и запросы",
    messages: "Мои сообщения", orderStatus: "Статус заказа", emptyOrders: "Заказов пока нет.",
    emptyMessages: "Ваши сообщения и ответы появятся здесь.",
    messagePlaceholder: "Напишите сообщение...",
    submitMessage: "Отправить сообщение",
    submittingMessage: "Отправка...",
    messageSent: "Сообщение отправлено. Ответ появится здесь.",
    messageBotUnavailable: "Сообщение сохранено на сайте, но уведомление администратору не отправлено.",
    messageFailed: "Не удалось отправить сообщение. Попробуйте ещё раз.",
    overviewHint: "Управляйте услугами, заказами, мониторингом и обучением из меню слева.",
    profileIntro: "Личные данные и настройки аккаунта."
  },
  en: {
    menu: "Sections", appProfile: "Customer profile", overview: "Overview", services: "My services",
    orders: "My orders", monitoring: "Services and monitoring", projects: "Projects and requests",
    messages: "My messages", orderStatus: "Order status", emptyOrders: "No orders yet.",
    emptyMessages: "Your messages and replies will appear here.",
    messagePlaceholder: "Write your message...",
    submitMessage: "Send message",
    submittingMessage: "Sending...",
    messageSent: "Message sent. Replies will appear here.",
    messageBotUnavailable: "Message saved on the site, but the administrator notification was not delivered.",
    messageFailed: "Could not send the message. Please try again.",
    overviewHint: "Manage services, orders, monitoring, and learning from the menu on the left.",
    profileIntro: "Personal details and account settings."
  }
};

const customerSidebarIconPaths: Record<string, string[]> = {
  overview: ["M3 3h8v8H3z", "M13 3h8v5h-8z", "M13 10h8v11h-8z", "M3 13h8v8H3z"],
  profile: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M4 21a8 8 0 0 1 16 0"],
  requests: ["M9 4h6l1 2h4v15H4V6h4l1-2Z", "M8 11h8", "M8 15h8", "M8 18h5"],
  orders: ["M5 8h14l1 13H4L5 8Z", "M9 8V6a3 3 0 0 1 6 0v2"],
  monitoring: ["M3 12h4l3-8 4 16 3-8h4"],
  projects: ["M3 6h7l2 2h9v12H3z", "M8 13h8", "M8 16h5"],
  invoices: ["M6 3h12v18l-2-1-2 1-2-1-2 1-2-1-2 1V3Z", "M9 8h6", "M9 12h6", "M9 16h3"],
  wallet: ["M3 6h18v15H3z", "M3 6V5a2 2 0 0 1 2-2h13", "M16 12h5", "M16 12v3"],
  learning: ["m2 9 10-5 10 5-10 5L2 9Z", "M6 11v5c3 3 9 3 12 0v-5", "M22 9v6"],
  store: ["M3 10h18l-2-6H5l-2 6Z", "M5 10v11h14V10", "M9 21v-6h6v6", "M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"],
  subscriptions: ["M4 4v5h5", "M20 20v-5h-5", "M5.6 9A7 7 0 0 1 18 6l2 3", "M18.4 15A7 7 0 0 1 6 18l-2-3"],
  messages: ["M4 4h16v13H8l-4 3V4Z", "M8 9h8", "M8 13h5"]
};

function CustomerSidebarIcon({ sectionId }: { sectionId: string }) {
  const paths = customerSidebarIconPaths[sectionId] ?? customerSidebarIconPaths.overview;
  return <span className="customer-sidebar-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" focusable="false">
      {paths.map((path) => <path key={path} d={path} />)}
    </svg>
  </span>;
}

export function CustomerDashboard({ user, requests, orders, conversations, organizations, projects, catalog, invoices, plans, subscriptions, wallet, practice }: {
  user: { id: string; name: string; email: string; phone: string | null; role: string };
  requests: RequestRecord[];
  orders: OrderRecord[];
  conversations: ConversationRecord[];
  organizations: Organization[];
  projects: ProjectRecord[];
  catalog: { id: string; name: string; kind: "product" | "service" }[];
  invoices: InvoiceRecord[];
  plans: PlanRecord[];
  subscriptions: SubscriptionRecord[];
  wallet: { walletBalanceMinor: number; rewardPoints: number; walletTransactions: { id: string; kind: string; status: string; amountMinor: number; reference: string | null; details: string | null; proofMediaId: string | null; createdAt: Date }[] };
  practice: ProfilePractice;
}) {
  const router = useRouter();
  const { locale, t } = useSitePreferences();
  const copy = portalCopy[locale];
  const numberLocale = locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US";
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sectionChoices = [
    { id: "overview", label: copy.overview },
    { id: "profile", label: t("profile") },
    { id: "requests", label: copy.services, count: requests.length },
    { id: "orders", label: copy.orders, count: orders.length },
    { id: "monitoring", label: copy.monitoring },
    { id: "projects", label: copy.projects, count: projects.length },
    { id: "invoices", label: t("invoices"), count: invoices.length },
    { id: "wallet", label: t("wallet") },
    { id: "learning", label: t("learningDashboard") },
    { id: "store", label: t("learningStore") },
    { id: "subscriptions", label: t("monitoringTrials") },
    { id: "messages", label: copy.messages, count: conversations.length }
  ];

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
    <div className="container page-shell customer-portal">
      <header className="portal-profile-header">
        <div className="portal-profile-identity">
          <div className="portal-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</div>
          <div><span className="eyebrow">{copy.appProfile}</span><h1>{user.name}</h1><p>{user.email}{user.phone ? ` · ${user.phone}` : ""}</p></div>
        </div>
        <AccountSessionActions compact />
      </header>
      {error && <div className="notice error" role="alert">{error}</div>}
      <div className={`customer-workspace${sidebarCollapsed ? " is-collapsed" : ""}`}>
        <aside className={`customer-sidebar${sidebarCollapsed ? " is-collapsed" : ""}`} aria-label={copy.menu}>
          <div className="customer-sidebar-head">
            {!sidebarCollapsed && <strong>{copy.menu}</strong>}
            <button
              className="customer-sidebar-toggle"
              type="button"
              aria-label={sidebarCollapsed ? copy.menu : t("close")}
              aria-expanded={!sidebarCollapsed}
              onClick={() => setSidebarCollapsed((value) => !value)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
          <nav className="customer-sidebar-nav">
            {sectionChoices.map((item) => <button key={item.id} type="button" title={sidebarCollapsed ? item.label : undefined} aria-label={item.label} aria-current={activeSection === item.id ? "page" : undefined} className={`customer-sidebar-item${activeSection === item.id ? " active" : ""}`} onClick={() => {
              setActiveSection(item.id);
              if (window.matchMedia("(max-width: 960px)").matches) setSidebarCollapsed(true);
            }}>
              <CustomerSidebarIcon sectionId={item.id} /><span className="customer-sidebar-label">{item.label}</span>
              {item.count !== undefined && item.count > 0 && <span className="customer-sidebar-count">{item.count}</span>}
            </button>)}
          </nav>
        </aside>
        <div className="customer-section-content" aria-live="polite">
        {activeSection === "overview" && <section className="panel-card">
          <h2>{copy.overview}</h2>
          <p className="muted">{copy.overviewHint}</p>
          <div className="dashboard-grid portal-overview-metrics">
            <div className="metric"><strong>{requests.length}</strong><span>{copy.services}</span></div>
            <div className="metric"><strong>{orders.length}</strong><span>{copy.orders}</span></div>
            <div className="metric"><strong>{projects.length}</strong><span>{copy.projects}</span></div>
            <div className="metric"><strong>{organizations.reduce((sum, item) => sum + item.devices.length, 0)}</strong><span>{t("registeredDevices")}</span></div>
            <div className="metric"><strong>{wallet.rewardPoints.toLocaleString(numberLocale)}</strong><span>{t("rewardPoints")}</span></div>
          </div>
          <TecGiftNotifications />
          <div className="hero-actions portal-shortcuts">
            <button className="button" type="button" onClick={() => setActiveSection("requests")}>{copy.services}</button>
            <button className="button secondary" type="button" onClick={() => setActiveSection("orders")}>{copy.orders}</button>
            <button className="button ghost" type="button" onClick={() => setActiveSection("learning")}>{t("learningDashboard")}</button>
            <Link className="button ghost" href="/request-service">{t("newServiceRequest")}</Link>
          </div>
        </section>}
        {activeSection === "profile" && <section className="panel-card">
          <h2>{t("profile")}</h2><p className="muted">{copy.profileIntro}</p>
          <ProfileDetails user={{ name: user.name, email: user.email, phone: user.phone, role: user.role }} />
        </section>}
        {activeSection === "wallet" && <WalletPanel initialBalance={wallet.walletBalanceMinor} initialPoints={wallet.rewardPoints} transactions={wallet.walletTransactions} />}
        {activeSection === "learning" && <ProfileHero name={user.name} email={user.email} rewardPoints={wallet.rewardPoints} practice={practice} />}
        {activeSection === "store" && <section className="panel-card">
          <h2>{t("learningStore")}</h2>
          <p className="muted">{t("productsPageTitle")}</p>
          <Link className="button" href="/store">TEC · {t("learningSubscription")}</Link>
          <Link className="button ghost" href="/products" style={{ marginInlineStart: 8 }}>{t("allProducts")}</Link>
        </section>}
        {activeSection === "requests" && <section className="panel-card" id="requests">
          <div className="portal-section-heading"><div><span className="eyebrow">{t("customerPortal")}</span><h2>{copy.services}</h2></div><Link className="button" href="/request-service">{t("newServiceRequest")}</Link></div>
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
        {activeSection === "orders" && <section className="panel-card">
          <div className="portal-section-heading"><div><span className="eyebrow">{t("customerPortal")}</span><h2>{copy.orders}</h2></div><Link className="button ghost" href="/products">{t("allProducts")}</Link></div>
          {orders.length ? <div className="list">{orders.map((order) => <article className="portal-order-card" key={order.id}>
            <div className="portal-order-heading">
              <div><strong>{order.reference}</strong><p>{new Date(order.createdAt).toLocaleDateString(numberLocale)} · {order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p></div>
              <span className={`status ${order.status}`}>{order.status}</span>
            </div>
            <p className="small muted">{copy.orderStatus}: {order.history.map((item) => `${item.toStatus}${item.note ? ` — ${item.note}` : ""}`).join(" → ")}</p>
            <p className="small muted">{order.city}{order.address ? ` · ${order.address}` : ""}</p>
          </article>)}</div> : <div className="empty-state"><p>{copy.emptyOrders}</p><Link className="button" href="/products">{t("allProducts")}</Link></div>}
        </section>}
        {activeSection === "monitoring" && <section className="panel-card" id="organizations">
          <h2>{copy.monitoring}</h2>
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
        </section>}
        {activeSection === "projects" && <section className="panel-card" id="projects">
          <div className="portal-section-heading"><div><span className="eyebrow">{t("customerPortal")}</span><h2>{copy.projects}</h2></div></div>
          {projects.length ? <div className="list">{projects.map((project) => (
            <div className="list-row" key={project.id}>
              <div><strong>{project.reference} · {project.name}</strong><p>{t("projectStatus")}: {project.status}</p>
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
        {activeSection === "messages" && <section className="panel-card">
          <div className="portal-section-heading"><div><span className="eyebrow">{t("customerPortal")}</span><h2>{copy.messages}</h2></div><button className="button ghost" type="button" onClick={() => router.refresh()}>{t("refresh")}</button></div>
          <PortalMessageForm copy={{
            placeholder: copy.messagePlaceholder,
            submit: copy.submitMessage,
            submitting: copy.submittingMessage,
            sent: copy.messageSent,
            botUnavailable: copy.messageBotUnavailable,
            failed: copy.messageFailed
          }} />
          {conversations.length ? <div className="portal-conversations">{conversations.map((conversation) => <article className="portal-conversation" key={conversation.id}>
            <header><div><span className="tag">{conversation.category}</span><h3>{conversation.subject}</h3><small className="muted">{conversation.reference} · {new Date(conversation.createdAt).toLocaleDateString(numberLocale)}</small></div></header>
            <div className="portal-message-list">{conversation.messages.map((message) => <div className={`portal-message ${message.sender === "ADMIN" ? "from-admin" : ""}`} key={message.id}>
              <strong>{message.sender === "ADMIN" ? "Tecsecure" : user.name}</strong>
              <p>{message.body}</p>
              <small className="muted">{new Date(message.createdAt).toLocaleString(numberLocale)}</small>
            </div>)}</div>
          </article>)}</div> : <div className="empty-state">{copy.emptyMessages}</div>}
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
