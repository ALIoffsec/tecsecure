import type { RequestStatus } from "@prisma/client";
import type { AuthUser } from "./auth";
import { prisma } from "./prisma";

/** Requests still being worked on; finished, rejected and cancelled ones live in the full admin panel. */
export const openRequestStatuses: RequestStatus[] = ["NEW", "UNDER_REVIEW", "CONTACTED", "INSPECTION_REQUIRED", "QUOTATION_SENT", "APPROVED", "IN_PROGRESS"];

/** Midnight in Tashkent (UTC+5, no daylight saving), as a UTC instant. */
export function startOfTashkentDay(now = Date.now()): Date {
  const offset = 5 * 60 * 60 * 1000;
  const day = 24 * 60 * 60 * 1000;
  return new Date(Math.floor((now + offset) / day) * day - offset);
}

/** Everything the staff Mini App shows, limited to the sections this person may open (null = closed). */
export async function loadStaffDesk(actor: AuthUser) {
  const privileged = actor.role === "FOUNDER" || actor.role === "ADMIN";
  const can = (module: string) => privileged || actor.permissions.includes(module as AuthUser["permissions"][number]);
  const today = startOfTashkentDay();
  const [requests, orders, wallet, profile, requestsToday, ordersToday, requestsDone, ordersDone] = await Promise.all([
    can("REQUESTS") ? prisma.serviceRequest.findMany({
      where: { status: { in: openRequestStatuses } },
      select: {
        id: true, reference: true, status: true, name: true, phone: true, email: true, organizationName: true, city: true, location: true,
        description: true, budgetRange: true, preferredContactTime: true, createdAt: true, service: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }, take: 100
    }) : null,
    can("PRODUCTS") ? prisma.order.findMany({
      where: { OR: [{ status: { in: ["NEW", "CONFIRMED", "PREPARING", "SHIPPED"] } }, { paymentStatus: "REFUND_DUE" }] },
      select: {
        id: true, reference: true, status: true, recipientName: true, phone: true, city: true, address: true, region: true, note: true,
        customerType: true, companyName: true, createdAt: true, totalMinor: true, itemsTotalMinor: true, deliveryFeeMinor: true, deliveryMethod: true,
        currency: true, paymentMethod: true, paymentStatus: true, paymentProofMediaId: true,
        items: { select: { id: true, name: true, quantity: true, unitPriceMinor: true } }
      },
      orderBy: { createdAt: "desc" }, take: 100
    }) : null,
    can("WALLET") ? prisma.walletTransaction.findMany({
      where: { status: "PENDING" },
      select: { id: true, kind: true, amountMinor: true, reference: true, details: true, proofMediaId: true, createdAt: true, user: { select: { name: true } } },
      orderBy: { createdAt: "asc" }, take: 50
    }) : null,
    prisma.user.findUnique({ where: { id: actor.id }, select: { telegramChatId: true } }),
    can("REQUESTS") ? prisma.serviceRequest.count({ where: { createdAt: { gte: today } } }) : null,
    can("PRODUCTS") ? prisma.order.count({ where: { createdAt: { gte: today } } }) : null,
    can("REQUESTS") ? prisma.requestStatusHistory.count({ where: { toStatus: "COMPLETED", createdAt: { gte: today } } }) : null,
    can("PRODUCTS") ? prisma.orderStatusHistory.count({ where: { toStatus: "DELIVERED", createdAt: { gte: today } } }) : null
  ]);
  return {
    now: new Date(),
    requests,
    orders,
    wallet,
    today: { came: (requestsToday ?? 0) + (ordersToday ?? 0), requestsToday, ordersToday, done: (requestsDone ?? 0) + (ordersDone ?? 0) },
    me: { name: actor.name, email: actor.email, role: actor.role, permissions: privileged ? null : actor.permissions, telegramLinked: Boolean(profile?.telegramChatId) }
  };
}

export type StaffDesk = Awaited<ReturnType<typeof loadStaffDesk>>;
