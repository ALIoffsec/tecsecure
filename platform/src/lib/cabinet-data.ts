import { cache } from "react";
import { prisma } from "./prisma";
import { orderItemsWithProduct, withLineProducts } from "./order-lines";
import { CUSTOMER_EVENTS } from "./notifications";
import { learningModules } from "./learning-demo";
import { ACTIVE_ORDER_STATUSES, OPEN_REQUEST_STATUSES, invoiceAttention, pickAttention, type AttentionItem } from "./cabinet-home";
import type { CabinetNavState } from "@/components/cabinet/cabinet-nav";

/** What the frame needs: who it is, which optional sections to show, and what waits on the customer. */
export const cabinetFrameData = cache(async (userId: string) => {
  const [account, unread, learning, devices, ordersToPay, quotesToAnswer, invoicesToPay] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, phone: true, role: true } }),
    prisma.notification.count({ where: { userId, channel: "IN_APP", status: "UNREAD", event: { in: [...CUSTOMER_EVENTS] } } }),
    Promise.all([
      prisma.learningSubscription.count({ where: { userId } }),
      prisma.learningCertificate.count({ where: { userId } }),
      prisma.learningPurchase.count({ where: { userId } }),
      prisma.learningProgress.count({ where: { userId } })
    ]).then(counts => counts.some(count => count > 0)),
    Promise.all([
      prisma.organizationMember.count({ where: { userId } }),
      prisma.subscription.count({ where: { organization: { members: { some: { userId } } } } })
    ]).then(counts => counts.some(count => count > 0)),
    prisma.order.count({ where: { customerId: userId, status: { not: "CANCELLED" }, paymentStatus: "AWAITING_PAYMENT" } }),
    prisma.quotation.count({ where: { status: "ISSUED", project: { customerId: userId } } }),
    prisma.invoice.count({ where: { status: { in: ["ISSUED", "PARTIALLY_PAID", "OVERDUE"] }, quotation: { project: { customerId: userId } } } })
  ]);
  const realEmail = account && !account.email.endsWith(".invalid") ? account.email : null;
  const nav: CabinetNavState = {
    show: { learning, devices },
    counts: { orders: ordersToPay, requests: quotesToAnswer + invoicesToPay }
  };
  return {
    user: { name: account?.name ?? "", contact: realEmail ?? account?.phone ?? null, staff: Boolean(account && account.role !== "CUSTOMER") },
    nav, unread
  };
});

/**
 * The cabinet home: a handful of small counts and short rows, never another section's full data.
 * Every live line on the home's cards comes from here; what cannot be read falls back to the card's plain text.
 */
export async function cabinetHomeData(userId: string) {
  const mine = { organization: { members: { some: { userId } } } };
  const [account, activeOrders, lastOrder, openRequests, lastLesson, devices, quietDevices, invoices, unpaidOrders, quotes] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { walletBalanceMinor: true, rewardPoints: true, phone: true, phoneVerifiedAt: true } }),
    prisma.order.count({ where: { customerId: userId, status: { in: [...ACTIVE_ORDER_STATUSES] } } }),
    prisma.order.findFirst({
      where: { customerId: userId, status: { in: [...ACTIVE_ORDER_STATUSES] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, reference: true, status: true, createdAt: true, items: { take: 1, select: { name: true, quantity: true } }, _count: { select: { items: true } } }
    }),
    prisma.serviceRequest.count({ where: { customerId: userId, status: { in: [...OPEN_REQUEST_STATUSES] } } }),
    prisma.learningProgress.findFirst({ where: { userId }, orderBy: { completedAt: "desc" }, select: { moduleSlug: true } }),
    prisma.device.count({ where: mine }),
    prisma.device.count({ where: { ...mine, monitored: true, status: { in: ["OFFLINE", "STALE"] } } }),
    prisma.invoice.findMany({
      where: { status: { in: ["ISSUED", "PARTIALLY_PAID", "OVERDUE"] }, quotation: { project: { customerId: userId } } },
      orderBy: { createdAt: "asc" },
      take: 10,
      select: { id: true, number: true, status: true, createdAt: true, quotation: { select: { project: { select: { name: true } } } }, payments: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true } } }
    }),
    prisma.order.findMany({
      where: { customerId: userId, status: { not: "CANCELLED" }, paymentStatus: "AWAITING_PAYMENT" },
      orderBy: { createdAt: "asc" },
      take: 3,
      select: { id: true, reference: true, createdAt: true, items: { take: 1, select: { name: true } } }
    }),
    prisma.quotation.findMany({
      where: { status: "ISSUED", project: { customerId: userId } },
      orderBy: { createdAt: "asc" },
      take: 3,
      select: { id: true, number: true, createdAt: true, project: { select: { name: true } } }
    })
  ]);
  const waiting: AttentionItem[] = [
    ...invoices.flatMap(invoice => {
      const kind = invoiceAttention(invoice.status, invoice.payments[0]?.status);
      return kind ? [{ kind, key: `invoice:${invoice.id}`, subject: invoice.quotation?.project.name ?? invoice.number, href: "/portal/requests", at: invoice.createdAt }] : [];
    }),
    ...unpaidOrders.map(order => ({ kind: "orderUnpaid" as const, key: `order:${order.id}`, subject: order.items[0]?.name ? `${order.reference} · ${order.items[0].name}` : order.reference, href: `/portal/orders#order-${order.id}`, at: order.createdAt })),
    ...quotes.map(quote => ({ kind: "quoteWaiting" as const, key: `quote:${quote.id}`, subject: quote.project?.name ?? quote.number, href: "/portal/requests", at: quote.createdAt }))
  ];
  const lesson = lastLesson ? learningModules.find(module => module.slug === lastLesson.moduleSlug) : undefined;
  return {
    walletMinor: account?.walletBalanceMinor ?? 0,
    tec: account?.rewardPoints ?? 0,
    phone: !account?.phone ? "missing" as const : account.phoneVerifiedAt ? "verified" as const : "unverified" as const,
    waiting: pickAttention(waiting),
    lastOrder: lastOrder && {
      id: lastOrder.id, reference: lastOrder.reference, status: lastOrder.status, createdAt: lastOrder.createdAt,
      first: lastOrder.items[0] ?? null, more: Math.max(0, lastOrder._count.items - 1)
    },
    activeOrders, openRequests, devices, quietDevices,
    lesson: lesson ? lesson.title : null
  };
}

export type CabinetHomeData = Awaited<ReturnType<typeof cabinetHomeData>>;

export async function cabinetOrders(userId: string, take = 50) {
  const orders = await prisma.order.findMany({
    where: { customerId: userId },
    include: { items: orderItemsWithProduct, history: { orderBy: { createdAt: "asc" } }, shipments: { select: { shopId: true, status: true, sellerNote: true, creditedAt: true, disputedAt: true, disputeResolution: true, disputeResolvedAt: true, shop: { select: { name: true, slug: true } } } } },
    orderBy: { createdAt: "desc" },
    take
  });
  return withLineProducts(orders);
}

export async function cabinetRequests(userId: string) {
  const [requests, projects, products, services, invoices] = await Promise.all([
    prisma.serviceRequest.findMany({
      where: { customerId: userId },
      select: { id: true, reference: true, description: true, status: true, createdAt: true, service: { select: { name: true } }, history: { orderBy: { createdAt: "asc" }, select: { id: true, toStatus: true, createdAt: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.project.findMany({
      where: { customerId: userId },
      select: { id: true, reference: true, name: true, status: true, quotations: { orderBy: { version: "desc" }, take: 1, select: { id: true, number: true, status: true, currency: true, items: { select: { quantity: true, unitPriceMinor: true, discountMinor: true } } } } },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { id: true, name: true } }),
    prisma.service.findMany({ where: { status: "PUBLISHED", availability: true }, select: { id: true, name: true } }),
    prisma.invoice.findMany({
      where: { quotation: { project: { customerId: userId } } },
      select: {
        id: true, number: true, status: true, currency: true, dueAt: true,
        items: { select: { quantity: true, unitPriceMinor: true, taxMinor: true, discountMinor: true } },
        payments: { select: { id: true, amountMinor: true, reference: true, status: true } },
        quotation: { select: { project: { select: { name: true } } } }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);
  return {
    requests, projects,
    catalog: [...products.map(item => ({ ...item, kind: "product" as const })), ...services.map(item => ({ ...item, kind: "service" as const }))],
    invoices: invoices.map(invoice => ({
      id: invoice.id, number: invoice.number, status: invoice.status, currency: invoice.currency, dueAt: invoice.dueAt, quotation: invoice.quotation,
      payments: invoice.payments.map(({ id, reference, status }) => ({ id, reference, status })),
      totalMinor: invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPriceMinor + item.taxMinor - item.discountMinor, 0),
      paidMinor: invoice.payments.filter(payment => payment.status === "VERIFIED").reduce((sum, payment) => sum + payment.amountMinor, 0)
    }))
  };
}

export async function cabinetDevices(userId: string) {
  const [organizations, plans, subscriptions] = await Promise.all([
    prisma.organization.findMany({
      where: { members: { some: { userId } } },
      select: { id: true, name: true, locations: { select: { id: true, name: true, address: true } }, devices: { select: { id: true, type: true, model: true, status: true, lastCheckAt: true, monitored: true } } }
    }),
    prisma.subscriptionPlan.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.subscription.findMany({
      where: { organization: { members: { some: { userId } } } },
      include: { plan: { select: { name: true, interval: true, priceMinor: true, currency: true } }, organization: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    })
  ]);
  return { organizations, plans, subscriptions };
}
