import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderStatusLabels, type OrderStatusValue } from "@/lib/orders";

export const dynamic = "force-dynamic";

const flow: OrderStatusValue[] = ["NEW", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"];

export default async function PortalOrdersPage() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    include: { items: true, history: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  return <div className="container page-shell" style={{ maxWidth: 900 }}>
    <span className="eyebrow">Buyurtmalar</span>
    <h1 className="page-title">Mening buyurtmalarim</h1>
    {orders.length === 0 && <div className="empty-state"><p>Hali buyurtma yo‘q.</p><Link className="button" href="/products">Katalogga o‘tish</Link></div>}
    <div className="stack">
      {orders.map((order) => {
        const reached = new Set(order.history.map((h) => h.toStatus));
        const cancelled = order.status === "CANCELLED";
        return <article className="panel-card stack" key={order.id}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <h2>{order.reference}</h2>
            <strong>{orderStatusLabels[order.status as OrderStatusValue] ?? order.status}</strong>
          </div>
          <p className="small muted">{order.createdAt.toLocaleString("uz-UZ")} · {order.city}, {order.address}</p>
          <ul>{order.items.map((item) => <li key={item.id}>{item.name} × {item.quantity}</li>)}</ul>
          <p><strong>{order.totalMinor === null ? "Narx tasdiqlanganda bildiriladi" : `${(order.totalMinor / 100).toLocaleString("uz-UZ")} ${order.currency}`}</strong></p>
          {cancelled
            ? <p style={{ color: "#b3261e" }}>Buyurtma bekor qilingan.</p>
            : <ol style={{ display: "flex", gap: 6, flexWrap: "wrap", listStyle: "none", padding: 0 }} aria-label="Buyurtma holati">
              {flow.map((s) => <li key={s} style={{ padding: "4px 10px", borderRadius: 999, background: reached.has(s) ? "#1f7a4d" : "#e3e7ea", color: reached.has(s) ? "#fff" : "#5b6770", fontSize: 13 }}>{orderStatusLabels[s]}</li>)}
            </ol>}
          <details>
            <summary className="small">Tarix</summary>
            <ul>{order.history.map((h) => <li key={h.id} className="small">{h.createdAt.toLocaleString("uz-UZ")} — {orderStatusLabels[h.toStatus as OrderStatusValue] ?? h.toStatus}{h.note ? `: ${h.note}` : ""}</li>)}</ul>
          </details>
          {order.latitude !== null && order.longitude !== null && <a className="small" href={`https://yandex.uz/maps/?pt=${order.longitude},${order.latitude}&z=16&l=map`} target="_blank" rel="noopener noreferrer">Yetkazish nuqtasini xaritada ko‘rish</a>}
        </article>;
      })}
    </div>
  </div>;
}
