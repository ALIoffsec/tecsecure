"use client";

import Link from "next/link";
import { useState } from "react";
import { DeliveryMap } from "@/components/delivery-map";
import { clearCart, setQuantity, useCart } from "@/components/cart";

export function CartCheckout() {
  const lines = useCart();
  const [form, setForm] = useState({ recipientName: "", phone: "", city: "", address: "", note: "" });
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const update = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(event: { preventDefault: () => void }) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          latitude: coords?.[0] ?? null,
          longitude: coords?.[1] ?? null,
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity }))
        })
      });
      const data = await response.json();
      if (response.status === 401) { window.location.href = "/login"; return; }
      if (!response.ok) { setError(data.error ?? "Buyurtma yuborilmadi."); return; }
      clearCart();
      setDone(data.order.reference);
    } catch {
      setError("Tarmoq xatosi. Qayta urinib ko‘ring.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return <div className="panel-card stack">
      <h2>Buyurtma qabul qilindi</h2>
      <p>Buyurtma raqami: <strong>{done}</strong></p>
      <p className="muted">Narx va mavjudlik xodimlarimiz tomonidan tasdiqlanadi. Holatni profilingizdagi buyurtmalar bo‘limida kuzatishingiz mumkin.</p>
      <Link className="button" href="/portal/orders">Buyurtmani kuzatish</Link>
    </div>;
  }
  if (lines.length === 0) {
    return <div className="empty-state"><p>Savat bo‘sh.</p><Link className="button" href="/products">Katalogga o‘tish</Link></div>;
  }
  return <form onSubmit={submit} className="stack">
    <div className="panel-card stack">
      <h2>Savat</h2>
      {lines.map((line) => <div key={line.productId} style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <Link href={`/products/${line.slug}`}>{line.name}</Link>
        <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button type="button" className="button secondary" onClick={() => setQuantity(line.productId, line.quantity - 1)} aria-label="Kamaytirish">−</button>
          <strong>{line.quantity}</strong>
          <button type="button" className="button secondary" onClick={() => setQuantity(line.productId, line.quantity + 1)} aria-label="Ko‘paytirish">+</button>
          <button type="button" className="button secondary" onClick={() => setQuantity(line.productId, 0)}>O‘chirish</button>
        </span>
      </div>)}
      <p className="small muted">Yakuniy narx buyurtma tasdiqlanganda xodim tomonidan bildiriladi.</p>
    </div>

    <div className="panel-card stack">
      <h2>Yetkazib berish</h2>
      <input required placeholder="Qabul qiluvchi ismi" value={form.recipientName} onChange={update("recipientName")} maxLength={120} />
      <input required placeholder="Telefon (+998…)" value={form.phone} onChange={update("phone")} maxLength={30} inputMode="tel" />
      <input required placeholder="Shahar / viloyat" value={form.city} onChange={update("city")} maxLength={80} />
      <DeliveryMap value={coords} onChange={(c, address) => { setCoords(c); if (address) setForm((f) => ({ ...f, address })); }} />
      <input required placeholder="Manzil (ko‘cha, uy, mo‘ljal)" value={form.address} onChange={update("address")} maxLength={300} />
      {coords && <p className="small muted">Tanlangan nuqta: {coords[0].toFixed(5)}, {coords[1].toFixed(5)}</p>}
      <textarea placeholder="Izoh (ixtiyoriy)" value={form.note} onChange={update("note")} maxLength={500} rows={3} />
      {error && <p role="alert" style={{ color: "#b3261e" }}>{error}</p>}
      <button className="button" type="submit" disabled={busy}>{busy ? "Yuborilmoqda…" : "Buyurtma berish"}</button>
    </div>
  </form>;
}
