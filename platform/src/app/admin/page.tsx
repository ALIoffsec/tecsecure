import { AdminWorkspace } from "@/components/admin-workspace";
import { AdminSecurityBoundary } from "@/components/admin-security-boundary";
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const actor = await requireAdminPage();
  if (actor.role === "CUSTOMER") redirect("/portal");
  const privileged = actor.role === "FOUNDER" || actor.role === "ADMIN";
  const can = (module: string) => privileged || actor.permissions.includes(module as typeof actor.permissions[number]);
  const [services, requests, requestStatusGroups, products, productCategories, articles, settings, notifications, users, projects, projectCount, invoices, quotations, pendingPayments, plans, siteBlocks, portfolioPosts, walletRequests] = await Promise.all([
    can("SERVICES") ? prisma.service.findMany({ orderBy: { createdAt: "desc" }, take: 100 }) : [],
    can("REQUESTS") ? prisma.serviceRequest.findMany({
      include: {
        service: { select: { name: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
        history: { include: { actor: { select: { name: true, email: true } } }, orderBy: { createdAt: "asc" } }
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 100
    }) : [],
    can("REQUESTS") ? prisma.serviceRequest.groupBy({ by: ["status"], _count: { _all: true } }) : [],
    can("PRODUCTS") ? prisma.product.findMany({ include: { category: { select: { name: true, slug: true } } }, orderBy: { createdAt: "desc" }, take: 100 }) : [],
    can("PRODUCTS") ? prisma.productCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }) : [],
    can("NEWS") ? prisma.newsArticle.findMany({ orderBy: { updatedAt: "desc" }, take: 100 }) : [],
    can("COMPANY") ? prisma.siteSetting.findMany({ where: { key: { in: ["companyName", "phone", "email", "telegram", "instagram", "address", "siteDesign"] } } }) : [],
    can("COMPANY") ? prisma.notification.findMany({ where: { userId: actor.id }, orderBy: { createdAt: "desc" }, take: 20 }) : [],
    privileged ? prisma.user.findMany({ where: { deletedAt: null }, select: { id: true, name: true, email: true, role: true, active: true, permissions: true }, orderBy: [{ role: "asc" }, { name: "asc" }] }) : [],
    can("PROJECTS") ? prisma.project.findMany({
      include: { items: { include: { product: { select: { name: true } }, service: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 100
    }) : [],
    can("PROJECTS") ? prisma.project.count() : 0,
    can("PAYMENTS") ? prisma.invoice.count() : 0,
    can("PAYMENTS") ? prisma.quotation.findMany({
      where: { status: "ACCEPTED" },
      include: { project: { select: { name: true } }, items: true, invoices: { select: { id: true, number: true, status: true } } },
      orderBy: { updatedAt: "desc" },
      take: 100
    }) : [],
    can("PAYMENTS") ? prisma.payment.findMany({
      where: { status: "PENDING" },
      include: { invoice: { select: { id: true, number: true, currency: true } } },
      orderBy: { createdAt: "asc" },
      take: 100
    }) : [],
    can("SUBSCRIPTIONS") ? prisma.subscriptionPlan.findMany({ orderBy: { name: "asc" } }) : [],
    can("CONTENT") ? prisma.siteBlock.findMany({ orderBy: [{ page: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }] }) : [],
    can("PORTFOLIO") ? prisma.portfolioPost.findMany({ orderBy: { updatedAt: "desc" } }) : [],
    can("WALLET") ? prisma.walletTransaction.findMany({
      where: { status: "PENDING" }, include: { user: { select: { name: true, email: true, walletBalanceMinor: true } } },
      orderBy: { createdAt: "asc" }, take: 200
    }) : []
  ]);
  const managedUsers = users.map((user) => ({
    ...user,
    permissions: Array.isArray(user.permissions) ? user.permissions.filter((value): value is string => typeof value === "string") : []
  }));
  const managedPlans = plans.map((plan) => ({
    ...plan,
    features: Array.isArray(plan.features) ? plan.features.filter((value): value is string => typeof value === "string") : []
  }));
  const requestStats = Object.fromEntries(requestStatusGroups.map((item) => [item.status, item._count._all]));
  const requestTotal = requestStatusGroups.reduce((total, item) => total + item._count._all, 0);
  return <><AdminSecurityBoundary /><div className="container" style={{ paddingTop: 12 }}><Link className="button secondary" href="/admin/orders">Buyurtmalar</Link></div><AdminWorkspace services={services} requests={requests} requestStats={requestStats} requestTotal={requestTotal} products={products} productCategories={productCategories} articles={articles} settings={Object.fromEntries(settings.map((item) => [item.key, item.value]))} notifications={notifications} projects={projects} quotations={quotations} pendingPayments={pendingPayments} plans={managedPlans} users={managedUsers} siteBlocks={siteBlocks} portfolioPosts={portfolioPosts} walletRequests={walletRequests} metrics={{ users: managedUsers.length, projects: projectCount, invoices }} role={actor.role} permissions={actor.permissions} actorId={actor.id} /></>;
}
