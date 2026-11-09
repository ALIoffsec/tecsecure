import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderStatuses } from "@/lib/orders";
import { AdminOrders } from "@/components/order-views";
import { orderItemsWithProduct, withLineProducts } from "@/lib/order-lines";

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
      include: { items: orderItemsWithProduct, customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 200
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } })
  ]);
  const counts = Object.fromEntries(groups.map((group) => [group.status, group._count._all]));
  const total = groups.reduce((sum, group) => sum + group._count._all, 0);
  return <AdminOrders orders={await withLineProducts(orders)} counts={counts} total={total} status={status} />;
}
