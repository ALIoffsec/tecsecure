import { cache } from "react";
import { prisma } from "./prisma";
import { orderItemsWithProduct, withLineProducts } from "./order-lines";
import { CUSTOMER_EVENTS } from "./notifications";
import { learningModules } from "./learning-demo";
import { receiptRefusals } from "./order-refunds-server";
import { unreadForCustomer } from "./conversations";
import { ORDERS_MAX_PAGES, ORDERS_PAGE, orderFilterWhere, parseOrderFilter } from "./customer-orders";
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
      select: { id: true, number: true, status: true, dueAt: true, createdAt: true, quotation: { select: { project: { select: { name: true, id: true, requestId: true } } } }, payments: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true } } }
    }),
    prisma.order.findMany({
      where: { customerId: userId, status: { not: "CANCELLED" }, paymentStatus: "AWAITING_PAYMENT" },
      orderBy: { createdAt: "asc" },
      take: 3,
      select: { id: true, reference: true, createdAt: true, paymentMethod: true, items: { take: 1, select: { name: true } } }
    }),
    prisma.quotation.findMany({
      where: { status: "ISSUED", project: { customerId: userId } },
      orderBy: { createdAt: "asc" },
      take: 3,
      select: { id: true, number: true, createdAt: true, project: { select: { name: true, id: true, requestId: true } } }
    })
  ]);
  const lastAsked = lastOrder ? await cancelRequests([lastOrder.id]) : new Set<string>();
  // Staff replies the customer has not read yet (read state since the conversation migration).
  const talks = await prisma.portalConversation.findMany({
    where: { customerId: userId }, orderBy: { lastMessageAt: "desc" }, take: 10,
    select: { id: true, subject: true, lastMessageAt: true, customerReadAt: true, messages: { orderBy: { createdAt: "desc" }, take: 10, select: { sender: true, createdAt: true } } }
  });
  const replies = talks.filter(talk => unreadForCustomer(talk.messages, talk.customerReadAt) > 0);
  const refused = await receiptRefusals(unpaidOrders.filter(order => order.paymentMethod === "CARD_TRANSFER").map(order => order.id));
  const waiting: AttentionItem[] = [
    ...invoices.flatMap(invoice => {
      const kind = invoiceAttention(invoice.status, invoice.payments[0]?.status, invoice.dueAt);
      return kind ? [{ kind, key: `invoice:${invoice.id}`, subject: invoice.quotation?.project.name ?? invoice.number, href: `/portal/invoices/${invoice.id}`, at: invoice.createdAt }] : [];
    }),
    ...unpaidOrders.map(order => ({ kind: refused.has(order.id) ? "receiptRejected" as const : "orderUnpaid" as const, key: `order:${order.id}`, subject: order.items[0]?.name ? `${order.reference} · ${order.items[0].name}` : order.reference, href: `/portal/orders/${order.id}`, at: order.createdAt })),
    ...replies.map(talk => ({ kind: "staffReply" as const, key: `talk:${talk.id}`, subject: talk.subject, href: "/portal/messages", at: talk.lastMessageAt })),
    ...quotes.map(quote => ({ kind: "quoteWaiting" as const, key: `quote:${quote.id}`, subject: quote.project?.name ?? quote.number, href: `/portal/requests/${quote.project.requestId ?? quote.project.id}#quote`, at: quote.createdAt }))
  ];
  const lesson = lastLesson ? learningModules.find(module => module.slug === lastLesson.moduleSlug) : undefined;
  return {
    walletMinor: account?.walletBalanceMinor ?? 0,
    tec: account?.rewardPoints ?? 0,
    phone: !account?.phone ? "missing" as const : account.phoneVerifiedAt ? "verified" as const : "unverified" as const,
    waiting: pickAttention(waiting),
    lastOrder: lastOrder && {
      id: lastOrder.id, reference: lastOrder.reference, status: lastOrder.status, createdAt: lastOrder.createdAt,
      first: lastOrder.items[0] ?? null, more: Math.max(0, lastOrder._count.items - 1), cancelRequested: lastAsked.has(lastOrder.id) && isCancelPending(lastOrder.status)
    },
    activeOrders, openRequests, devices, quietDevices,
    lesson: lesson ? lesson.title : null,
    lessonSlug: lesson?.slug ?? null
  };
}

export type CabinetHomeData = Awaited<ReturnType<typeof cabinetHomeData>>;

/** "My orders": one tab, twenty at a time, with the counts for every tab. */
export async function cabinetOrderList(userId: string, rawFilter: string | undefined, rawPage: string | undefined) {
  const [active, delivered, cancelled] = await Promise.all((["active", "delivered", "cancelled"] as const).map(filter => prisma.order.count({ where: { customerId: userId, ...orderFilterWhere(filter) } })));
  const counts = { active, delivered, cancelled };
  const filter = parseOrderFilter(rawFilter, counts);
  const page = Math.min(ORDERS_MAX_PAGES, Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1));
  const rows = await prisma.order.findMany({
    where: { customerId: userId, ...orderFilterWhere(filter) },
    orderBy: { createdAt: "desc" },
    take: page * ORDERS_PAGE + 1,
    select: {
      id: true, reference: true, status: true, createdAt: true, totalMinor: true, currency: true, paymentMethod: true, paymentStatus: true,
      items: { select: { id: true, name: true, product: { select: { slug: true, status: true, media: true } } } }
    }
  });
  const more = rows.length > page * ORDERS_PAGE;
  // The list stops at ten pages so the query stays small; past that it says where the older orders are.
  const hasMore = more && page < ORDERS_MAX_PAGES;
  const capped = more && page >= ORDERS_MAX_PAGES;
  const orders = await withLineProducts(rows.slice(0, page * ORDERS_PAGE));
  const asked = await cancelRequests(orders.map(order => order.id));
  return {
    filter, page, hasMore, capped, counts: { ...counts, all: active + delivered + cancelled },
    orders: orders.map(order => ({ ...order, cancelRequested: asked.has(order.id) && isCancelPending(order.status), images: order.items.flatMap(item => item.product.imageId ? [item.product.imageId] : []).slice(0, 3) }))
  };
}

/** A cancel request is only news while staff have not moved the order past "confirmed". */
const isCancelPending = (status: string) => status === "NEW" || status === "CONFIRMED";

async function cancelRequests(orderIds: string[]): Promise<Set<string>> {
  if (orderIds.length === 0) return new Set();
  const rows = await prisma.portalConversation.findMany({ where: { sourceType: "ORDER_CANCEL_REQUEST", sourceId: { in: orderIds } }, select: { sourceId: true } });
  return new Set(rows.map(row => row.sourceId));
}

/** One order of this buyer, with everything its page shows. Null when it is not theirs. */
export async function cabinetOrderDetail(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId: userId },
    include: {
      items: orderItemsWithProduct,
      history: { orderBy: { createdAt: "asc" }, select: { id: true, fromStatus: true, toStatus: true, createdAt: true, note: true } },
      shipments: { select: { id: true, shopId: true, status: true, sellerNote: true, creditedAt: true, disputedAt: true, disputeResolution: true, disputeResolvedAt: true, shop: { select: { name: true, slug: true } } } }
    }
  });
  if (!order) return null;
  const [line] = await withLineProducts([order]);
  const productIds = [...new Set(order.items.flatMap(item => item.productId ? [item.productId] : []))];
  const [refusals, asked, problem, products] = await Promise.all([
    order.paymentMethod === "CARD_TRANSFER" && order.paymentStatus === "AWAITING_PAYMENT" ? receiptRefusals([order.id]) : Promise.resolve(new Map<string, string>()),
    cancelRequests([order.id]),
    prisma.portalConversation.count({ where: { sourceType: "ORDER_PROBLEM", sourceId: order.id } }),
    productIds.length ? prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, slug: true, status: true, stockQuantity: true, category: { select: { slug: true } } } }) : Promise.resolve([])
  ]);
  const onSale = new Map(products.filter(product => product.status === "PUBLISHED" && product.stockQuantity !== 0).map(product => [product.id, product]));
  return {
    ...line,
    receiptRefusal: refusals.get(order.id) ?? null,
    cancelRequested: asked.has(order.id) && isCancelPending(order.status),
    cancelAsked: asked.has(order.id),
    problemReported: problem > 0,
    reorder: {
      lines: order.items.flatMap(item => {
        const product = item.productId ? onSale.get(item.productId) : undefined;
        return product ? [{ productId: product.id, name: product.name, slug: product.slug, categorySlug: product.category?.slug ?? null, quantity: item.quantity }] : [];
      }),
      missing: order.items.filter(item => !item.productId || !onSale.has(item.productId)).map(item => item.name)
    }
  };
}

export type CabinetOrderDetail = NonNullable<Awaited<ReturnType<typeof cabinetOrderDetail>>>;
export type CabinetOrderList = Awaited<ReturnType<typeof cabinetOrderList>>;

export async function cabinetDevices(userId: string) {
  const [organizations, plans, subscriptions] = await Promise.all([
    prisma.organization.findMany({
      where: { members: { some: { userId } } },
      select: { id: true, name: true, locations: { select: { id: true, name: true, address: true } }, devices: { select: { id: true, type: true, model: true, status: true, lastCheckAt: true, monitored: true, warrantyEndsAt: true, warrantyVerified: true, checks: { orderBy: { checkedAt: "desc" }, take: 1, select: { detail: true } } } } }
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
