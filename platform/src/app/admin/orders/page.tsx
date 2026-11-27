import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderStatuses } from "@/lib/orders";
import { AdminOrders } from "@/components/order-views";
import { orderItemsWithProduct, withLineProducts } from "@/lib/order-lines";
import { openPartRefundQueue } from "@/lib/order-refunds-server";
import { paymeCancelRefused } from "@/lib/order-flow";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireAdminPage();
  // Orders hold customer contact details; the page follows the same permission as the orders API.
  if (actor.role === "STAFF" && !actor.permissions.includes("PRODUCTS")) redirect("/admin");
  const { status: rawStatus } = await searchParams;
  const status = orderStatuses.find((value) => value === rawStatus);
  const [orders, groups] = await Promise.all([
    prisma.order.findMany({
      where: status ? { status } : {},
      include: { items: orderItemsWithProduct, customer: { select: { name: true, email: true } }, shipments: { select: { shopId: true, status: true, sellerNote: true, creditedAt: true, disputedAt: true, disputeResolution: true, disputeResolvedAt: true, shop: { select: { name: true, slug: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 200
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } })
  ]);
  const canRefund = actor.role !== "STAFF" || actor.permissions.includes("PAYMENTS");
  const [performed, partRefunds] = await Promise.all([
    prisma.paymeTransaction.findMany({ where: { orderId: { in: orders.map(order => order.id) }, state: 2 }, select: { orderId: true } }),
    openPartRefundQueue()
  ]);
  // "Refund it from the Payme cabinet" only where Payme would accept the cancel; otherwise staff close it by hand.
  const refundDue = orders.filter(order => order.paymentStatus === "REFUND_DUE" && performed.some(row => row.orderId === order.id));
  const refused = new Set((await Promise.all(refundDue.map(async order => (await paymeCancelRefused(prisma, order.id)) ? order.id : null))).filter((id): id is string => id !== null));
  const paid = new Set(performed.map(row => row.orderId).filter(id => !refused.has(id)));
  const counts = Object.fromEntries(groups.map((group) => [group.status, group._count._all]));
  const total = groups.reduce((sum, group) => sum + group._count._all, 0);
  const lines = await withLineProducts(orders);
  return <AdminOrders orders={lines.map(order => ({ ...order, paymePerformed: paid.has(order.id) }))} counts={counts} total={total} status={status} canRefund={canRefund} partRefunds={partRefunds} />;
}
