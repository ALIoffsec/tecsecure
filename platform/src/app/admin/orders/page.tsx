import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderStatusLabels, type OrderStatusValue } from "@/lib/orders";
import { OrderStatusActions } from "@/components/order-status-actions";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdminPage();
  const orders = await prisma.order.findMany({
    include: { items: true, customer: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200
  });
  return <div className="container page-shell">
    <Link className="small" href="/admin">← Admin</Link>
    <h1 className="page-title">Buyurtmalar</h1>
    {orders.length === 0 && <p className="muted">Buyurtmalar yo‘q.</p>}
    <div className="stack">
      {orders.map((order) => <article className="panel-card stack" key={order.id}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <h2>{order.reference}</h2>
          <strong>{orderStatusLabels[order.status as OrderStatusValue]}</strong>
        </div>
        <p className="small muted">{order.createdAt.toLocaleString("uz-UZ")} · {order.customer.name} ({order.customer.email})</p>
        <p>{order.recipientName} · {order.phone}<br />{order.city}, {order.address}</p>
        {order.latitude !== null && order.longitude !== null && <a className="small" href={`https://yandex.uz/maps/?pt=${order.longitude},${order.latitude}&z=16&l=map`} target="_blank" rel="noopener noreferrer">Xaritada ochish ({order.latitude.toFixed(5)}, {order.longitude.toFixed(5)})</a>}
        <ul>{order.items.map((item) => <li key={item.id}>{item.name} × {item.quantity}</li>)}</ul>
        {order.note && <p className="small">Izoh: {order.note}</p>}
        <OrderStatusActions id={order.id} status={order.status as OrderStatusValue} />
      </article>)}
    </div>
  </div>;
}
