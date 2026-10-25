"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import type { RequestStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";
import { UiIcon, type IconName } from "@/components/ui-icon";
import { StaffManagement } from "@/components/staff-management";
import { SiteBlockManager, type SiteBlockRecord } from "@/components/site-block-manager";
import { PortfolioManager } from "@/components/portfolio-manager";
import { WalletReviewManager } from "@/components/wallet-panel";
import { TecGiftManager } from "@/components/tec-gift-manager";
import { SystemStatus } from "@/components/system-status";
import { AdminIntegrations } from "@/components/admin-integrations";
import { MediaGallery, MediaUploader } from "@/components/media-uploader";
import { ProductVisual } from "@/components/product-visual";
import { LearningContentManager } from "@/components/learning-content-manager";
import type { AdminModule } from "@/lib/auth";
import type { MessageKey } from "@/lib/messages";
import { isSiteDesign, type SiteDesign } from "@/lib/site-designs";
import { canTransitionRequest } from "@/lib/request-status";
import { parseProductDetails, formatProductDetails } from "@/lib/product-details";
import { supportedCurrencies } from "@/lib/currency";

type Service = { id: string; name: string; description: string; icon: string | null; status: string; pricingType: string; startingPriceMinor: number | null; currency: string; availability: boolean; media: unknown };
type RequestRecord = {
  id: string;
  reference: string;
  name: string;
  phone: string;
  email: string | null;
  organizationName: string | null;
  city: string | null;
  location: string | null;
  budgetRange: string | null;
  preferredContactTime: string | null;
  description: string;
  status: RequestStatus;
  service: { name: string } | null;
  customer: { id: string; name: string; email: string; phone: string | null } | null;
  history: { id: string; fromStatus: RequestStatus | null; toStatus: RequestStatus; actor: { name: string; email: string } | null; note: string | null; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
};
type Product = { id: string; name: string; sku: string | null; brand: string | null; model: string | null; categoryId: string | null; category: { name: string; slug: string } | null; specifications: unknown; compatibility: unknown; warrantyDescription: string | null; status: string; priceMinor: number | null; currency: string; stockStatus: string; description: string; media: unknown };
type ProductCategory = { id: string; name: string };
type Project = { id: string; name: string; status: string; customerId: string | null; city: string | null; items: { id: string; quantity: number; product: { name: string } | null; service: { name: string } | null }[] };
type Article = { id: string; title: string; excerpt: string; content: string; status: string; publishedAt: Date | null; media: unknown };
type Notice = { id: string; event: string; status: string; createdAt: Date };
type AcceptedQuote = { id: string; number: string; currency: string; project: { name: string }; invoices: { id: string; number: string; status: string }[] };
type PendingPayment = { id: string; amountMinor: number; currency: string; method: string; reference: string; invoice: { id: string; number: string; currency: string } };
type Plan = { id: string; name: string; interval: string; priceMinor: number | null; currency: string; trialDays: number; active: boolean; features: string[] };
type ManagedUser = { id: string; name: string; email: string; role: "CUSTOMER" | "STAFF" | "ADMIN" | "FOUNDER"; active: boolean; permissions: string[] };
type AdminSection = "requests" | "projects" | "services" | "products" | "news" | "company" | "users" | "invoices" | "subscriptions" | "payments" | "content" | "learning" | "portfolio" | "wallet" | "system";
type AdminNavigationSection = AdminSection | "management";
type ManagementGroup = "catalog" | "content" | "operations";
const managementSections: AdminSection[] = [
  "services", "products", "news", "learning", "invoices", "content",
  "company", "subscriptions", "portfolio", "system"
];
const managementGroupSections: Record<ManagementGroup, AdminSection[]> = {
  catalog: ["services", "products"],
  content: ["learning", "news", "content", "portfolio"],
  operations: ["company", "invoices", "subscriptions", "system"]
};
const managementGroupLabelKeys: Record<ManagementGroup, MessageKey> = {
  catalog: "managementCatalog",
  content: "managementContent",
  operations: "managementOperations"
};
const sectionModules: Record<AdminSection, AdminModule> = {
  requests: "REQUESTS", projects: "PROJECTS", services: "SERVICES", products: "PRODUCTS", news: "NEWS",
  company: "COMPANY", users: "USERS", invoices: "PAYMENTS", subscriptions: "SUBSCRIPTIONS", payments: "PAYMENTS",
  content: "CONTENT", learning: "CONTENT", portfolio: "PORTFOLIO", wallet: "WALLET", system: "SYSTEM"
};
const sectionLabelKeys: Record<AdminSection, MessageKey> = {
  requests: "incomingRequests", projects: "projectQuotes", services: "serviceCatalog", products: "products",
  news: "newsCms", company: "companyInformation", users: "usersAndStaff", invoices: "invoices",
  subscriptions: "monitoringPlans", payments: "pendingPayments", content: "siteBlocks", learning: "learningContent",
  portfolio: "portfolioManagement", wallet: "walletReview", system: "integrationsTitle"
};
const sectionIcons: Record<AdminSection, IconName> = {
  requests: "clipboard",
  projects: "network",
  services: "toolbox",
  products: "box",
  news: "newspaper",
  company: "building",
  users: "users",
  invoices: "receipt",
  subscriptions: "monitor",
  payments: "creditCard",
  content: "layout",
  learning: "book",
  portfolio: "briefcase",
  wallet: "wallet",
  system: "server"
};

const requestStatuses: RequestStatus[] = ["NEW", "UNDER_REVIEW", "CONTACTED", "INSPECTION_REQUIRED", "QUOTATION_SENT", "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED", "CANCELLED"];
const activeRequestStatuses: RequestStatus[] = ["UNDER_REVIEW", "CONTACTED", "INSPECTION_REQUIRED", "QUOTATION_SENT", "APPROVED", "IN_PROGRESS"];
const closedRequestStatuses: RequestStatus[] = ["REJECTED", "CANCELLED"];
const requestStatusLabelKeys: Record<RequestStatus, MessageKey> = {
  NEW: "requestStatusNew",
  UNDER_REVIEW: "requestStatusReview",
  CONTACTED: "requestStatusContacted",
  INSPECTION_REQUIRED: "requestStatusInspection",
  QUOTATION_SENT: "requestStatusQuotation",
  APPROVED: "requestStatusApproved",
  IN_PROGRESS: "requestStatusInProgress",
  COMPLETED: "requestStatusCompleted",
  REJECTED: "requestStatusRejected",
  CANCELLED: "requestStatusCancelled"
};
const designOptions: { id: SiteDesign; name: string; font: string }[] = [
  { id: "midnight", name: "Midnight", font: "DM Sans · Manrope" },
  { id: "ocean", name: "Ocean", font: "Outfit" },
  { id: "forest", name: "Forest", font: "IBM Plex Sans" },
  { id: "ember", name: "Ember", font: "Space Grotesk" },
  { id: "violet", name: "Violet", font: "Space Grotesk · DM Sans" },
  { id: "editorial", name: "Editorial", font: "Playfair Display · DM Sans" },
  { id: "terminal", name: "Terminal", font: "JetBrains Mono" }
];

export function AdminWorkspace({ services, requests: initialRequests, requestStats, requestTotal, products, productCategories, articles, settings, notifications, projects, quotations, pendingPayments, plans, users, siteBlocks, portfolioPosts, walletRequests, metrics, role, permissions, actorId }: {
  services: Service[];
  requests: RequestRecord[];
  requestStats: Partial<Record<RequestStatus, number>>;
  requestTotal: number;
  products: Product[];
  productCategories: ProductCategory[];
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
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [productMedia, setProductMedia] = useState<string[]>([]);
  const [editingProductMedia, setEditingProductMedia] = useState<string[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleMedia, setArticleMedia] = useState<string[]>([]);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const serviceEditorRef = useRef<HTMLDetailsElement>(null);
  const productEditorRef = useRef<HTMLDetailsElement>(null);
  const articleEditorRef = useRef<HTMLDetailsElement>(null);
  const planEditorRef = useRef<HTMLDetailsElement>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>("requests");
  const [managementGroup, setManagementGroup] = useState<ManagementGroup>("catalog");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [requestFilter, setRequestFilter] = useState("");
  const [requestSearch, setRequestSearch] = useState("");
  const [additionalRequests, setAdditionalRequests] = useState<RequestRecord[]>([]);
  const [loadingMoreRequests, setLoadingMoreRequests] = useState(false);
  const requests = useMemo(() => {
    const unique = new Map(initialRequests.map((request) => [request.id, request]));
    for (const request of additionalRequests) {
      if (!unique.has(request.id)) unique.set(request.id, request);
    }
    return [...unique.values()];
  }, [initialRequests, additionalRequests]);
  const isPrivileged = role === "FOUNDER" || role === "ADMIN";
  const availableSections = useMemo(() => (Object.keys(sectionModules) as AdminSection[]).filter((section) =>
    isPrivileged ? true : section !== "users" && permissions.includes(sectionModules[section])
  ), [isPrivileged, permissions]);
  const availableManagementSections = useMemo(
    () => managementSections.filter((section) => availableSections.includes(section)),
    [availableSections]
  );
  const availableManagementGroups = useMemo(
    () => (Object.keys(managementGroupSections) as ManagementGroup[]).filter((group) =>
      managementGroupSections[group].some((section) => availableManagementSections.includes(section))
    ),
    [availableManagementSections]
  );
  const selectedManagementGroup = availableManagementGroups.includes(managementGroup)
    ? managementGroup
    : availableManagementGroups[0];
  const visibleManagementSections = selectedManagementGroup
    ? managementGroupSections[selectedManagementGroup].filter((section) => availableManagementSections.includes(section))
    : [];
  const visibleSections = useMemo<AdminNavigationSection[]>(() => {
    const standalone = availableSections.filter((section) => !managementSections.includes(section));
    return availableManagementSections.length ? [...standalone, "management"] : standalone;
  }, [availableSections, availableManagementSections]);
  const selectedSection = availableSections.includes(activeSection)
    ? activeSection
    : availableManagementSections[0] ?? availableSections[0] ?? "requests";
  const selectedNavigation: AdminNavigationSection = managementSections.includes(selectedSection) ? "management" : selectedSection;
  function selectManagementGroup(group: ManagementGroup) {
    setManagementGroup(group);
    const firstSection = managementGroupSections[group].find((section) => availableManagementSections.includes(section));
    if (firstSection) setActiveSection(firstSection);
  }
  const filteredRequests = useMemo(() => {
    const query = requestSearch.trim().toLocaleLowerCase();
    return requests.filter((request) => {
      const statusMatches = !requestFilter
        || (requestFilter === "ACTIVE" && activeRequestStatuses.includes(request.status))
        || (requestFilter === "CLOSED" && closedRequestStatuses.includes(request.status))
        || requestFilter === request.status;
      const searchable = [
        request.reference, request.name, request.phone, request.email, request.organizationName,
        request.city, request.location, request.description, request.service?.name
      ].filter(Boolean).join(" ").toLocaleLowerCase();
      return statusMatches && (!query || searchable.includes(query));
    });
  }, [requests, requestFilter, requestSearch]);

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
      setEditingService(null); setServiceMedia([]); form.reset(); if (serviceEditorRef.current) serviceEditorRef.current.open = false; setNotice(editingService ? t("save") : t("addService")); router.refresh();
    } catch (issue) { setError(issue instanceof Error ? issue.message : t("requestFailed")); }
    finally { setBusy(false); }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const productId = String(data.get("productId") ?? "").trim();
    const activeMedia = productId ? editingProductMedia : productMedia;
    const price = String(data.get("priceMinor") ?? "").trim();
    try {
      const body = {
        name: data.get("name"), description: data.get("description"), sku: data.get("sku"),
        brand: data.get("brand"), model: data.get("model"), warrantyDescription: data.get("warrantyDescription"),
        categoryId: data.get("categoryId") || null,
        specifications: parseProductDetails(String(data.get("specifications") ?? ""), "specifications"),
        compatibility: parseProductDetails(String(data.get("compatibility") ?? ""), "compatibility"),
        priceMinor: price ? Number(price) : null, currency: data.get("currency"),
        stockStatus: data.get("stockStatus"), status: data.get("status"), media: activeMedia
      };
      if (productId) {
        const response = await fetch(`/api/products/${productId}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      } else {
        await post("/api/products", body);
      }
      setEditingProduct(null); setProductMedia([]); setEditingProductMedia([]); form.reset(); if (!productId && productEditorRef.current) productEditorRef.current.open = false; setNotice(productId ? t("save") : t("addProduct")); router.refresh();
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
      setEditingPlan(null); form.reset(); if (planEditorRef.current) planEditorRef.current.open = false; setNotice(editingPlan ? t("save") : t("addPlan")); router.refresh();
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
      setEditingArticle(null); setArticleMedia([]); form.reset(); if (articleEditorRef.current) articleEditorRef.current.open = false; router.refresh();
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

  async function changeRequest(id: string, status: RequestStatus) {
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

  async function loadMoreRequests() {
    const cursor = requests.at(-1)?.id;
    if (!cursor || loadingMoreRequests) return;
    setLoadingMoreRequests(true);
    setError("");
    try {
      const response = await fetch(`/api/requests?cursor=${encodeURIComponent(cursor)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? t("requestFailed"));
      if (!Array.isArray(result.requests)) throw new Error(t("requestFailed"));
      setAdditionalRequests((current) => [...current, ...result.requests as RequestRecord[]]);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : t("requestFailed"));
    } finally {
      setLoadingMoreRequests(false);
    }
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
      <ToastMessage message={error || notice} variant={error ? "error" : "success"} />
      <div className="admin-workspace-layout">
        <aside className={`admin-sidebar ${sidebarOpen ? "" : "collapsed"}`} aria-label={t("adminSections")}>
          <button className="admin-sidebar-toggle button ghost" type="button" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(!sidebarOpen)} title={t("toggleSidebar")}>☰</button>
          <nav className="admin-sidebar-nav">
            {visibleSections.map((section) => (
              <button key={section} className={`admin-sidebar-item ${selectedNavigation === section ? "active" : ""}`} type="button" aria-label={section === "management" ? t("managementSection") : t(sectionLabelKeys[section])} title={section === "management" ? t("managementSection") : t(sectionLabelKeys[section])} onClick={() => { if (section === "management" && selectedManagementGroup) selectManagementGroup(selectedManagementGroup); else if (section !== "management") setActiveSection(section); setRequestFilter(""); }}>
                <span className="admin-sidebar-marker"><UiIcon name={section === "management" ? "layout" : sectionIcons[section]} size={17} /></span>
                {sidebarOpen && <span>{section === "management" ? t("managementSection") : t(sectionLabelKeys[section])}</span>}
                {sidebarOpen && section === "requests" && <span className="admin-sidebar-count">{requestTotal}</span>}
                {sidebarOpen && section === "users" && <span className="admin-sidebar-count">{metrics.users}</span>}
              </button>
            ))}
          </nav>
        </aside>
        <div className="admin-section-content">
        {selectedNavigation === "management" && <>
          <nav className="admin-management-categories" aria-label={t("managementSection")}>
            {availableManagementGroups.map((group) => <button key={group} className={`admin-management-category ${selectedManagementGroup === group ? "active" : ""}`} type="button" aria-pressed={selectedManagementGroup === group} onClick={() => selectManagementGroup(group)}>{t(managementGroupLabelKeys[group])}</button>)}
          </nav>
          <nav className="admin-management-tabs" aria-label={t("managementSection")}>
            {visibleManagementSections.map((section) => <button key={section} className={`button ${selectedSection === section ? "" : "secondary"}`} type="button" aria-current={selectedSection === section ? "page" : undefined} onClick={() => setActiveSection(section)}>{t(sectionLabelKeys[section])}</button>)}
          </nav>
        </>}
        {availableSections.includes("services") && <section className={`panel-card admin-panel-section ${selectedSection === "services" ? "active" : ""}`}>
          <h2>{t("serviceCatalog")}</h2>
          <details className="admin-editor-accordion" ref={serviceEditorRef}>
            <summary>{editingService ? `${t("edit")} · ${editingService.name}` : t("addService")}</summary>
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
              <div className="hero-actions"><button className="button" disabled={busy}>{editingService ? t("save") : t("addService")}</button>{editingService && <button className="button ghost" type="button" onClick={() => { setEditingService(null); setServiceMedia([]); if (serviceEditorRef.current) serviceEditorRef.current.open = false; }}>{t("cancel")}</button>}</div>
            </form>
          </details>
          <details className="admin-records-accordion">
            <summary>{t("serviceCatalog")} · {services.length}</summary>
            <div className="list">{services.map((service) => (
              <div className="list-row" key={service.id}>
                <div><strong>{service.name}</strong><p>{service.status} · {service.pricingType}</p><MediaGallery media={service.media} title={service.name} /></div>
                <div className="hero-actions"><button className="button secondary small" onClick={() => { setEditingService(service); setServiceMedia(Array.isArray(service.media) ? service.media.filter((id): id is string => typeof id === "string") : []); if (serviceEditorRef.current) serviceEditorRef.current.open = true; }}>{t("edit")}</button>{service.status !== "ARCHIVED" && <button className="button danger small" onClick={() => archiveService(service.id)}>{t("archive")}</button>}</div>
              </div>
            ))}</div>
          </details>
        </section>}

        {availableSections.includes("products") && <section className={`panel-card admin-panel-section ${selectedSection === "products" ? "active" : ""}`}>
          <h2>{t("products")}</h2>
          <details className="admin-editor-accordion" ref={productEditorRef}>
            <summary>{t("addProduct")}</summary>
            <form className="form" key="new-product" onSubmit={saveProduct}>
            <div className="form-row"><div className="field"><label>{t("formName")}</label><input name="name" required minLength={2} maxLength={160} /></div><div className="field"><label>{t("optionalSku")}</label><input name="sku" maxLength={80} /></div></div>
            <div className="field"><label>{t("description")}</label><textarea name="description" required minLength={5} maxLength={5000} /></div>
            <MediaUploader scope="PRODUCTS" value={productMedia} onChange={setProductMedia} />
            <p className="small muted">Mahsulot rasmi yoki videosini yuklang: JPG, PNG, WebP, GIF (8 MB gacha), MP4 yoki WebM (32 MB gacha).</p>
            <div className="form-row"><div className="field"><label>{t("brand")}</label><input name="brand" maxLength={100} /></div><div className="field"><label>{t("model")}</label><input name="model" maxLength={120} /></div></div>
            <div className="field"><label>Kategoriya</label><select name="categoryId" defaultValue=""><option value="">Kategoriya tanlanmagan</option>{productCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
            <div className="field"><label>Xususiyatlar</label><textarea name="specifications" rows={5} placeholder={"Portlar: 8\nTezlik: 1 Gbit/s"} /><small className="muted">Har qatorda nom va qiymat yozing. Eski JSON formatini ham kiritishingiz mumkin.</small></div>
            <div className="field"><label>Moslik (ixtiyoriy)</label><textarea name="compatibility" rows={3} placeholder={"Windows\nLinux\nAndroid"} /><small className="muted">Mos platformalarni alohida qatorda yozing yoki «Tizim: Windows, Linux» formatidan foydalaning.</small></div>
            <div className="field"><label>{t("warrantyDescription")}</label><input name="warrantyDescription" maxLength={500} /></div>
            <div className="form-row"><div className="field"><label>{t("optionalMinorPrice")}</label><input name="priceMinor" type="number" min="0" step="1" /></div><div className="field"><label>{t("currency")}</label><select name="currency" defaultValue="UZS">{supportedCurrencies.map((code) => <option key={code} value={code}>{code}</option>)}</select></div></div>
            <div className="form-row"><div className="field"><label>{t("stockStatus")}</label><select name="stockStatus" defaultValue="UNKNOWN"><option value="UNKNOWN">{t("unknown")}</option><option value="IN_STOCK">{t("inStock")}</option><option value="OUT_OF_STOCK">{t("outOfStock")}</option><option value="ON_REQUEST">{t("onRequest")}</option></select></div><div className="field"><label>{t("publicationStatus")}</label><select name="status" defaultValue="DRAFT"><option value="DRAFT">{t("draft")}</option><option value="PUBLISHED">{t("publish")}</option><option value="ARCHIVED">{t("archived")}</option></select></div></div>
            <p className="small muted">{t("verifiedPriceWarning")}</p>
              <div className="hero-actions"><button className="button" disabled={busy}>{t("addProduct")}</button></div>
            </form>
          </details>
          <details className="admin-records-accordion">
            <summary>{t("products")} · {products.length}</summary>
            <div className="admin-product-previews">
            {products.map((product) => <article className="shop-card admin-product-preview" key={product.id}>
              <div className="admin-product-preview-image"><ProductVisual categorySlug={product.category?.slug} /><MediaGallery media={product.media} title={product.name} /></div>
              <div className="shop-card-body">
                <span className="shop-card-cat">{product.category?.name ?? "Kategoriya tanlanmagan"}</span>
                <h3>{product.name}</h3>
                <p className="admin-product-meta">{product.brand} {product.model} · {product.sku ?? t("noSku")}</p>
                <p className="shop-card-desc">{product.description}</p>
                <div className="admin-product-facts"><span>{product.stockStatus}</span><span>{product.status}</span></div>
                <strong className="admin-product-price">{product.priceMinor === null ? t("noPrice") : `${(product.priceMinor / 100).toLocaleString("uz-UZ")} ${product.currency}`}</strong>
                <details
                  className="admin-product-details"
                  open={editingProduct?.id === product.id || expandedProductId === product.id || undefined}
                  onToggle={(event) => {
                    if (event.currentTarget.open) {
                      setExpandedProductId(product.id);
                      if (editingProduct && editingProduct.id !== product.id) {
                        setEditingProduct(null);
                        setEditingProductMedia([]);
                      }
                    } else {
                      setExpandedProductId(null);
                      if (editingProduct?.id === product.id) {
                        setEditingProduct(null);
                        setEditingProductMedia([]);
                      }
                    }
                  }}
                >
                  <summary>{editingProduct?.id === product.id ? `${t("edit")} · ${product.name}` : "To‘liq tavsif va xususiyatlar"}</summary>
                  {editingProduct?.id === product.id ? <form className="form admin-product-inline-editor" key={product.id} onSubmit={saveProduct}>
                    <input type="hidden" name="productId" value={product.id} />
                    <div className="form-row"><div className="field"><label>{t("formName")}</label><input name="name" defaultValue={product.name} required minLength={2} maxLength={160} /></div><div className="field"><label>{t("optionalSku")}</label><input name="sku" defaultValue={product.sku ?? ""} maxLength={80} /></div></div>
                    <div className="field"><label>{t("description")}</label><textarea name="description" defaultValue={product.description} required minLength={5} maxLength={5000} /></div>
                    <MediaUploader scope="PRODUCTS" value={editingProductMedia} onChange={setEditingProductMedia} />
                    <div className="form-row"><div className="field"><label>{t("brand")}</label><input name="brand" defaultValue={product.brand ?? ""} maxLength={100} /></div><div className="field"><label>{t("model")}</label><input name="model" defaultValue={product.model ?? ""} maxLength={120} /></div></div>
                    <div className="field"><label>Kategoriya</label><select name="categoryId" defaultValue={product.categoryId ?? ""}><option value="">Kategoriya tanlanmagan</option>{productCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
                    <div className="form-row"><div className="field"><label>Xususiyatlar</label><textarea name="specifications" rows={5} defaultValue={formatProductDetails(product.specifications)} placeholder={"Portlar: 8\nTezlik: 1 Gbit/s"} /><small className="muted">Har qatorda nom va qiymat yozing; JSON ham qabul qilinadi.</small></div><div className="field"><label>Moslik (ixtiyoriy)</label><textarea name="compatibility" rows={5} defaultValue={formatProductDetails(product.compatibility)} placeholder={"Windows\nLinux\nAndroid"} /><small className="muted">Mosliklarni alohida qatorda yozing yoki nom: qiymat formatidan foydalaning.</small></div></div>
                    <div className="field"><label>{t("warrantyDescription")}</label><input name="warrantyDescription" defaultValue={product.warrantyDescription ?? ""} maxLength={500} /></div>
                    <div className="form-row"><div className="field"><label>{t("optionalMinorPrice")}</label><input name="priceMinor" type="number" min="0" step="1" defaultValue={product.priceMinor ?? ""} /></div><div className="field"><label>{t("currency")}</label><select name="currency" defaultValue={product.currency}>{!supportedCurrencies.some((code) => code === product.currency) && <option value={product.currency}>{product.currency} (eski)</option>}{supportedCurrencies.map((code) => <option key={code} value={code}>{code}</option>)}</select></div></div>
                    <div className="form-row"><div className="field"><label>{t("stockStatus")}</label><select name="stockStatus" defaultValue={product.stockStatus}><option value="UNKNOWN">{t("unknown")}</option><option value="IN_STOCK">{t("inStock")}</option><option value="OUT_OF_STOCK">{t("outOfStock")}</option><option value="ON_REQUEST">{t("onRequest")}</option></select></div><div className="field"><label>{t("publicationStatus")}</label><select name="status" defaultValue={product.status}><option value="DRAFT">{t("draft")}</option><option value="PUBLISHED">{t("publish")}</option><option value="ARCHIVED">{t("archived")}</option></select></div></div>
                    <p className="small muted">{t("verifiedPriceWarning")}</p>
                    <div className="hero-actions"><button className="button" disabled={busy}>{busy ? t("saving") : t("save")}</button><button className="button ghost" type="button" onClick={() => { setEditingProduct(null); setEditingProductMedia([]); }}>{t("cancel")}</button></div>
                  </form> : <>
                    <p>{product.description}</p>
                    <strong>{t("warrantyDescription")}: </strong>{product.warrantyDescription || "—"}
                    <h4>Xususiyatlar</h4><pre>{formatProductDetails(product.specifications) || "—"}</pre>
                    <h4>Moslik</h4><pre>{formatProductDetails(product.compatibility) || "—"}</pre>
                  </>}
                </details>
                <div className="hero-actions admin-product-actions">
                  {editingProduct?.id !== product.id && <button className="button secondary small" type="button" onClick={() => { setEditingProduct(product); setExpandedProductId(product.id); setEditingProductMedia(Array.isArray(product.media) ? product.media.filter((id): id is string => typeof id === "string") : []); }}>{t("edit")}</button>}
                  {product.status !== "ARCHIVED" && <button className="button danger small" onClick={() => archiveRecord(`/api/products/${product.id}`, "Product")}>{t("archive")}</button>}
                </div>
              </div>
            </article>)}
          </div>
          </details>
        </section>}

        {availableSections.includes("learning") && <div className={`admin-panel-section ${selectedSection === "learning" ? "active" : ""}`}><LearningContentManager /></div>}

        {availableSections.includes("news") && <section className={`panel-card admin-panel-section ${selectedSection === "news" ? "active" : ""}`}>
          <h2>{t("newsCms")}</h2>
          <details className="admin-editor-accordion" ref={articleEditorRef}>
            <summary>{editingArticle ? `${t("edit")} · ${editingArticle.title}` : t("news")}</summary>
            <form className="form" key={editingArticle?.id ?? "new-article"} onSubmit={saveArticle}>
            <div className="field"><label>{t("articleTitle")}</label><input name="title" minLength={3} maxLength={180} defaultValue={editingArticle?.title ?? ""} required /></div>
            <div className="field"><label>{t("articleExcerpt")}</label><textarea name="excerpt" minLength={5} maxLength={500} defaultValue={editingArticle?.excerpt ?? ""} required /></div>
            <div className="field"><label>{t("articleContent")}</label><textarea name="content" minLength={20} maxLength={20000} defaultValue={editingArticle?.content ?? ""} required /></div>
            <MediaUploader scope="NEWS" value={articleMedia} onChange={setArticleMedia} />
            <div className="field"><label>{t("status")}</label><select name="status" defaultValue={editingArticle?.status ?? "DRAFT"}><option value="DRAFT">{t("draft")}</option><option value="PUBLISHED">{t("publish")}</option><option value="ARCHIVED">{t("archived")}</option></select></div>
              <div className="hero-actions"><button className="button" disabled={busy}>{editingArticle ? t("save") : t("news")}</button>{editingArticle && <button className="button ghost" type="button" onClick={() => { setEditingArticle(null); setArticleMedia([]); if (articleEditorRef.current) articleEditorRef.current.open = false; }}>{t("cancel")}</button>}</div>
            </form>
          </details>
          <details className="admin-records-accordion">
            <summary>{t("newsCms")} · {articles.length}</summary>
            <div className="list">{articles.map((article) => <div className="list-row" key={article.id}>
            <div><strong>{article.title}</strong><p>{article.status} · {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : t("notPublished")}</p><MediaGallery media={article.media} title={article.title} /></div>
            <div className="hero-actions"><button className="button secondary small" onClick={() => { setEditingArticle(article); setArticleMedia(Array.isArray(article.media) ? article.media.filter((id): id is string => typeof id === "string") : []); if (articleEditorRef.current) articleEditorRef.current.open = true; }}>{t("edit")}</button>{article.status !== "ARCHIVED" && <button className="button danger small" onClick={() => archiveRecord(`/api/news/${article.id}`, "News")}>{t("archive")}</button>}</div>
          </div>)}</div>
          </details>
        </section>}

        {availableSections.includes("requests") && <section className={`panel-card admin-panel-section ${selectedSection === "requests" ? "active" : ""}`}>
          <h2>{t("incomingRequests")}</h2>
          <div className="request-status-grid">
            {[
              ["NEW", t("newRequests"), requestStats.NEW ?? 0],
              ["ACTIVE", t("activeRequests"), activeRequestStatuses.reduce((total, status) => total + (requestStats[status] ?? 0), 0)],
              ["COMPLETED", t("completedRequests"), requestStats.COMPLETED ?? 0],
              ["CLOSED", t("closedRequests"), closedRequestStatuses.reduce((total, status) => total + (requestStats[status] ?? 0), 0)]
            ].map(([status, label, count]) => <button className={`request-status-tile ${requestFilter === status ? "active" : ""}`} type="button" key={String(status)} onClick={() => setRequestFilter(requestFilter === status ? "" : String(status))}><span>{label}</span><strong>{count}</strong></button>)}
          </div>
          <div className="request-filter-bar">
            <label className="field request-search-field">{t("searchRequests")}<input type="search" value={requestSearch} onChange={(event) => setRequestSearch(event.target.value)} placeholder={t("requestSearchPlaceholder")} /></label>
            <label className="field">{t("filterRequestStatus")}<select value={requestFilter && requestFilter !== "ACTIVE" && requestFilter !== "CLOSED" ? requestFilter : ""} onChange={(event) => setRequestFilter(event.target.value)}><option value="">{t("anyRequestStatus")}</option>{requestStatuses.map((status) => <option key={status} value={status}>{t(requestStatusLabelKeys[status])}</option>)}</select></label>
            {(requestFilter || requestSearch) && <button className="button ghost small" type="button" onClick={() => { setRequestFilter(""); setRequestSearch(""); }}>{t("clearRequestFilters")}</button>}
          </div>
          <h3>{t("allRequests")} · {filteredRequests.length} / {requestTotal}</h3>
          {requests.length ? filteredRequests.length ? <div className="admin-request-list">{filteredRequests.map((request) => {
            const allowedTransitions = requestStatuses.filter((status) => canTransitionRequest(request.status, status, false));
            return <article className="admin-request-card" key={request.id}>
              <div className="admin-request-card-head">
                <div><span className="eyebrow">{request.reference}</span><h3>{request.name}</h3><p className="muted">{request.service?.name ?? t("advice")} · {new Date(request.createdAt).toLocaleString()}</p></div>
                <span className={`status ${request.status}`}>{t(requestStatusLabelKeys[request.status])}</span>
              </div>
              <p className="admin-request-description">{request.description}</p>
              <div className="admin-request-contact">
                <span>{request.phone}</span>
                {request.email && <span>{request.email}</span>}
                {request.organizationName && <span>{request.organizationName}</span>}
                {request.city && <span>{request.city}</span>}
              </div>
              <div className="admin-request-actions">
                <a className="button secondary small" href={`tel:${request.phone.replace(/[^\d+]/g, "")}`}>{t("callCustomer")}</a>
                {request.email && <a className="button secondary small" href={`mailto:${request.email}`}>{t("emailCustomer")}</a>}
                <label className="field small">{t("status")}<select disabled={!allowedTransitions.length || busy} aria-label={`${request.reference} ${t("status")}`} defaultValue="" onChange={(event) => { const nextStatus = event.currentTarget.value as RequestStatus | ""; event.currentTarget.value = ""; if (nextStatus) void changeRequest(request.id, nextStatus); }}><option value="">{allowedTransitions.length ? t("change") : t(requestStatusLabelKeys[request.status])}</option>{allowedTransitions.map((status) => <option key={status} value={status}>{t(requestStatusLabelKeys[status])}</option>)}</select></label>
              </div>
              <details className="admin-request-details">
                <summary>{t("requestCrmDetails")}</summary>
                <div className="admin-request-details-grid">
                  <p><strong>{t("requestLocation")}:</strong> {[request.city, request.location].filter(Boolean).join(" · ") || "—"}</p>
                  <p><strong>{t("requestBudget")}:</strong> {request.budgetRange || "—"}</p>
                  <p><strong>{t("requestContactTime")}:</strong> {request.preferredContactTime || "—"}</p>
                  <p><strong>{t("requestCreatedAt")}:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                  <p><strong>{t("requestUpdatedAt")}:</strong> {new Date(request.updatedAt).toLocaleString()}</p>
                  <p><strong>{t("requestAccount")}:</strong> {request.customer?.email ?? t("guestRequest")}</p>
                </div>
                <h4>{t("requestHistory")}</h4>
                {request.history.length ? <ol className="admin-request-history">{request.history.map((item) => <li key={item.id}>
                  <span>{item.fromStatus ? `${t(requestStatusLabelKeys[item.fromStatus])} → ` : ""}{t(requestStatusLabelKeys[item.toStatus])}</span>
                  <small>{new Date(item.createdAt).toLocaleString()} · {item.actor?.name ?? "Mijoz"}</small>
                  {item.note && <p>{item.note}</p>}
                </li>)}</ol> : <p className="muted">{t("noRequests")}</p>}
              </details>
            </article>;
          })}</div> : <div className="empty-state">{t("noRequestMatches")}</div> : <div className="empty-state">{t("noRequests")}</div>}
          {requests.length < requestTotal && <button className="button secondary request-load-more" type="button" disabled={loadingMoreRequests} onClick={() => void loadMoreRequests()}>{loadingMoreRequests ? t("loading") : t("requestLoadMore")} · {requests.length}/{requestTotal}</button>}
        </section>}

        {availableSections.includes("company") && <section className={`panel-card admin-panel-section ${selectedSection === "company" ? "active" : ""}`}>
          <h2>{t("companyInformation")}</h2>
          <details className="admin-editor-accordion">
            <summary>{t("edit")} · {t("companyInformation")}</summary>
            <form className="form" onSubmit={updateSettings}>
              <div className="field"><label>{t("companyName")}</label><input name="companyName" defaultValue={settings.companyName ?? "Tecsecure"} maxLength={120} required /></div>
              <div className="form-row"><div className="field"><label>{t("phone")}</label><input name="phone" defaultValue={settings.phone ?? ""} maxLength={120} placeholder="+998...; +998..." /></div><div className="field"><label>{t("email")}</label><input name="email" type="email" defaultValue={settings.email ?? "itstars134567890@gmail.com"} maxLength={254} /></div></div>
              <div className="form-row"><div className="field"><label>{t("telegramHandle")}</label><input name="telegram" defaultValue={settings.telegram ?? "@abdiazizov_m_ali"} maxLength={80} /></div><div className="field"><label>{t("instagramHandle")}</label><input name="instagram" defaultValue={settings.instagram ?? "@abdiazizov_m_ali"} maxLength={80} /></div></div>
              <div className="field"><label>{t("address")}</label><input name="address" defaultValue={settings.address ?? ""} maxLength={300} /></div>
              <p className="small muted">{t("providerNotice")}</p>
              <button className="button" disabled={busy}>{t("saveSettings")}</button>
            </form>
          </details>
          <details className="admin-records-accordion">
            <summary>{t("siteAppearance")}</summary>
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
          </details>
          <details className="admin-records-accordion">
            <summary>{t("notifications")} · {notifications.length}</summary>
            {notifications.length ? <div className="list">{notifications.map((item) => <div className="list-row" key={item.id}><span>{item.event}</span><span className={`status ${item.status}`}>{item.status}</span><span className="small muted">{new Date(item.createdAt).toLocaleString()}</span></div>)}</div> : <p className="muted" style={{ padding: 14 }}>{t("noNotifications")}</p>}
          </details>
        </section>}

        {availableSections.includes("projects") && <section className={`panel-card admin-panel-section ${selectedSection === "projects" ? "active" : ""}`}>
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

        {availableSections.includes("invoices") && <section className={`panel-card admin-panel-section ${selectedSection === "invoices" ? "active" : ""}`}>
          <h2>{t("createInvoice")}</h2>
          {quotations.length ? <details className="admin-records-accordion"><summary>{t("createInvoice")} · {quotations.length}</summary><div className="list">{quotations.map((quote) => (
            <div className="list-row" key={quote.id}>
              <div><strong>{quote.number} · {quote.project.name}</strong><p>{quote.currency} · {quote.invoices.length ? quote.invoices.map((invoice) => `${invoice.number} (${invoice.status})`).join(", ") : t("noInvoiceIssued")}</p></div>
              {!quote.invoices.length && <button className="button secondary small" onClick={() => createInvoice(quote.id)}>{t("createInvoice")}</button>}
            </div>
          ))}</div></details> : <div className="empty-state">{t("noProjects")}</div>}
        </section>}

        {availableSections.includes("subscriptions") && <section className={`panel-card admin-panel-section ${selectedSection === "subscriptions" ? "active" : ""}`}>
          <h2>{t("monitoringPlans")}</h2>
          <details className="admin-editor-accordion" ref={planEditorRef}>
            <summary>{editingPlan ? `${t("edit")} · ${editingPlan.name}` : t("addPlan")}</summary>
            <form className="form" key={editingPlan?.id ?? "new-plan"} onSubmit={savePlan}>
            <div className="form-row"><div className="field"><label>{t("planName")}</label><input name="name" defaultValue={editingPlan?.name ?? ""} minLength={2} maxLength={100} required /></div><div className="field"><label>{t("billingInterval")}</label><select name="interval" defaultValue={editingPlan?.interval ?? "MONTHLY"}><option value="MONTHLY">{t("monthly")}</option><option value="ANNUAL">{t("annual")}</option><option value="CUSTOM">{t("custom")}</option></select></div></div>
            <div className="form-row"><div className="field"><label>{t("optionalPriceMinor")}</label><input name="priceMinor" type="number" min="0" defaultValue={editingPlan?.priceMinor ?? ""} /></div><div className="field"><label>{t("currency")}</label><input name="currency" defaultValue={editingPlan?.currency ?? "UZS"} minLength={3} maxLength={3} required /></div></div>
            <div className="form-row"><div className="field"><label>{t("trialDaysRange")}</label><input name="trialDays" type="number" min="0" max="90" defaultValue={editingPlan?.trialDays ?? 30} required /></div><div className="field"><label>{t("planFeatures")}</label><input name="features" defaultValue={editingPlan?.features.join(", ") ?? ""} maxLength={1000} /></div></div>
            <p className="small muted">{t("planBillingWarning")}</p>
            <div className="hero-actions"><button className="button" disabled={busy}>{editingPlan ? t("save") : t("addPlan")}</button>{editingPlan && <button className="button ghost" type="button" onClick={() => { setEditingPlan(null); if (planEditorRef.current) planEditorRef.current.open = false; }}>{t("cancel")}</button>}</div>
            </form>
          </details>
          <details className="admin-records-accordion"><summary>{t("monitoringPlans")} · {plans.length}</summary>
            <div className="list">{plans.map((plan) => <div className="list-row" key={plan.id}><div><strong>{plan.name}</strong><p className="small muted">{plan.active ? t("active") : t("archived")} · {plan.interval} · {plan.trialDays} {t("trialDays")} · {plan.priceMinor === null ? t("negotiatedPrice") : `${(plan.priceMinor / 100).toLocaleString("uz-UZ")} ${plan.currency}`}</p></div><div className="hero-actions"><button className="button secondary small" onClick={() => { setEditingPlan(plan); if (planEditorRef.current) planEditorRef.current.open = true; }}>{t("edit")}</button><button className={`button small ${plan.active ? "danger" : "secondary"}`} disabled={busy} onClick={() => togglePlan(plan)}>{plan.active ? t("archive") : t("enableAccount")}</button></div></div>)}</div>
          </details>
        </section>}

        {availableSections.includes("payments") && <section className={`panel-card admin-panel-section ${selectedSection === "payments" ? "active" : ""}`}>
          <h2>{t("pendingPayments")}</h2>
          {pendingPayments.length ? <div className="list">{pendingPayments.map((payment) => (
            <div className="list-row" key={payment.id}>
              <div><strong>{payment.invoice.number} · {payment.reference}</strong><p>{(payment.amountMinor / 100).toLocaleString("uz-UZ")} {payment.currency} · {payment.method}</p></div>
              <div className="hero-actions"><button className="button" onClick={() => reviewPayment(payment.id, "VERIFIED")}>{t("verifyPayment")}</button><button className="button danger" onClick={() => reviewPayment(payment.id, "REJECTED")}>{t("reject")}</button></div>
            </div>
          ))}</div> : <div className="empty-state">{t("noPendingPayments")}</div>}
          <p className="small muted">{t("paymentProviderWarning")}</p>
        </section>}
        {availableSections.includes("content") && <div className={`admin-panel-section ${selectedSection === "content" ? "active" : ""}`}><SiteBlockManager blocks={siteBlocks} /></div>}
        {availableSections.includes("portfolio") && <div className={`admin-panel-section ${selectedSection === "portfolio" ? "active" : ""}`}><PortfolioManager posts={portfolioPosts} /></div>}
        {availableSections.includes("wallet") && <div className={`admin-panel-section ${selectedSection === "wallet" ? "active" : ""}`}>
          {isPrivileged && <TecGiftManager users={users} actorId={actorId} />}
          <WalletReviewManager transactions={walletRequests} />
        </div>}
        {availableSections.includes("system") && <div className={`admin-panel-section ${selectedSection === "system" ? "active" : ""}`}>{isPrivileged && <AdminIntegrations />}<SystemStatus /></div>}
        {availableSections.includes("users") && <div className={`admin-panel-section ${selectedSection === "users" ? "active" : ""}`}><StaffManagement users={users} founder={role === "FOUNDER"} /></div>}
        </div>
      </div>
    </div>
  );
}
