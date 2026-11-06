import { AdminSecurityBoundary } from "@/components/admin-security-boundary";
import { StaffApp } from "@/components/telegram-app";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Xodimlar ilovasi | Tecsecure" };

/** The phone-sized desk inside the staff bot: only what is waiting, and only what this person may touch. */
export default async function StaffAppPage() {
  const actor = await requireAdminPage();
  const privileged = actor.role === "FOUNDER" || actor.role === "ADMIN";
  const can = (module: string) => privileged || actor.permissions.includes(module as typeof actor.permissions[number]);
  const [orders, wallet, requests] = await Promise.all([
    can("PRODUCTS") ? prisma.order.findMany({
      where: { OR: [{ status: { in: ["NEW", "CONFIRMED", "PREPARING", "SHIPPED"] } }, { paymentStatus: "REFUND_DUE" }] },
      select: { id: true, reference: true, status: true, recipientName: true, phone: true, createdAt: true, totalMinor: true, currency: true, paymentMethod: true, paymentStatus: true, paymentProofMediaId: true },
      orderBy: { createdAt: "desc" }, take: 50
    }) : null,
    can("WALLET") ? prisma.walletTransaction.findMany({
      where: { status: "PENDING" },
      select: { id: true, kind: true, amountMinor: true, reference: true, details: true, proofMediaId: true, createdAt: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" }, take: 50
    }) : null,
    can("REQUESTS") ? prisma.serviceRequest.findMany({
      where: { status: "NEW" },
      select: { id: true, reference: true, name: true, phone: true, description: true, createdAt: true },
      orderBy: { createdAt: "desc" }, take: 50
    }) : null
  ]);
  return <><AdminSecurityBoundary /><StaffApp orders={orders} wallet={wallet} requests={requests} /></>;
}
