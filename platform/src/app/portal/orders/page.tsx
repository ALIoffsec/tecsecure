import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderStatusLabels, type OrderStatusValue } from "@/lib/orders";

export const dynamic = "force-dynamic";

const flow: OrderStatusValue[] = ["NEW", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"];
const icons = ["1", "2", "3", "4", "✓"];

export default async function PortalOrdersPage() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    include: { items: true, history: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  return <div className="container page-shell" style={{ maxWidth: 940 }}>
    <span className="eyebrow">Buyurtmalar</span>
    <h1 className="page-title">Mening buyurtmalarim</h1>
    {orders.length === 0 && <div className="empty-state" style={{ textAlign: "center", padding: 48 }}>
      <p><strong>Hali buyurtma yo‘q</strong></p>
      <Link className="button" href="/products">Katalogga o‘tish</Link>
    </div>}
    <div className="stack" style={{ gap: 18 }}>
      {orders.map((order) => {
        const status = order.status as OrderStatusValue;
        const index = flow.indexOf(status);
        const cancelled = status === "CANCELLED";
        const progress = index <= 0 ? 0 : (index / (flow.length - 1)) * 80;
        return <article className="order-card" key={order.id}>
          <div className="order-head">
            <div>
              <h2>{order.reference}</h2>
              <span className="small muted">{order.createdAt.toLocaleString("uz-UZ")}</span>
            </div>
            <span className={`order-status${status === "DELIVERED" ? " is-done" : cancelled ? " is-cancelled" : ""}`}>{orderStatusLabels[status] ?? status}</span>
          </div>
          <div className="order-body">
            {cancelled
              ? <p style={{ color: "var(--danger)", margin: 0 }}>Buyurtma bekor qilingan.</p>
              : <ol className="order-track" aria-label="Buyurtma holati">
                <span className="bar" style={{ width: `${progress}%` }} />
                {flow.map((s, i) => <li key={s} className={`${i <= index ? "is-reached" : ""}${i === index ? " is-current" : ""}`}>
                  <i>{i < index ? "✓" : icons[i]}</i>{orderStatusLabels[s]}
                </li>)}
              </ol>}
            <div className="order-meta">
              <div><h3>Yetkazib berish</h3><p>{order.recipientName} · {order.phone}<br />{order.city}, {order.address}</p>
                {order.latitude !== null && order.longitude !== null && <a className="small" style={{ color: "var(--accent)" }} href={`https://yandex.uz/maps/?pt=${order.longitude},${order.latitude}&z=16&l=map`} target="_blank" rel="noopener noreferrer">Xaritada ko‘rish →</a>}
              </div>
              <div><h3>Jami</h3><p><strong>{order.totalMinor === null ? "Narx tasdiqlanganda bildiriladi" : `${(order.totalMinor / 100).toLocaleString("uz-UZ")} ${order.currency}`}</strong></p></div>
            </div>
            <ul className="order-items">{order.items.map((item) => <li key={item.id}><span>{item.name}</span><strong>× {item.quantity}</strong></li>)}</ul>
            <details>
              <summary className="small">Holatlar tarixi</summary>
              <ul className="stack small" style={{ marginTop: 8 }}>{order.history.map((h) => <li key={h.id}>{h.createdAt.toLocaleString("uz-UZ")} — <strong>{orderStatusLabels[h.toStatus as OrderStatusValue] ?? h.toStatus}</strong>{h.note ? `: ${h.note}` : ""}</li>)}</ul>
            </details>
          </div>
        </article>;
      })}
    </div>
  </div>;
}
