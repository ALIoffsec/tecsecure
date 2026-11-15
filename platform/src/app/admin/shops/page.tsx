import { redirect } from "next/navigation";
import { AdminShops } from "@/components/admin-shops";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shopStatuses } from "@/lib/shops";

export const dynamic = "force-dynamic";
export const metadata = { title: "Do‘konlar | Tecsecure admin", robots: { index: false, follow: false } };

/** Shops hold commission and money owed, so only founders and admins decide on them. */
export default async function AdminShopsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireAdminPage();
  if (actor.role !== "ADMIN" && actor.role !== "FOUNDER") redirect("/admin");
  const { status: rawStatus, view: rawView } = await searchParams;
  const status = shopStatuses.find(value => value === rawStatus);
  const view = (["moderation", "payouts", "disputes", "promotion"] as const).find(value => value === rawView) ?? "shops";
  const [shops, groups, moderation, payouts, disputes] = await Promise.all([
    prisma.shop.findMany({
      where: status ? { status } : {},
      include: { owner: { select: { name: true, email: true, phone: true } } },
      // Waiting applications first, then the newest.
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 200
    }),
    prisma.shop.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.product.count({ where: { shopId: { not: null }, moderation: "PENDING", status: { not: "ARCHIVED" } } }),
    prisma.shopPayout.count({ where: { status: "REQUESTED" } }),
    prisma.shopOrder.count({ where: { disputedAt: { not: null }, disputeResolvedAt: null } })
  ]);
  const order = { PENDING: 0, ACTIVE: 1, SUSPENDED: 2, REJECTED: 3 } as Record<string, number>;
  shops.sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  return <AdminShops shops={shops} counts={Object.fromEntries(groups.map(group => [group.status, group._count._all]))} status={status} view={view} waiting={{ moderation, payouts, disputes }} />;
}
