import { AdminWorkspace } from "@/components/admin-workspace";
import { AdminSecurityBoundary } from "@/components/admin-security-boundary";
import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTelegramCredentials } from "@/lib/integration-credentials";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const actor = await requireAdminPage();
  if (actor.role === "CUSTOMER") redirect("/portal");
  const privileged = actor.role === "FOUNDER" || actor.role === "ADMIN";
  const can = (module: string) => privileged || actor.permissions.includes(module as typeof actor.permissions[number]);
  const [services, requests, requestStatusGroups, productCategories, newOrderCount, articles, settings, notifications, users, projects, projectCount, invoices, quotations, pendingPayments, plans, siteBlocks, portfolioPosts, walletRequests] = await Promise.all([
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
    can("PRODUCTS") ? prisma.productCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, _count: { select: { products: true } } } }) : [],
    can("PRODUCTS") ? prisma.order.count({ where: { status: "NEW" } }) : 0,
    can("NEWS") ? prisma.newsArticle.findMany({ orderBy: { updatedAt: "desc" }, take: 100 }) : [],
    can("COMPANY") ? prisma.siteSetting.findMany({ where: { key: { in: ["companyName", "phone", "email", "telegram", "instagram", "address", "siteDesign", "paymentCardNumber", "paymentCardHolder", "paymentCardBank", "legalName", "legalTin", "legalAddress", "bankName", "bankAccount", "bankMfo"] } } }) : [],
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
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const [customerCount, monthRevenue, botConfigured, recentErrors, telegramAccount] = await Promise.all([
    privileged ? prisma.user.count({ where: { role: "CUSTOMER", deletedAt: null } }) : null,
    can("PRODUCTS") ? prisma.order.aggregate({ where: { status: "DELIVERED", currency: "UZS", updatedAt: { gte: monthStart } }, _sum: { totalMinor: true } }) : null,
    privileged ? getTelegramCredentials().then(({ botToken, adminChatId }) => Boolean(botToken && adminChatId)).catch(() => false) : null,
    privileged ? prisma.errorEvent.findMany({ where: { lastSeenAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, orderBy: { lastSeenAt: "desc" }, take: 10, select: { id: true, source: true, message: true, path: true, count: true, lastSeenAt: true } }) : null,
    prisma.user.findUnique({ where: { id: actor.id }, select: { telegramChatId: true } })
  ]);
  const overview = {
    newOrders: can("PRODUCTS") ? newOrderCount : null,
    pendingWallet: can("WALLET") ? walletRequests.length : null,
    newRequests: can("REQUESTS") ? requestStatusGroups.find((item) => item.status === "NEW")?._count._all ?? 0 : null,
    pendingPayments: can("PAYMENTS") ? pendingPayments.length : null,
    customers: customerCount,
    monthRevenueMinor: monthRevenue ? monthRevenue._sum.totalMinor ?? 0 : null,
    botConfigured,
    recentErrors,
    telegramLinked: Boolean(telegramAccount?.telegramChatId)
  };
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
  const pendingShopCount = privileged ? await prisma.shop.count({ where: { status: "PENDING" } }) : 0;
  return <><AdminSecurityBoundary /><AdminWorkspace overview={overview} newOrderCount={newOrderCount} pendingShopCount={pendingShopCount} services={services} requests={requests} requestStats={requestStats} requestTotal={requestTotal} productCategories={productCategories} articles={articles} settings={Object.fromEntries(settings.map((item) => [item.key, item.value]))} notifications={notifications} projects={projects} quotations={quotations} pendingPayments={pendingPayments} plans={managedPlans} users={managedUsers} siteBlocks={siteBlocks} portfolioPosts={portfolioPosts} walletRequests={walletRequests} metrics={{ users: managedUsers.length, projects: projectCount, invoices }} role={actor.role} permissions={actor.permissions} actorId={actor.id} /></>;
}
