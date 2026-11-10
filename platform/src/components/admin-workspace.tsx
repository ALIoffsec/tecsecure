"use client";

import { growthCopy } from "@/lib/growth-copy";
import { FormEvent, useMemo, useRef, useState } from "react";
import type { RequestStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AccountSessionActions } from "./account-session-actions";
import { useSitePreferences } from "@/components/site-preferences";
import { ToastMessage } from "@/components/toast-provider";
import { UiIcon, type IconName } from "@/components/ui-icon";
import { AdminOverview, type AdminOverviewData } from "@/components/admin-overview";
import { siteCopy } from "@/lib/site-copy";
import { StaffManagement } from "@/components/staff-management";
import { SiteBlockManager, type SiteBlockRecord } from "@/components/site-block-manager";
import { PortfolioManager } from "@/components/portfolio-manager";
import { WalletReviewManager } from "@/components/wallet-panel";
import { TecGiftManager } from "@/components/tec-gift-manager";
import { SystemStatus } from "@/components/system-status";
import { AdminIntegrations } from "@/components/admin-integrations";
import { AdminDeliverySettings } from "@/components/admin-delivery-settings";
import { AdminHomeFacts } from "@/components/admin-home-facts";
import { sellerCopy } from "@/lib/seller-copy";
import { MediaGallery, MediaUploader } from "@/components/media-uploader";
import { AdminProductManager, type AdminCategory } from "@/components/admin-product-manager";
import { LearningContentManager } from "@/components/learning-content-manager";
import type { AdminModule } from "@/lib/auth";
import type { MessageKey } from "@/lib/messages";
import { isSiteDesign, type SiteDesign } from "@/lib/site-designs";
import { canTransitionRequest } from "@/lib/request-status";
import { formatDate, formatDateTime, formatNumber, minorToMajorInput, parseMajorPrice } from "@/lib/format";

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
const publicationLabelKeys: Record<string, MessageKey> = { PUBLISHED: "publish", DRAFT: "draft", ARCHIVED: "archived" };
const pricingLabelKeys: Record<string, MessageKey> = { QUOTE: "quoteBased", ONE_TIME: "oneTime", MONTHLY: "monthly", ANNUAL: "annual" };
const notificationEventLabels: Record<string, string> = {
  ORDER_RECEIVED: "Yangi buyurtma", ORDER_STATUS_CHANGED: "Buyurtma holati o‘zgardi", SUPPORT_MESSAGE_RECEIVED: "Yangi xabar",
  REQUEST_RECEIVED: "Yangi ariza", QUOTE_ISSUED: "Taklif yuborildi", PAYMENT_SUBMITTED: "To‘lov yuborildi"
};
const designOptions: { id: SiteDesign; name: string; font: string }[] = [
  { id: "liquid", name: "Liquid Glass", font: "System UI" },
  { id: "midnight", name: "Midnight", font: "DM Sans · Manrope" },
  { id: "ocean", name: "Ocean", font: "Outfit" },
  { id: "forest", name: "Forest", font: "IBM Plex Sans" },
  { id: "ember", name: "Ember", font: "Space Grotesk" },
  { id: "violet", name: "Violet", font: "Space Grotesk · DM Sans" },
  { id: "editorial", name: "Editorial", font: "Playfair Display · DM Sans" },
  { id: "terminal", name: "Terminal", font: "JetBrains Mono" }
];

function priceFromForm(data: FormData, field: string) {
  const value = parseMajorPrice(String(data.get(field) ?? ""));
  if (value !== null && !Number.isSafeInteger(value)) throw new Error("Narxni to‘g‘ri kiriting, masalan 1250000 yoki 19.99.");
  return value;
}

export function AdminWorkspace({ overview, newOrderCount, pendingShopCount = 0, services, requests: initialRequests, requestStats, requestTotal, productCategories, articles, settings, notifications, projects, quotations, pendingPayments, plans, users, siteBlocks, portfolioPosts, walletRequests, metrics, role, permissions, actorId }: {
  overview: AdminOverviewData;
  newOrderCount: number;
  pendingShopCount?: number;
  services: Service[];
  requests: RequestRecord[];
  requestStats: Partial<Record<RequestStatus, number>>;
  requestTotal: number;
  productCategories: AdminCategory[];
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
  const { t, locale } = useSitePreferences();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceMedia, setServiceMedia] = useState<string[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleMedia, setArticleMedia] = useState<string[]>([]);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const serviceEditorRef = useRef<HTMLDetailsElement>(null);
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
  const [showOverview, setShowOverview] = useState(true);
  const overviewLabel = siteCopy[locale].admin.overview;
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
        startingPriceMinor: priceFromForm(data, "startingPrice"),
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

  async function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const body = {
        name: data.get("name"), interval: data.get("interval"),
        priceMinor: priceFromForm(data, "price"),
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
    const buildItems = () => [{
      description: String(data.get("description") ?? "").trim(),
      quantity: Number(data.get("quantity")),
      unitPriceMinor: priceFromForm(data, "unitPrice") ?? 0,
      discountMinor: priceFromForm(data, "discount") ?? 0,
      serviceId: undefined,
      productId: undefined
    }];
    try {
      const result = await post("/api/quotations", {
        projectId, items: buildItems(), assumptions: data.get("assumptions"),
        exclusions: data.get("exclusions")
      });
      form.reset();
      setNotice(`${t("quote")} ${result.quotation.number} · ${t("total")}: ${formatNumber(result.totalMinor / 100)} ${result.quotation.currency}.`);
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

  return (
    <div className="container page-shell">
      <div className="section-head">
        <div><span className="eyebrow">{role === "FOUNDER" ? t("founderRole") : role === "ADMIN" ? t("adminRole") : t("staffRole")}</span><h1 className="page-title">{t("adminPanel")}</h1><p className="muted">{t("changesStored")}</p></div>
        <AccountSessionActions />
      </div>
      <ToastMessage message={error || notice} variant={error ? "error" : "success"} />
      <div className="admin-workspace-layout">
        <aside className={`admin-sidebar ${sidebarOpen ? "" : "collapsed"}`} aria-label={t("adminSections")}>
          <button className="admin-sidebar-toggle button ghost" type="button" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(!sidebarOpen)} title={t("toggleSidebar")}>☰</button>
          <nav className="admin-sidebar-nav">
            <button className={`admin-sidebar-item ${showOverview ? "active" : ""}`} type="button" aria-label={overviewLabel} title={overviewLabel} onClick={() => setShowOverview(true)}>
              <span className="admin-sidebar-marker"><UiIcon name="home" size={17} /></span>
              {sidebarOpen && <span>{overviewLabel}</span>}
            </button>
            {visibleSections.map((section) => (
              <button key={section} className={`admin-sidebar-item ${!showOverview && selectedNavigation === section ? "active" : ""}`} type="button" aria-label={section === "management" ? t("managementSection") : t(sectionLabelKeys[section])} title={section === "management" ? t("managementSection") : t(sectionLabelKeys[section])} onClick={() => { setShowOverview(false); { if (section === "management" && selectedManagementGroup) selectManagementGroup(selectedManagementGroup); else if (section !== "management") setActiveSection(section); setRequestFilter(""); }; }}>
                <span className="admin-sidebar-marker"><UiIcon name={section === "management" ? "layout" : sectionIcons[section]} size={17} /></span>
                {sidebarOpen && <span>{section === "management" ? t("managementSection") : t(sectionLabelKeys[section])}</span>}
                {sidebarOpen && section === "requests" && <span className="admin-sidebar-count">{requestTotal}</span>}
                {sidebarOpen && section === "users" && <span className="admin-sidebar-count">{metrics.users}</span>}
              </button>
            ))}
            {(isPrivileged || permissions.includes("PRODUCTS")) && <Link className="admin-sidebar-item" href="/admin/orders" aria-label={siteCopy[locale].admin.ordersTitle} title={siteCopy[locale].admin.ordersTitle}>
              <span className="admin-sidebar-marker"><UiIcon name="box" size={17} /></span>
              {sidebarOpen && <span>{siteCopy[locale].admin.ordersTitle}</span>}
              {sidebarOpen && newOrderCount > 0 && <span className="admin-sidebar-count">{newOrderCount}</span>}
            </Link>}
            {isPrivileged && <Link className="admin-sidebar-item" href="/admin/shops" aria-label={sellerCopy[locale].admin.title} title={sellerCopy[locale].admin.title}>
              <span className="admin-sidebar-marker"><UiIcon name="building" size={17} /></span>
              {sidebarOpen && <span>{sellerCopy[locale].admin.title}</span>}
              {sidebarOpen && pendingShopCount > 0 && <span className="admin-sidebar-count">{pendingShopCount}</span>}
            </Link>}
          </nav>
        </aside>
        <div className="admin-section-content">
        {showOverview && <AdminOverview data={overview} onOpen={section => { setShowOverview(false); setActiveSection(section); }} />}
        <div className="admin-section-stack" hidden={showOverview}>
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
            <div className="form-row"><div className="field"><label>{t("optionalPriceMinor")}</label><input name="startingPrice" inputMode="decimal" autoComplete="off" defaultValue={minorToMajorInput(editingService?.startingPriceMinor)} placeholder="1250000" /></div><div className="field"><label>{t("currency")}</label><input name="currency" defaultValue={editingService?.currency ?? "UZS"} minLength={3} maxLength={3} required /></div></div>
              <div className="hero-actions"><button className="button" disabled={busy}>{editingService ? t("save") : t("addService")}</button>{editingService && <button className="button ghost" type="button" onClick={() => { setEditingService(null); setServiceMedia([]); if (serviceEditorRef.current) serviceEditorRef.current.open = false; }}>{t("cancel")}</button>}</div>
            </form>
          </details>
          <details className="admin-records-accordion">
            <summary>{t("serviceCatalog")} · {services.length}</summary>
            <div className="list">{services.map((service) => (
              <div className="list-row" key={service.id}>
                <div><strong>{service.name}</strong><p>{t(publicationLabelKeys[service.status] ?? "draft")} · {t(pricingLabelKeys[service.pricingType] ?? "quoteBased")}</p><MediaGallery media={service.media} title={service.name} /></div>
                <div className="hero-actions"><button className="button secondary small" onClick={() => { setEditingService(service); setServiceMedia(Array.isArray(service.media) ? service.media.filter((id): id is string => typeof id === "string") : []); if (serviceEditorRef.current) serviceEditorRef.current.open = true; }}>{t("edit")}</button>{service.status !== "ARCHIVED" && <button className="button danger small" onClick={() => archiveService(service.id)}>{t("archive")}</button>}</div>
              </div>
            ))}</div>
          </details>
        </section>}

        {availableSections.includes("products") && selectedSection === "products" && <AdminProductManager categories={productCategories} />}

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
            <div><strong>{article.title}</strong><p>{t(publicationLabelKeys[article.status] ?? "draft")} · {article.publishedAt ? formatDate(article.publishedAt) : t("notPublished")}</p><MediaGallery media={article.media} title={article.title} /></div>
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
                <div><span className="eyebrow">{request.reference}</span><h3>{request.name}</h3><p className="muted">{request.service?.name ?? t("advice")} · {formatDateTime(request.createdAt)}</p></div>
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
                  <p><strong>{t("requestCreatedAt")}:</strong> {formatDateTime(request.createdAt)}</p>
                  <p><strong>{t("requestUpdatedAt")}:</strong> {formatDateTime(request.updatedAt)}</p>
                  <p><strong>{t("requestAccount")}:</strong> {request.customer?.email ?? t("guestRequest")}</p>
                </div>
                <h4>{t("requestHistory")}</h4>
                {request.history.length ? <ol className="admin-request-history">{request.history.map((item) => <li key={item.id}>
                  <span>{item.fromStatus ? `${t(requestStatusLabelKeys[item.fromStatus])} → ` : ""}{t(requestStatusLabelKeys[item.toStatus])}</span>
                  <small>{formatDateTime(item.createdAt)} · {item.actor?.name ?? "Mijoz"}</small>
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
              <div className="form-row"><div className="field"><label>{t("phone")}</label><input name="phone" defaultValue={settings.phone ?? ""} maxLength={120} placeholder="+998...; +998..." /></div><div className="field"><label>{t("email")}</label><input name="email" type="email" defaultValue={settings.email ?? ""} maxLength={254} /></div></div>
              <div className="form-row"><div className="field"><label>{t("telegramHandle")}</label><input name="telegram" defaultValue={settings.telegram ?? ""} placeholder="@username" maxLength={80} /></div><div className="field"><label>{t("instagramHandle")}</label><input name="instagram" defaultValue={settings.instagram ?? ""} placeholder="@username" maxLength={80} /></div></div>
              <div className="field"><label>{t("address")}</label><input name="address" defaultValue={settings.address ?? ""} maxLength={300} /></div>
              <h3>{siteCopy[locale].admin.card}</h3>
              <p className="small muted">{siteCopy[locale].admin.cardHint}</p>
              <div className="form-row">
                <div className="field"><label>{siteCopy[locale].admin.cardNumber}</label><input name="paymentCardNumber" inputMode="numeric" defaultValue={settings.paymentCardNumber ?? ""} maxLength={23} pattern="[0-9 ]*" placeholder="8600 0000 0000 0000" /></div>
                <div className="field"><label>{siteCopy[locale].admin.cardHolder}</label><input name="paymentCardHolder" defaultValue={settings.paymentCardHolder ?? ""} maxLength={80} /></div>
              </div>
              <div className="field"><label>{siteCopy[locale].admin.cardBank}</label><input name="paymentCardBank" defaultValue={settings.paymentCardBank ?? ""} maxLength={60} /></div>
              <h3>{growthCopy[locale].requisites.title}</h3>
              <p className="small muted">{growthCopy[locale].requisites.hint}</p>
              <div className="field"><label>{growthCopy[locale].requisites.name}</label><input name="legalName" defaultValue={settings.legalName ?? ""} maxLength={160} /></div>
              <div className="form-row">
                <div className="field"><label>{growthCopy[locale].requisites.tin}</label><input name="legalTin" inputMode="numeric" defaultValue={settings.legalTin ?? ""} pattern="[0-9]{9}" maxLength={9} /></div>
                <div className="field"><label>{growthCopy[locale].requisites.mfo}</label><input name="bankMfo" inputMode="numeric" defaultValue={settings.bankMfo ?? ""} pattern="[0-9]{5}" maxLength={5} /></div>
              </div>
              <div className="form-row">
                <div className="field"><label>{growthCopy[locale].requisites.bank}</label><input name="bankName" defaultValue={settings.bankName ?? ""} maxLength={120} /></div>
                <div className="field"><label>{growthCopy[locale].requisites.account}</label><input name="bankAccount" inputMode="numeric" defaultValue={settings.bankAccount ?? ""} pattern="[0-9 ]*" maxLength={30} /></div>
              </div>
              <div className="field"><label>{growthCopy[locale].requisites.address}</label><input name="legalAddress" defaultValue={settings.legalAddress ?? ""} maxLength={300} /></div>
              <p className="small muted">{t("providerNotice")}</p>
              <button className="button" disabled={busy}>{t("saveSettings")}</button>
            </form>
          </details>
          <AdminDeliverySettings />
          <details className="admin-records-accordion">
            <summary>{t("siteAppearance")}</summary>
            <section className="site-appearance">
            <h3>{t("siteAppearance")}</h3>
            <p className="small muted">{t("siteAppearanceHint")}</p>
            <form className="site-design-grid" onSubmit={updateSettings}>
              {designOptions.map(({ id, name, font }) => (
                <label className="site-design-option" key={id}>
                  <input className="sr-only" type="radio" name="siteDesign" value={id} defaultChecked={(isSiteDesign(settings.siteDesign) ? settings.siteDesign : "liquid") === id} />
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
            {notifications.length ? <div className="list">{notifications.map((item) => <div className="list-row" key={item.id}><span>{notificationEventLabels[item.event] ?? item.event}</span><span className={`status ${item.status}`}>{item.status === "DELIVERED" ? t("approved") : item.status}</span><span className="small muted">{formatDateTime(item.createdAt)}</span></div>)}</div> : <p className="muted" style={{ padding: 14 }}>{t("noNotifications")}</p>}
          </details>
        </section>}

        {availableSections.includes("projects") && <section className={`panel-card admin-panel-section ${selectedSection === "projects" ? "active" : ""}`}>
          <h2>{t("projectQuotes")}</h2>
          {projects.length ? <div className="list">{projects.map((project) => (
            <div className="list-row" key={project.id}>
              <div><strong>{project.name}</strong><p>{project.city ?? t("cityNotProvided")} · {project.status}</p><p>{project.items.map((item) => `${item.product?.name ?? item.service?.name ?? t("unknownItem")} × ${item.quantity}`).join(", ") || t("itemsNotProvided")}</p>
                <form className="form" style={{ marginTop: 12 }} onSubmit={(event) => issueQuote(event, project.id)}>
                  <div className="field"><label>{t("quoteLine")}</label><input name="description" placeholder={t("quoteItemPlaceholder")} required minLength={2} maxLength={500} /></div>
                  <div className="form-row"><div className="field"><label>{t("quantity")}</label><input name="quantity" type="number" min="1" defaultValue="1" required /></div><div className="field"><label>{t("unitPriceMinor")}</label><input name="unitPrice" inputMode="decimal" autoComplete="off" required /></div></div>
                  <div className="field"><label>{t("discountMinor")}</label><input name="discount" inputMode="decimal" autoComplete="off" defaultValue="0" /></div>
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
            <div className="form-row"><div className="field"><label>{t("optionalPriceMinor")}</label><input name="price" inputMode="decimal" autoComplete="off" defaultValue={minorToMajorInput(editingPlan?.priceMinor)} placeholder="1250000" /></div><div className="field"><label>{t("currency")}</label><input name="currency" defaultValue={editingPlan?.currency ?? "UZS"} minLength={3} maxLength={3} required /></div></div>
            <div className="form-row"><div className="field"><label>{t("trialDaysRange")}</label><input name="trialDays" type="number" min="0" max="90" defaultValue={editingPlan?.trialDays ?? 30} required /></div><div className="field"><label>{t("planFeatures")}</label><input name="features" defaultValue={editingPlan?.features.join(", ") ?? ""} maxLength={1000} /></div></div>
            <p className="small muted">{t("planBillingWarning")}</p>
            <div className="hero-actions"><button className="button" disabled={busy}>{editingPlan ? t("save") : t("addPlan")}</button>{editingPlan && <button className="button ghost" type="button" onClick={() => { setEditingPlan(null); if (planEditorRef.current) planEditorRef.current.open = false; }}>{t("cancel")}</button>}</div>
            </form>
          </details>
          <details className="admin-records-accordion"><summary>{t("monitoringPlans")} · {plans.length}</summary>
            <div className="list">{plans.map((plan) => <div className="list-row" key={plan.id}><div><strong>{plan.name}</strong><p className="small muted">{plan.active ? t("active") : t("archived")} · {plan.interval} · {plan.trialDays} {t("trialDays")} · {plan.priceMinor === null ? t("negotiatedPrice") : `${formatNumber(plan.priceMinor / 100)} ${plan.currency}`}</p></div><div className="hero-actions"><button className="button secondary small" onClick={() => { setEditingPlan(plan); if (planEditorRef.current) planEditorRef.current.open = true; }}>{t("edit")}</button><button className={`button small ${plan.active ? "danger" : "secondary"}`} disabled={busy} onClick={() => togglePlan(plan)}>{plan.active ? t("archive") : t("enableAccount")}</button></div></div>)}</div>
          </details>
        </section>}

        {availableSections.includes("payments") && <section className={`panel-card admin-panel-section ${selectedSection === "payments" ? "active" : ""}`}>
          <h2>{t("pendingPayments")}</h2>
          {pendingPayments.length ? <div className="list">{pendingPayments.map((payment) => (
            <div className="list-row" key={payment.id}>
              <div><strong>{payment.invoice.number} · {payment.reference}</strong><p>{formatNumber(payment.amountMinor / 100)} {payment.currency} · {payment.method}</p></div>
              <div className="hero-actions"><button className="button" onClick={() => reviewPayment(payment.id, "VERIFIED")}>{t("verifyPayment")}</button><button className="button danger" onClick={() => reviewPayment(payment.id, "REJECTED")}>{t("reject")}</button></div>
            </div>
          ))}</div> : <div className="empty-state">{t("noPendingPayments")}</div>}
          <p className="small muted">{t("paymentProviderWarning")}</p>
        </section>}
        {availableSections.includes("content") && <div className={`admin-panel-section ${selectedSection === "content" ? "active" : ""}`}><AdminHomeFacts /><SiteBlockManager blocks={siteBlocks} /></div>}
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
    </div>
  );
}
