"use client";

import Link from "next/link";
import { useState } from "react";
import { DeliveryMap } from "@/components/delivery-map";
import { clearCart, setQuantity, useCart } from "@/components/cart";
import { ProductVisual } from "@/components/product-visual";

function Steps({ current }: { current: 1 | 2 | 3 }) {
  const items = ["Savat", "Yetkazib berish", "Tasdiqlash"];
  return <ol className="shop-steps" aria-label="Bosqichlar">
    {items.map((label, i) => <li key={label} className={i + 1 === current ? "is-active" : i + 1 < current ? "is-done" : ""}><span>{label}</span></li>)}
  </ol>;
}

export function CartCheckout() {
  const lines = useCart();
  const [form, setForm] = useState({ recipientName: "", phone: "", city: "Toshkent", address: "", note: "" });
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const update = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const count = lines.reduce((s, l) => s + l.quantity, 0);

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
    return <>
      <Steps current={3} />
      <div className="panel-card stack" style={{ textAlign: "center", justifyItems: "center", padding: 40 }}>
        <div className="order-status is-done" style={{ fontSize: "1.4rem", padding: "10px 18px" }}>✓</div>
        <h2>Buyurtma qabul qilindi</h2>
        <p>Buyurtma raqami: <strong>{done}</strong></p>
        <p className="muted" style={{ maxWidth: 460 }}>Xodimlarimiz narx va mavjudlikni tasdiqlab, siz bilan bog‘lanadi. Holatni buyurtmalar sahifasida kuzatishingiz mumkin.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <Link className="button" href="/portal/orders">Buyurtmani kuzatish</Link>
          <Link className="button ghost" href="/products">Xaridni davom ettirish</Link>
        </div>
      </div>
    </>;
  }
  if (lines.length === 0) {
    return <div className="empty-state" style={{ textAlign: "center", padding: 48 }}>
      <p><strong>Savat bo‘sh</strong></p>
      <p>Katalogdan kerakli uskunalarni tanlang.</p>
      <Link className="button" href="/products">Katalogga o‘tish</Link>
    </div>;
  }
  return <>
    <Steps current={form.recipientName || form.address ? 2 : 1} />
    <form onSubmit={submit} className="shop-checkout">
      <div className="stack" style={{ gap: 18 }}>
        <section className="panel-card">
          <h2>Savatdagi mahsulotlar ({count})</h2>
          {lines.map((line) => <div className="shop-line" key={line.productId}>
            <ProductVisual categorySlug={line.categorySlug} />
            <div>
              <Link href={`/products/${line.slug}`}>{line.name}</Link>
              <div className="small muted">Narx tasdiqlanganda bildiriladi</div>
              <button type="button" className="small" style={{ background: "none", border: 0, padding: 0, color: "var(--danger)", cursor: "pointer" }} onClick={() => setQuantity(line.productId, 0)}>O‘chirish</button>
            </div>
            <div className="shop-qty">
              <button type="button" onClick={() => setQuantity(line.productId, line.quantity - 1)} aria-label="Kamaytirish">−</button>
              <output>{line.quantity}</output>
              <button type="button" onClick={() => setQuantity(line.productId, line.quantity + 1)} aria-label="Ko‘paytirish">+</button>
            </div>
          </div>)}
        </section>

        <section className="panel-card stack shop-address-card">
          <div>
            <span className="eyebrow">1-QADAM · XARITA</span>
            <h2>Yetkazish manzilini tanlang</h2>
            <p className="small muted">O‘zingiz turgan joyni aniqlang yoki yetkazish kerak bo‘lgan boshqa nuqtani xaritadan belgilang.</p>
          </div>
          <DeliveryMap value={coords} address={form.address} onChange={(c, address) => { setCoords(c); if (address) setForm((f) => ({ ...f, address })); }} />
          {coords && <div className="shop-map-note">📍 Tanlangan nuqta: {coords[0].toFixed(5)}, {coords[1].toFixed(5)}</div>}
          <div className="shop-field-row">
            <label className="shop-field"><span>Shahar / viloyat</span><input required value={form.city} onChange={update("city")} maxLength={80} autoComplete="address-level1" /></label>
            <label className="shop-field"><span>Aniq manzil / mo‘ljal</span><input required placeholder="Ko‘cha, uy, kirish, mo‘ljal" value={form.address} onChange={update("address")} maxLength={300} autoComplete="street-address" /></label>
          </div>
        </section>

        <section className="panel-card stack shop-contact-card">
          <div>
            <span className="eyebrow">2-QADAM · ALOQA</span>
            <h2>Qabul qiluvchi va aloqa</h2>
            <p className="small muted">Buyurtmani tasdiqlash va yetkazib berishni kelishish uchun.</p>
          </div>
          <div className="shop-field-row">
            <label className="shop-field"><span>Qabul qiluvchi nomi</span><input required value={form.recipientName} onChange={update("recipientName")} maxLength={120} autoComplete="name" /></label>
            <label className="shop-field"><span>Telefon raqami</span><input required placeholder="+998 90 123 45 67" value={form.phone} onChange={update("phone")} maxLength={30} inputMode="tel" autoComplete="tel" /></label>
          </div>
          <label className="shop-field"><span>Izoh / yetkazish bo‘yicha ko‘rsatma (ixtiyoriy)</span><textarea placeholder="Masalan: qo‘ng‘iroq qiling, darvoza yonida kutaman" value={form.note} onChange={update("note")} maxLength={500} rows={3} /></label>
        </section>
      </div>

      <aside className="shop-summary">
        <h2>Buyurtma xulosasi</h2>
        <div className="row"><span>Mahsulotlar</span><strong>{count} ta</strong></div>
        <div className="row"><span>Yetkazib berish nuqtasi</span><strong>{coords ? "Tanlangan ✓" : form.address ? "Matn bilan" : "—"}</strong></div>
        <div className="row"><span>Narx</span><strong>Tasdiqlanganda</strong></div>
        <p className="small muted">To‘lov hozircha onlayn emas: xodim narxni tasdiqlaydi va to‘lov usulini kelishasiz.</p>
        {error && <p role="alert" style={{ color: "var(--danger)", margin: 0 }}>{error}</p>}
        <button className="button" type="submit" disabled={busy}>{busy ? "Yuborilmoqda…" : "Buyurtma berish"}</button>
        <Link className="button ghost" href="/products">← Katalogga qaytish</Link>
      </aside>
    </form>
  </>;
}
