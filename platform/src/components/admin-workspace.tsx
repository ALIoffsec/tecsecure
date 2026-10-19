"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { StaffManagement } from "@/components/staff-management";
import { SiteBlockManager, type SiteBlockRecord } from "@/components/site-block-manager";
import { PortfolioManager } from "@/components/portfolio-manager";
import { WalletReviewManager } from "@/components/wallet-panel";
import { TecGiftManager } from "@/components/tec-gift-manager";
import { SystemStatus } from "@/components/system-status";
import { MediaGallery, MediaUploader } from "@/components/media-uploader";
import type { AdminModule } from "@/lib/auth";
import type { MessageKey } from "@/lib/messages";
import { isSiteDesign, type SiteDesign } from "@/lib/site-designs";

type Service = { id: string; name: string; description: string; icon: string | null; status: string; pricingType: string; startingPriceMinor: number | null; currency: string; availability: boolean; media: unknown };
type RequestRecord = { id: string; reference: string; name: string; phone: string; email: string | null; organizationName: string | null; description: string; status: string; service: { name: string } | null; createdAt: Date };
type Product = { id: string; name: string; sku: string | null; brand: string | null; model: string | null; warrantyDescription: string | null; status: string; priceMinor: number | null; currency: string; stockStatus: string; description: string; media: unknown };
type Project = { id: string; name: string; status: string; customerId: string | null; city: string | null; items: { id: string; quantity: number; product: { name: string } | null; service: { name: string } | null }[] };
type Article = { id: string; title: string; excerpt: string; content: string; status: string; publishedAt: Date | null; media: unknown };
type Notice = { id: string; event: string; status: string; createdAt: Date };
type AcceptedQuote = { id: string; number: string; currency: string; project: { name: string }; invoices: { id: string; number: string; status: string }[] };
type PendingPayment = { id: string; amountMinor: number; currency: string; method: string; reference: string; invoice: { id: string; number: string; currency: string } };
type Plan = { id: string; name: string; interval: string; priceMinor: number | null; currency: string; trialDays: number; active: boolean; features: string[] };
type ManagedUser = { id: string; name: string; email: string; role: "CUSTOMER" | "STAFF" | "ADMIN" | "FOUNDER"; active: boolean; permissions: string[] };
type AdminSection = "requests" | "projects" | "services" | "products" | "news" | "company" | "users" | "invoices" | "subscriptions" | "payments" | "content" | "portfolio" | "wallet" | "system";
const sectionModules: Record<AdminSection, AdminModule> = {
  requests: "REQUESTS", projects: "PROJECTS", services: "SERVICES", products: "PRODUCTS", news: "NEWS",
  company: "COMPANY", users: "USERS", invoices: "PAYMENTS", subscriptions: "SUBSCRIPTIONS", payments: "PAYMENTS",
  content: "CONTENT", portfolio: "PORTFOLIO", wallet: "WALLET", system: "SYSTEM"
};
const sectionLabelKeys: Record<AdminSection, MessageKey> = {
  requests: "incomingRequests", projects: "projectQuotes", services: "serviceCatalog", products: "products",
  news: "newsCms", company: "companyInformation", users: "usersAndStaff", invoices: "invoices",
  subscriptions: "monitoringPlans", payments: "pendingPayments", content: "siteBlocks",
  portfolio: "portfolioManagement", wallet: "walletReview", system: "serverStatus"
};

const requestStatuses = ["UNDER_REVIEW", "CONTACTED", "INSPECTION_REQUIRED", "QUOTATION_SENT", "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED", "CANCELLED"];
const designOptions: { id: SiteDesign; name: string; font: string }[] = [
  { id: "midnight", name: "Midnight", font: "DM Sans · Manrope" },
  { id: "ocean", name: "Ocean", font: "Outfit" },
  { id: "forest", name: "Forest", font: "IBM Plex Sans" },
  { id: "ember", name: "Ember", font: "Space Grotesk" },
  { id: "violet", name: "Violet", font: "Space Grotesk · DM Sans" },
  { id: "editorial", name: "Editorial", font: "Playfair Display · DM Sans" },
  { id: "terminal", name: "Terminal", font: "JetBrains Mono" }
];

export function AdminWorkspace({ services, requests, products, articles, settings, notifications, projects, quotations, pendingPayments, plans, users, siteBlocks, portfolioPosts, walletRequests, metrics, role, permissions, actorId }: {
  services: Service[];
  requests: RequestRecord[];
  products: Product[];
  articles: Article[];
  settings: Record<string, string>;
  notifications: Notice[];
  projects: Project[];
  quotations: AcceptedQuote[];
  pendingPayments: PendingPayment[];
  plans: Plan[];
  users: ManagedUser[];
  siteBlocks: SiteBlockRecord[];
  portfolioPosts: { id: string; slug: string; title: string; description: string; media: unknown; published: boolean }[];
  walletRequests: { id: string; kind: string; amountMinor: number; reference: string | null; details: string | null; proofMediaId: string | null; createdAt: Date; user: { name: string; email: string; walletBalanceMinor: number } }[];
  metrics: { users: number; projects: number; invoices: number };
  role: "FOUNDER" | "ADMIN" | "STAFF";
  permissions: string[];
  actorId: string;
}) {
  const router = useRouter();
  const { t } = useSitePreferences();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceMedia, setServiceMedia] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productMedia, setProductMedia] = useState<string[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleMedia, setArticleMedia] = useState<string[]>([]);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>("requests");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [requestFilter, setRequestFilter] = useState("");
  const isPrivileged = role === "FOUNDER" || role === "ADMIN";
  const visibleSections = useMemo(() => (Object.keys(sectionModules) as AdminSection[]).filter((section) =>
    isPrivileged ? true : section !== "users" && permissions.includes(sectionModules[section])
  ), [isPrivileged, permissions]);
  const selectedSection = visibleSections.includes(activeSection) ? activeSection : visibleSections[0];

  async function post(path: string, body: unknown) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
    return result;
  }

  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const body = {
        name: data.get("name"),
        description: data.get("description"),
        icon: data.get("icon") || "IT",
        pricingType: data.get("pricingType"),
        startingPriceMinor: String(data.get("startingPriceMinor") ?? "").trim() ? Number(data.get("startingPriceMinor")) : null,
        currency: data.get("currency"),
        status: data.get("status"),
        availability: data.get("status") !== "ARCHIVED",
        media: serviceMedia
      };
      if (editingService) {
        const response = await fetch(`/api/services/${editingService.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      } else {
        await post("/api/services", body);
      }
      setEditingService(null); setServiceMedia([]); form.reset(); setNotice(editingService ? t("save") : t("addService")); router.refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : t("requestFailed")); }
    finally { setBusy(false); }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const price = String(data.get("priceMinor") ?? "").trim();
    try {
      const body = {
        name: data.get("name"), description: data.get("description"), sku: data.get("sku"),
        brand: data.get("brand"), model: data.get("model"), warrantyDescription: data.get("warrantyDescription"),
        priceMinor: price ? Number(price) : null, currency: data.get("currency"),
        stockStatus: data.get("stockStatus"), status: data.get("status"), media: productMedia
      };
      if (editingProduct) {
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      } else {
        await post("/api/products", body);
      }
      setEditingProduct(null); setProductMedia([]); form.reset(); setNotice(editingProduct ? t("save") : t("addProduct")); router.refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : t("requestFailed")); }
    finally { setBusy(false); }
  }

  async function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const rawPrice = String(data.get("priceMinor") ?? "").trim();
    try {
      const body = {
        name: data.get("name"), interval: data.get("interval"),
        priceMinor: rawPrice ? Number(rawPrice) : null,
        currency: data.get("currency"), trialDays: Number(data.get("trialDays")),
        features: String(data.get("features") ?? "").split(",").map((value) => value.trim()).filter(Boolean)
      };
      if (editingPlan) {
        const response = await fetch(`/api/subscription-plans/${editingPlan.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      } else {
        await post("/api/subscription-plans", body);
      }
      setEditingPlan(null); form.reset(); setNotice(editingPlan ? t("save") : t("addPlan")); router.refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : t("requestFailed")); }
    finally { setBusy(false); }
  }

  async function togglePlan(plan: Plan) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/subscription-plans/${plan.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !plan.active })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      setNotice(t("save")); router.refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : t("requestFailed")); }
    finally { setBusy(false); }
  }

  async function saveArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const body = {
      title: data.get("title"), excerpt: data.get("excerpt"),
      content: data.get("content"), status: data.get("status"), media: articleMedia
    };
    try {
      if (editingArticle) {
        const response = await fetch(`/api/news/${editingArticle.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
        setNotice(t("save"));
      } else {
        await post("/api/news", body);
        setNotice(t("save"));
      }
      setEditingArticle(null); setArticleMedia([]); form.reset(); router.refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : t("requestFailed")); }
    finally { setBusy(false); }
  }

  async function archiveRecord(path: string, label: string) {
    if (!window.confirm(`${label}: ${t("archive")}?`)) return;
    const response = await fetch(path, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? t("requestFailed")); return; }
    setNotice(`${label}: ${t("archive")}`);
    router.refresh();
  }

  async function updateSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      if (isSiteDesign(result.settings?.siteDesign)) document.documentElement.dataset.design = result.settings.siteDesign;
      setNotice(t("saveSettings"));
    } catch (issue) { setError(issue instanceof Error ? issue.message : t("requestFailed")); }
    finally { setBusy(false); }
  }

  async function changeRequest(id: string, status: string) {
    setError(""); setNotice("");
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      setNotice(t("statusUpdated")); router.refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : t("requestFailed")); }
  }

  async function archiveService(id: string) {
    if (!window.confirm(t("archive") + "?")) return;
    const response = await fetch(`/api/services/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? t("requestFailed")); return; }
    router.refresh();
  }

  async function issueQuote(event: FormEvent<HTMLFormElement>, projectId: string) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const items = [{
      description: String(data.get("description") ?? "").trim(),
      quantity: Number(data.get("quantity")),
      unitPriceMinor: Number(data.get("unitPriceMinor")),
      discountMinor: Number(data.get("discountMinor") || 0),
      serviceId: undefined,
      productId: undefined
    }];
    try {
      const result = await post("/api/quotations", {
        projectId, items, assumptions: data.get("assumptions"),
        exclusions: data.get("exclusions")
      });
      form.reset();
      setNotice(`${t("quote")} ${result.quotation.number} · ${t("total")}: ${(result.totalMinor / 100).toLocaleString("uz-UZ")} ${result.quotation.currency}.`);
      router.refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : t("requestFailed")); }
    finally { setBusy(false); }
  }

  async function createInvoice(quotationId: string) {
    setError(""); setNotice("");
    try {
      const result = await post("/api/invoices", { quotationId });
      setNotice(`${t("invoices")}: ${result.invoice.number}`);
      router.refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : t("requestFailed")); }
  }

  async function reviewPayment(id: string, status: "VERIFIED" | "REJECTED") {
    setError(""); setNotice("");
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      setNotice(status === "VERIFIED" ? t("approved") : t("reject"));
      router.refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : t("requestFailed")); }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="container page-shell">
      <div className="section-head">
        <div><span className="eyebrow">{role === "FOUNDER" ? t("founderRole") : role === "ADMIN" ? t("adminRole") : t("staffRole")}</span><h1 className="page-title">{t("adminPanel")}</h1><p className="muted">{t("changesStored")}</p></div>
        <button className="button ghost" onClick={logout}>{t("logout")}</button>
      </div>
      {(error || notice) && <div className={`notice ${error ? "error" : "success"}`} role="status">{error || notice}</div>}
      <div className="admin-workspace-layout">
        <aside className={`admin-sidebar ${sidebarOpen ? "" : "collapsed"}`} aria-label={t("adminSections")}>
          <button className="admin-sidebar-toggle button ghost" type="button" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(!sidebarOpen)} title={t("toggleSidebar")}>☰</button>
          <nav className="admin-sidebar-nav">
            {visibleSections.map((section) => (
              <button key={section} className={`admin-sidebar-item ${selectedSection === section ? "active" : ""}`} type="button" title={t(sectionLabelKeys[section])} onClick={() => { setActiveSection(section); setRequestFilter(""); }}>
                <span className="admin-sidebar-marker" aria-hidden="true">{section === "requests" ? "R" : section === "projects" ? "P" : section === "services" ? "S" : section === "products" ? "M" : section === "news" ? "N" : section === "company" ? "C" : section === "users" ? "U" : section === "invoices" ? "I" : section === "subscriptions" ? "T" : section === "system" ? "!" : section === "content" ? "B" : "$"}</span>
                {sidebarOpen && <span>{t(sectionLabelKeys[section])}</span>}
                {sidebarOpen && section === "requests" && <span className="admin-sidebar-count">{requests.length}</span>}
                {sidebarOpen && section === "users" && <span className="admin-sidebar-count">{metrics.users}</span>}
              </button>
            ))}
          </nav>
        </aside>
        <div className="admin-section-content">
        {visibleSections.includes("services") && <section className={`panel-card admin-panel-section ${selectedSection === "services" ? "active" : ""}`}>
          <h2>{t("serviceCatalog")}</h2>
          <form className="form" key={editingService?.id ?? "new-service"} onSubmit={saveService}>
            <div className="form-row">
              <div className="field"><label>{t("formName")}</label><input name="name" defaultValue={editingService?.name ?? ""} required minLength={2} maxLength={120} /></div>
              <div className="field"><label>{t("iconOptional")}</label><input name="icon" defaultValue={editingService?.icon ?? "IT"} maxLength={12} /></div>
            </div>
            <div className="field"><label>{t("description")}</label><textarea name="description" defaultValue={editingService?.description ?? ""} required minLength={5} maxLength={5000} /></div>
            <MediaUploader scope="SERVICES" value={serviceMedia} onChange={setServiceMedia} />
            <div className="form-row">
              <div className="field"><label>{t("priceModel")}</label><select name="pricingType" defaultValue={editingService?.pricingType ?? "QUOTE"}><option value="QUOTE">{t("quoteBased")}</option><option value="ONE_TIME">{t("oneTime")}</option><option value="MONTHLY">{t("monthly")}</option><option value="ANNUAL">{t("annual")}</option></select></div>
              <div className="field"><label>{t("publicationStatus")}</label><select name="status" defaultValue={editingService?.status ?? "PUBLISHED"}><option value="PUBLISHED">{t("publish")}</option><option value="DRAFT">{t("draft")}</option><option value="ARCHIVED">{t("archived")}</option></select></div>
            </div>
            <div className="form-row"><div className="field"><label>{t("optionalPriceMinor")}</label><input name="startingPriceMinor" type="number" min="0" defaultValue={editingService?.startingPriceMinor ?? ""} /></div><div className="field"><label>{t("currency")}</label><input name="currency" defaultValue={editingService?.currency ?? "UZS"} minLength={3} maxLength={3} required /></div></div>
            <div className="hero-actions"><button className="button" disabled={busy}>{editingService ? t("save") : t("addService")}</button>{editingService && <button className="button ghost" type="button" onClick={() => { setEditingService(null); setServiceMedia([]); }}>{t("cancel")}</button>}</div>
          </form>
          <div className="list" style={{ marginTop: 22 }}>{services.map((service) => (
            <div className="list-row" key={service.id}>
              <div><strong>{service.name}</strong><p>{service.status} · {service.pricingType}</p><MediaGallery media={service.media} title={service.name} /></div>
              <div className="hero-actions"><button className="button secondary small" onClick={() => { setEditingService(service); setServiceMedia(Array.isArray(service.media) ? service.media.filter((id): id is string => typeof id === "string") : []); }}>{t("edit")}</button>{service.status !== "ARCHIVED" && <button className="button danger small" onClick={() => archiveService(service.id)}>{t("archive")}</button>}</div>
            </div>
          ))}</div>
        </section>}

        {visibleSections.includes("products") && <section className={`panel-card admin-panel-section ${selectedSection === "products" ? "active" : ""}`}>
          <h2>{t("newProduct")}</h2>
          <form className="form" key={editingProduct?.id ?? "new-product"} onSubmit={saveProduct}>
            <div className="form-row"><div className="field"><label>{t("formName")}</label><input name="name" defaultValue={editingProduct?.name ?? ""} required minLength={2} maxLength={160} /></div><div className="field"><label>{t("optionalSku")}</label><input name="sku" defaultValue={editingProduct?.sku ?? ""} maxLength={80} /></div></div>
            <div className="field"><label>{t("description")}</label><textarea name="description" defaultValue={editingProduct?.description ?? ""} required minLength={5} maxLength={5000} /></div>
            <MediaUploader scope="PRODUCTS" value={productMedia} onChange={setProductMedia} />
            <div className="form-row"><div className="field"><label>{t("brand")}</label><input name="brand" defaultValue={editingProduct?.brand ?? ""} maxLength={100} /></div><div className="field"><label>{t("model")}</label><input name="model" defaultValue={editingProduct?.model ?? ""} maxLength={120} /></div></div>
            <div className="field"><label>{t("warrantyDescription")}</label><input name="warrantyDescription" defaultValue={editingProduct?.warrantyDescription ?? ""} maxLength={500} /></div>
            <div className="form-row"><div className="field"><label>{t("optionalMinorPrice")}</label><input name="priceMinor" type="number" min="0" step="1" defaultValue={editingProduct?.priceMinor ?? ""} /></div><div className="field"><label>{t("currency")}</label><input name="currency" defaultValue={editingProduct?.currency ?? "UZS"} minLength={3} maxLength={3} required /></div></div>
            <div className="form-row"><div className="field"><label>{t("stockStatus")}</label><select name="stockStatus" defaultValue={editingProduct?.stockStatus ?? "UNKNOWN"}><option value="UNKNOWN">{t("unknown")}</option><option value="IN_STOCK">{t("inStock")}</option><option value="OUT_OF_STOCK">{t("outOfStock")}</option><option value="ON_REQUEST">{t("onRequest")}</option></select></div><div className="field"><label>{t("publicationStatus")}</label><select name="status" defaultValue={editingProduct?.status ?? "DRAFT"}><option value="DRAFT">{t("draft")}</option><option value="PUBLISHED">{t("publish")}</option><option value="ARCHIVED">{t("archived")}</option></select></div></div>
            <p className="small muted">{t("verifiedPriceWarning")}</p>
            <div className="hero-actions"><button className="button" disabled={busy}>{editingProduct ? t("save") : t("addProduct")}</button>{editingProduct && <button className="button ghost" type="button" onClick={() => setEditingProduct(null)}>{t("cancel")}</button>}</div>
          </form>
          <div className="list" style={{ marginTop: 20 }}>{products.map((product) => <div className="list-row" key={product.id}><div><strong>{product.name}</strong><p>{product.sku ?? t("noSku")} · {product.stockStatus} · {product.status}</p><span className="status">{product.priceMinor === null ? t("noPrice") : `${(product.priceMinor / 100).toLocaleString("uz-UZ")} ${product.currency}`}</span><MediaGallery media={product.media} title={product.name} /></div><div className="hero-actions"><button className="button secondary small" onClick={() => { setEditingProduct(product); setProductMedia(Array.isArray(product.media) ? product.media.filter((id): id is string => typeof id === "string") : []); }}>{t("edit")}</button>{product.status !== "ARCHIVED" && <button className="button danger small" onClick={() => archiveRecord(`/api/products/${product.id}`, "Product")}>{t("archive")}</button>}</div></div>)}</div>
        </section>}

        {visibleSections.includes("news") && <section className={`panel-card admin-panel-section ${selectedSection === "news" ? "active" : ""}`}>
          <h2>{t("newsCms")}</h2>
          <form className="form" key={editingArticle?.id ?? "new-article"} onSubmit={saveArticle}>
            <div className="field"><label>{t("articleTitle")}</label><input name="title" minLength={3} maxLength={180} defaultValue={editingArticle?.title ?? ""} required /></div>
            <div className="field"><label>{t("articleExcerpt")}</label><textarea name="excerpt" minLength={5} maxLength={500} defaultValue={editingArticle?.excerpt ?? ""} required /></div>
            <div className="field"><label>{t("articleContent")}</label><textarea name="content" minLength={20} maxLength={20000} defaultValue={editingArticle?.content ?? ""} required /></div>
            <MediaUploader scope="NEWS" value={articleMedia} onChange={setArticleMedia} />
            <div className="field"><label>{t("status")}</label><select name="status" defaultValue={editingArticle?.status ?? "DRAFT"}><option value="DRAFT">{t("draft")}</option><option value="PUBLISHED">{t("publish")}</option><option value="ARCHIVED">{t("archived")}</option></select></div>
            <div className="hero-actions"><button className="button" disabled={busy}>{editingArticle ? t("save") : t("news")}</button>{editingArticle && <button className="button ghost" type="button" onClick={() => { setEditingArticle(null); setArticleMedia([]); }}>{t("cancel")}</button>}</div>
          </form>
          <div className="list" style={{ marginTop: 20 }}>{articles.map((article) => <div className="list-row" key={article.id}>
            <div><strong>{article.title}</strong><p>{article.status} · {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : t("notPublished")}</p><MediaGallery media={article.media} title={article.title} /></div>
            <div className="hero-actions"><button className="button secondary small" onClick={() => { setEditingArticle(article); setArticleMedia(Array.isArray(article.media) ? article.media.filter((id): id is string => typeof id === "string") : []); }}>{t("edit")}</button>{article.status !== "ARCHIVED" && <button className="button danger small" onClick={() => archiveRecord(`/api/news/${article.id}`, "News")}>{t("archive")}</button>}</div>
          </div>)}</div>
        </section>}

        {visibleSections.includes("requests") && <section className={`panel-card admin-panel-section ${selectedSection === "requests" ? "active" : ""}`}>
          <h2>{t("incomingRequests")}</h2>
          <div className="request-status-grid">
            {[
              ["NEW", t("newRequests"), requests.filter((item) => item.status === "NEW").length],
              ["IN_PROGRESS", t("inProgressRequests"), requests.filter((item) => item.status === "IN_PROGRESS").length],
              ["COMPLETED", t("completedRequests"), requests.filter((item) => item.status === "COMPLETED").length],
              ["REJECTED", t("rejectedRequests"), requests.filter((item) => item.status === "REJECTED").length]
            ].map(([status, label, count]) => <button className={`request-status-tile ${requestFilter === status ? "active" : ""}`} type="button" key={String(status)} onClick={() => setRequestFilter(requestFilter === status ? "" : String(status))}><span>{label}</span><strong>{count}</strong></button>)}
          </div>
          <h3>{t("allRequests")} · {requests.length}</h3>
          {requests.length ? <div className="list">{requests.filter((item) => !requestFilter || item.status === requestFilter).map((request) => (
            <article className="list-row" key={request.id}>
              <div><strong>{request.reference} · {request.name}</strong><p>{request.phone} · {request.email ?? t("emailMissing")} · {request.service?.name ?? t("advice")}</p><p>{request.description}</p><span className={`status ${request.status}`}>{request.status}</span></div>
              <label className="field small">{t("status")}<select className="input" aria-label={`${request.reference} ${t("status")}`} defaultValue="" onChange={(event) => event.target.value && changeRequest(request.id, event.target.value)}><option value="">{t("change")}</option>{requestStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
            </article>
          ))}</div> : <div className="empty-state">{t("noRequests")}</div>}
        </section>}

        {visibleSections.includes("company") && <section className={`panel-card admin-panel-section ${selectedSection === "company" ? "active" : ""}`}>
          <h2>{t("companyInformation")}</h2>
          <form className="form" onSubmit={updateSettings}>
            <div className="field"><label>{t("companyName")}</label><input name="companyName" defaultValue={settings.companyName ?? "Tecsecure"} maxLength={120} required /></div>
            <div className="form-row"><div className="field"><label>{t("phone")}</label><input name="phone" defaultValue={settings.phone ?? ""} maxLength={120} placeholder="+998...; +998..." /></div><div className="field"><label>{t("email")}</label><input name="email" type="email" defaultValue={settings.email ?? "itstars134567890@gmail.com"} maxLength={254} /></div></div>
            <div className="form-row"><div className="field"><label>{t("telegramHandle")}</label><input name="telegram" defaultValue={settings.telegram ?? "@abdiazizov_m_ali"} maxLength={80} /></div><div className="field"><label>{t("instagramHandle")}</label><input name="instagram" defaultValue={settings.instagram ?? "@abdiazizov_m_ali"} maxLength={80} /></div></div>
            <div className="field"><label>{t("address")}</label><input name="address" defaultValue={settings.address ?? ""} maxLength={300} /></div>
            <p className="small muted">{t("providerNotice")}</p>
            <button className="button" disabled={busy}>{t("saveSettings")}</button>
          </form>
          <section className="site-appearance">
            <h3>{t("siteAppearance")}</h3>
            <p className="small muted">{t("siteAppearanceHint")}</p>
            <form className="site-design-grid" onSubmit={updateSettings}>
              {designOptions.map(({ id, name, font }) => (
                <label className="site-design-option" key={id}>
                  <input className="sr-only" type="radio" name="siteDesign" value={id} defaultChecked={(isSiteDesign(settings.siteDesign) ? settings.siteDesign : "midnight") === id} />
                  <span className={`site-design-preview site-design-preview-${id}`} aria-hidden="true">
                    <span className="site-design-preview-top"><i /><i /><i /></span>
                    <span className="site-design-preview-line" />
                    <span className="site-design-preview-line short" />
                  </span>
                  <span className="site-design-option-title">{name}</span>
                  <span className="site-design-option-font">{font}</span>
                </label>
              ))}
              <button className="button site-design-save" disabled={busy}>{t("saveSettings")}</button>
            </form>
          </section>
          <h3 style={{ marginTop: 25 }}>{t("notifications")}</h3>
          {notifications.length ? <div className="list">{notifications.map((item) => <div className="list-row" key={item.id}><span>{item.event}</span><span className={`status ${item.status}`}>{item.status}</span><span className="small muted">{new Date(item.createdAt).toLocaleString()}</span></div>)}</div> : <p className="muted">{t("noNotifications")}</p>}
        </section>}

        {visibleSections.includes("projects") && <section className={`panel-card admin-panel-section ${selectedSection === "projects" ? "active" : ""}`}>
          <h2>{t("projectQuotes")}</h2>
          {projects.length ? <div className="list">{projects.map((project) => (
            <div className="list-row" key={project.id}>
              <div><strong>{project.name}</strong><p>{project.city ?? t("cityNotProvided")} · {project.status}</p><p>{project.items.map((item) => `${item.product?.name ?? item.service?.name ?? t("unknownItem")} × ${item.quantity}`).join(", ") || t("itemsNotProvided")}</p>
                <form className="form" style={{ marginTop: 12 }} onSubmit={(event) => issueQuote(event, project.id)}>
                  <div className="field"><label>{t("quoteLine")}</label><input name="description" placeholder={t("quoteItemPlaceholder")} required minLength={2} maxLength={500} /></div>
                  <div className="form-row"><div className="field"><label>{t("quantity")}</label><input name="quantity" type="number" min="1" defaultValue="1" required /></div><div className="field"><label>{t("unitPriceMinor")}</label><input name="unitPriceMinor" type="number" min="0" required /></div></div>
                  <div className="field"><label>{t("discountMinor")}</label><input name="discountMinor" type="number" min="0" defaultValue="0" /></div>
                  <div className="field"><label>{t("assumptions")}</label><textarea name="assumptions" maxLength={5000} /></div>
                  <div className="field"><label>{t("exclusions")}</label><textarea name="exclusions" maxLength={5000} /></div>
                  <button className="button secondary" disabled={busy}>{t("issueQuote")}</button>
                </form>
              </div>
            </div>
          ))}</div> : <div className="empty-state">{t("noProjects")}</div>}
        </section>}

        {visibleSections.includes("invoices") && <section className={`panel-card admin-panel-section ${selectedSection === "invoices" ? "active" : ""}`}>
          <h2>{t("createInvoice")}</h2>
          {quotations.length ? <div className="list">{quotations.map((quote) => (
            <div className="list-row" key={quote.id}>
              <div><strong>{quote.number} · {quote.project.name}</strong><p>{quote.currency} · {quote.invoices.length ? quote.invoices.map((invoice) => `${invoice.number} (${invoice.status})`).join(", ") : t("noInvoiceIssued")}</p></div>
              {!quote.invoices.length && <button className="button secondary" onClick={() => createInvoice(quote.id)}>{t("createInvoice")}</button>}
            </div>
          ))}</div> : <div className="empty-state">{t("noProjects")}</div>}
        </section>}

        {visibleSections.includes("subscriptions") && <section className={`panel-card admin-panel-section ${selectedSection === "subscriptions" ? "active" : ""}`}>
          <h2>{t("monitoringPlans")}</h2>
          <form className="form" key={editingPlan?.id ?? "new-plan"} onSubmit={savePlan}>
            <div className="form-row"><div className="field"><label>{t("planName")}</label><input name="name" defaultValue={editingPlan?.name ?? ""} minLength={2} maxLength={100} required /></div><div className="field"><label>{t("billingInterval")}</label><select name="interval" defaultValue={editingPlan?.interval ?? "MONTHLY"}><option value="MONTHLY">{t("monthly")}</option><option value="ANNUAL">{t("annual")}</option><option value="CUSTOM">{t("custom")}</option></select></div></div>
            <div className="form-row"><div className="field"><label>{t("optionalPriceMinor")}</label><input name="priceMinor" type="number" min="0" defaultValue={editingPlan?.priceMinor ?? ""} /></div><div className="field"><label>{t("currency")}</label><input name="currency" defaultValue={editingPlan?.currency ?? "UZS"} minLength={3} maxLength={3} required /></div></div>
            <div className="form-row"><div className="field"><label>{t("trialDaysRange")}</label><input name="trialDays" type="number" min="0" max="90" defaultValue={editingPlan?.trialDays ?? 30} required /></div><div className="field"><label>{t("planFeatures")}</label><input name="features" defaultValue={editingPlan?.features.join(", ") ?? ""} maxLength={1000} /></div></div>
            <p className="small muted">{t("planBillingWarning")}</p>
            <div className="hero-actions"><button className="button" disabled={busy}>{editingPlan ? t("save") : t("addPlan")}</button>{editingPlan && <button className="button ghost" type="button" onClick={() => setEditingPlan(null)}>{t("cancel")}</button>}</div>
          </form>
          <div className="list" style={{ marginTop: 18 }}>{plans.map((plan) => <div className="list-row" key={plan.id}><div><strong>{plan.name}</strong><p className="small muted">{plan.active ? t("active") : t("archived")} · {plan.interval} · {plan.trialDays} {t("trialDays")} · {plan.priceMinor === null ? t("negotiatedPrice") : `${(plan.priceMinor / 100).toLocaleString("uz-UZ")} ${plan.currency}`}</p></div><div className="hero-actions"><button className="button secondary small" onClick={() => setEditingPlan(plan)}>{t("edit")}</button><button className={`button small ${plan.active ? "danger" : "secondary"}`} disabled={busy} onClick={() => togglePlan(plan)}>{plan.active ? t("archive") : t("enableAccount")}</button></div></div>)}</div>
        </section>}

        {visibleSections.includes("payments") && <section className={`panel-card admin-panel-section ${selectedSection === "payments" ? "active" : ""}`}>
          <h2>{t("pendingPayments")}</h2>
          {pendingPayments.length ? <div className="list">{pendingPayments.map((payment) => (
            <div className="list-row" key={payment.id}>
              <div><strong>{payment.invoice.number} · {payment.reference}</strong><p>{(payment.amountMinor / 100).toLocaleString("uz-UZ")} {payment.currency} · {payment.method}</p></div>
              <div className="hero-actions"><button className="button" onClick={() => reviewPayment(payment.id, "VERIFIED")}>{t("verifyPayment")}</button><button className="button danger" onClick={() => reviewPayment(payment.id, "REJECTED")}>{t("reject")}</button></div>
            </div>
          ))}</div> : <div className="empty-state">{t("noPendingPayments")}</div>}
          <p className="small muted">{t("paymentProviderWarning")}</p>
        </section>}
        {visibleSections.includes("content") && <div className={`admin-panel-section ${selectedSection === "content" ? "active" : ""}`}><SiteBlockManager blocks={siteBlocks} /></div>}
        {visibleSections.includes("portfolio") && <div className={`admin-panel-section ${selectedSection === "portfolio" ? "active" : ""}`}><PortfolioManager posts={portfolioPosts} /></div>}
        {visibleSections.includes("wallet") && <div className={`admin-panel-section ${selectedSection === "wallet" ? "active" : ""}`}>
          {isPrivileged && <TecGiftManager users={users} actorId={actorId} />}
          <WalletReviewManager transactions={walletRequests} />
        </div>}
        {visibleSections.includes("system") && <div className={`admin-panel-section ${selectedSection === "system" ? "active" : ""}`}><SystemStatus /></div>}
        {visibleSections.includes("users") && <div className={`admin-panel-section ${selectedSection === "users" ? "active" : ""}`}><StaffManagement users={users} founder={role === "FOUNDER"} /></div>}
        </div>
      </div>
    </div>
  );
}
