import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderStatusLabels, orderStatuses, type OrderStatusValue } from "@/lib/orders";
import { OrderStatusActions } from "@/components/order-status-actions";
import { formatDateTime, formatMinor } from "@/lib/format";

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
      include: { items: true, customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 200
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } })
  ]);
  const counts = Object.fromEntries(groups.map((group) => [group.status, group._count._all]));
  const total = groups.reduce((sum, group) => sum + group._count._all, 0);
  return <div className="container page-shell admin-orders">
    <Link className="small" href="/admin">← Admin</Link>
    <h1 className="page-title">Buyurtmalar</h1>
    <nav className="shop-cats" aria-label="Holat bo‘yicha">
      <Link className={`shop-chip${!status ? " is-active" : ""}`} href="/admin/orders">Hammasi · {total}</Link>
      {orderStatuses.map((value) => <Link className={`shop-chip${status === value ? " is-active" : ""}`} key={value} href={`/admin/orders?status=${value}`}>{orderStatusLabels[value]} · {counts[value] ?? 0}</Link>)}
    </nav>
    {orders.length === 0 && <div className="empty-state">Bu holatda buyurtma yo‘q.</div>}
    <div className="stack">
      {orders.map((order) => <article className="order-card panel-card" key={order.id}>
        <div className="order-head">
          <div>
            <h2>{order.reference}</h2>
            <span className="small muted">{formatDateTime(order.createdAt)}</span>
          </div>
          <span className={`order-status${order.status === "DELIVERED" ? " is-done" : order.status === "CANCELLED" ? " is-cancelled" : ""}`}>{orderStatusLabels[order.status as OrderStatusValue]}</span>
        </div>
        <div className="order-body">
          <p className="order-customer">
            <strong>{order.recipientName}</strong> · <a href={`tel:${order.phone.replace(/[^\d+]/g, "")}`}>{order.phone}</a><br />
            {[order.city, order.address].filter(Boolean).join(", ")}<br />
            <span className="small muted">Hisob: {order.customer.name} ({order.customer.email})</span>
          </p>
          {order.latitude !== null && order.longitude !== null && <a className="small text-link" href={`https://yandex.uz/maps/?pt=${order.longitude},${order.latitude}&z=16&l=map`} target="_blank" rel="noopener noreferrer">Xaritada ochish ({order.latitude.toFixed(5)}, {order.longitude.toFixed(5)})</a>}
          <ul className="order-items">{order.items.map((item) => <li key={item.id}>
            <span>{item.name}{item.sku ? <span className="small muted"> · {item.sku}</span> : null}</span>
            <strong>× {item.quantity}{item.unitPriceMinor !== null ? ` · ${formatMinor(item.unitPriceMinor, order.currency)}` : ""}</strong>
          </li>)}</ul>
          <p className="order-total">{order.totalMinor !== null ? <>Jami: <strong>{formatMinor(order.totalMinor, order.currency)}</strong></> : <span className="muted">Jami summa kelishiladi</span>}</p>
          {order.note && <p className="small">Izoh: {order.note}</p>}
          <OrderStatusActions id={order.id} status={order.status as OrderStatusValue} />
        </div>
      </article>)}
    </div>
  </div>;
}
