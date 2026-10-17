import { requireUser } from "@/lib/auth";
import { CustomerDashboard } from "@/components/customer-dashboard";
import { prisma } from "@/lib/prisma";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  if (isPreviewMode) return <div className="container page-shell"><PreviewModeNotice /></div>;
  const user = await requireUser();
  const profileUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { id: true, name: true, email: true, phone: true, role: true }
  });
  const [requests, organizations, projects, products, services, invoices, plans, subscriptions, wallet] = await Promise.all([
    prisma.serviceRequest.findMany({
      where: { customerId: user.id },
      include: { service: { select: { name: true } }, history: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.organization.findMany({
      where: { members: { some: { userId: user.id } } },
      select: { id: true, name: true, locations: { select: { id: true, name: true, address: true } }, devices: { select: { id: true, type: true, model: true, status: true, lastCheckAt: true, monitored: true } } }
    }),
    prisma.project.findMany({
      where: { customerId: user.id },
      include: { quotations: { orderBy: { version: "desc" }, take: 1, include: { items: true } } },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { id: true, name: true } }),
    prisma.service.findMany({ where: { status: "PUBLISHED", availability: true }, select: { id: true, name: true } }),
    prisma.invoice.findMany({
      where: { quotation: { project: { customerId: user.id } } },
      include: { items: true, payments: { select: { id: true, amountMinor: true, currency: true, method: true, reference: true, status: true } }, quotation: { include: { project: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.subscriptionPlan.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.subscription.findMany({
      where: { organization: { members: { some: { userId: user.id } } } },
      include: { plan: { select: { name: true, interval: true, priceMinor: true, currency: true } }, organization: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        walletBalanceMinor: true,
        rewardPoints: true,
        walletTransactions: { orderBy: { createdAt: "desc" }, take: 100 }
      }
    })
  ]);
  const catalog = [
    ...products.map((item) => ({ ...item, kind: "product" as const })),
    ...services.map((item) => ({ ...item, kind: "service" as const }))
  ];
  const invoiceRows = invoices.map((invoice) => ({
    ...invoice,
    totalMinor: invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPriceMinor + item.taxMinor - item.discountMinor, 0),
    paidMinor: invoice.payments.filter((payment) => payment.status === "VERIFIED").reduce((sum, payment) => sum + payment.amountMinor, 0)
  }));
  return <CustomerDashboard user={profileUser} requests={requests} organizations={organizations} projects={projects} catalog={catalog} invoices={invoiceRows} plans={plans} subscriptions={subscriptions} wallet={wallet ?? { walletBalanceMinor: 0, rewardPoints: 0, walletTransactions: [] }} />;
}
