"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ToastMessage } from "./toast-provider";
import { useSitePreferences } from "./site-preferences";
import { formatDateTime, formatMinor } from "@/lib/format";
import type { Locale } from "@/lib/messages";

const copy = {
  uz: {
    moderation: "Moderatsiya", payouts: "To‘lovlar", promotion: "Reklama narxi",
    pending: "Kutmoqda", approved: "Tasdiqlangan", rejected: "Rad etilgan", empty: "Bu yerda hech narsa yo‘q.",
    approve: "Tasdiqlash", reject: "Rad etish", reason: "Rad etish sababi (do‘konchiga boradi)", reasonNeeded: "Sababini yozing.", done: "Saqlandi.", failed: "Bajarilmadi.",
    shop: "Do‘kon", price: "Narx", stock: "Qoldiq", notCounted: "sanalmaydi", specs: "Xususiyatlar", warranty: "Kafolat", openPage: "Saytda ochish",
    requested: "Ochiq", paid: "To‘langan", payoutRejected: "Qaytarilgan", bank: "Bank", account: "Hisob", mfo: "MFO", recipient: "Qabul qiluvchi", balanceNow: "Hozirgi balans",
    reference: "To‘lov topshiriqnomasi raqami", markPaid: "To‘landi deb belgilash", returnPayout: "Rad etish va balansga qaytarish", referenceNeeded: "To‘lov raqamini yozing.",
    promoHint: "Do‘konlar mahsulotini katalog tepasiga chiqarishi uchun kunlik narx. Bo‘sh qoldirilsa, reklama o‘chirilgan bo‘ladi va do‘konlar sotib ola olmaydi. Pul do‘kon balansidan yechiladi.",
    perDay: "Kunlik narx (so‘m)", maxDays: "Bir martada ko‘pi bilan (kun)", save: "Saqlash", off: "O‘chirilgan",
    disputesOpen: "Ochiq", disputesClosed: "Hal qilingan", buyerSays: "Mijoz yozdi", sellerNote: "Sotuvchi izohi", order: "Buyurtma", partSum: "Bu qism summasi", contacts: "Aloqa",
    decisionNote: "Qaror izohi (mijoz va do‘konga boradi)", release: "Do‘konga o‘tkazish", refund: "Mijozga qaytarish", refundConfirm: "Bu qism bekor qilinadi va pul mijozga qaytariladi. Davom etasizmi?", RELEASED: "Do‘konga o‘tkazildi", REFUNDED: "Mijozga qaytarildi", walletAuto: "Hamyon orqali to‘langan: pul avtomatik qaytadi.", manualRefund: "Hamyondan boshqa usulda to‘langan: buyurtma “qaytarish kerak” deb belgilanadi, pulni qo‘lda qaytarasiz.",
    promoTitle: "Reklama narxi", holdTitle: "Pulni ushlab turish", holdDays: "Yetkazilgandan keyin (kun, 1–60)", holdOff: "Ushlab turilmaydi",
    holdHint: "Do‘kon buyurtmani o‘zi “Yetkazildi” deb belgilaydi. Shu kunlar o‘tmaguncha pul do‘kon balansiga tushmaydi: mijoz shu muddatda “Muammo bor” deb yozsa, pul siz “Murojaatlar”da hal qilguncha ushlanadi. Bo‘sh qoldirilsa, pul yetkazilishi bilan tushadi."
  },
  ru: {
    moderation: "Модерация", payouts: "Выплаты", promotion: "Цена рекламы",
    pending: "Ждут", approved: "Одобрены", rejected: "Отклонены", empty: "Здесь ничего нет.",
    approve: "Одобрить", reject: "Отклонить", reason: "Причина отклонения (уйдёт продавцу)", reasonNeeded: "Укажите причину.", done: "Сохранено.", failed: "Не получилось.",
    shop: "Магазин", price: "Цена", stock: "Остаток", notCounted: "не считается", specs: "Характеристики", warranty: "Гарантия", openPage: "Открыть на сайте",
    requested: "Открытые", paid: "Выплачены", payoutRejected: "Возвращены", bank: "Банк", account: "Счёт", mfo: "МФО", recipient: "Получатель", balanceNow: "Текущий баланс",
    reference: "Номер платёжного поручения", markPaid: "Отметить выплаченным", returnPayout: "Отклонить и вернуть на баланс", referenceNeeded: "Укажите номер платежа.",
    promoHint: "Цена за день, чтобы магазины поднимали товар в начало каталога. Пусто — реклама выключена и купить нельзя. Оплата списывается с баланса магазина.",
    perDay: "Цена в день (сум)", maxDays: "Максимум за раз (дней)", save: "Сохранить", off: "Выключено",
    disputesOpen: "Открытые", disputesClosed: "Решённые", buyerSays: "Покупатель пишет", sellerNote: "Комментарий продавца", order: "Заказ", partSum: "Сумма части", contacts: "Контакты",
    decisionNote: "Комментарий к решению (уйдёт покупателю и магазину)", release: "Перевести магазину", refund: "Вернуть покупателю", refundConfirm: "Часть будет отменена, деньги вернутся покупателю. Продолжить?", RELEASED: "Переведено магазину", REFUNDED: "Возвращено покупателю", walletAuto: "Оплачено кошельком: деньги вернутся автоматически.", manualRefund: "Оплачено не кошельком: заказ получит отметку «нужен возврат», деньги возвращаются вручную.",
    promoTitle: "Цена рекламы", holdTitle: "Удержание денег", holdDays: "После доставки (дней, 1–60)", holdOff: "Без удержания",
    holdHint: "Магазин сам отмечает заказ доставленным. Пока не пройдут эти дни, деньги не поступят на баланс: если за это время покупатель сообщит о проблеме, деньги ждут вашего решения в «Претензиях». Пусто — деньги поступают сразу после доставки."
  },
  en: {
    moderation: "Moderation", payouts: "Payouts", promotion: "Ad price",
    pending: "Waiting", approved: "Approved", rejected: "Rejected", empty: "Nothing here.",
    approve: "Approve", reject: "Reject", reason: "Reason (sent to the seller)", reasonNeeded: "Write a reason.", done: "Saved.", failed: "That did not work.",
    shop: "Shop", price: "Price", stock: "Stock", notCounted: "not counted", specs: "Specifications", warranty: "Warranty", openPage: "Open on site",
    requested: "Open", paid: "Paid", payoutRejected: "Returned", bank: "Bank", account: "Account", mfo: "MFO", recipient: "Recipient", balanceNow: "Balance now",
    reference: "Payment order number", markPaid: "Mark paid", returnPayout: "Reject and return to balance", referenceNeeded: "Enter the payment number.",
    promoHint: "Daily price for shops to put a product at the top of the catalogue. Empty means advertising is off and cannot be bought. Paid from the shop balance.",
    perDay: "Price per day (so‘m)", maxDays: "At most per purchase (days)", save: "Save", off: "Off",
    disputesOpen: "Open", disputesClosed: "Decided", buyerSays: "Buyer says", sellerNote: "Seller note", order: "Order", partSum: "This part", contacts: "Contacts",
    decisionNote: "Decision note (sent to the buyer and the shop)", release: "Pay the shop", refund: "Refund the buyer", refundConfirm: "This part is cancelled and the money goes back to the buyer. Continue?", RELEASED: "Paid to the shop", REFUNDED: "Refunded to the buyer", walletAuto: "Paid from the wallet: refunded automatically.", manualRefund: "Not paid from the wallet: the order is marked refund due and you return the money by hand.",
    promoTitle: "Ad price", holdTitle: "Holding money", holdDays: "After delivery (days, 1–60)", holdOff: "No hold",
    holdHint: "A shop marks its own orders delivered. Until these days pass the money does not reach its balance: if a buyer reports a problem in that time, the money waits for your decision under Complaints. Empty pays out on delivery."
  }
};

async function call<T>(url: string, init?: { method: string; body: unknown }): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const response = await fetch(url, init ? { method: init.method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(init.body) } : { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    return response.ok ? { ok: true, data } : { ok: false, error: data.error ?? "" };
  } catch {
    return { ok: false, error: "" };
  }
}

type ModerationProduct = {
  id: string; name: string; slug: string; description: string; brand: string | null; model: string | null; sku: string | null; priceMinor: number | null; currency: string;
  stockQuantity: number | null; warrantyDescription: string | null; specifications: Record<string, unknown> | null; media: string[] | null; moderation: string; moderationNote: string | null;
  status: string; updatedAt: string; category: { name: string } | null; shop: { id: string; name: string; slug: string; status: string } | null;
};

/** Staff check every shop listing before buyers see it: photos, text, price and details. */
export function AdminModeration() {
  const { locale } = useSitePreferences();
  const c = copy[locale as Locale];
  const [state, setState] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [data, setData] = useState<{ products: ModerationProduct[]; counts: Record<string, number> } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(() => { void call<typeof data>(`/api/admin/shop-products?moderation=${state}`).then(result => result.ok ? setData(result.data) : setError(result.error || c.failed)); }, [state, c.failed]);
  useEffect(load, [load]);

  return <section className="stack">
    <ToastMessage message={error} variant="error" />
    <ToastMessage message={notice} variant="success" />
    <nav className="shop-cats">{(["PENDING", "APPROVED", "REJECTED"] as const).map(value => <button key={value} type="button" className={`shop-chip${state === value ? " is-active" : ""}`} onClick={() => setState(value)}>
      {value === "PENDING" ? c.pending : value === "APPROVED" ? c.approved : c.rejected} · {data?.counts[value] ?? 0}</button>)}</nav>
    {data && data.products.length === 0 && <div className="empty-state">{c.empty}</div>}
    {data?.products.map(product => <ModerationCard key={product.id} product={product} c={c} onDone={text => { setNotice(text); load(); }} onError={setError} />)}
  </section>;
}

function ModerationCard({ product, c, onDone, onError }: { product: ModerationProduct; c: typeof copy.uz; onDone: (text: string) => void; onError: (text: string) => void }) {
  const { locale } = useSitePreferences();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  async function decide(action: "APPROVE" | "REJECT") {
    if (action === "REJECT" && note.trim().length < 3) { onError(c.reasonNeeded); return; }
    setBusy(true);
    const result = await call(`/api/admin/shop-products/${product.id}`, { method: "PATCH", body: { action, ...(note.trim() ? { note: note.trim() } : {}) } });
    setBusy(false);
    if (!result.ok) { onError(result.error || c.failed); return; }
    onDone(c.done);
  }
  const specs = Object.entries(product.specifications ?? {});
  return <article className="panel-card order-card admin-moderation-card">
    <div className="order-head">
      <div><h2>{product.name}</h2><span className="small muted">{c.shop}: {product.shop?.name} · {product.category?.name ?? "—"} · {formatDateTime(product.updatedAt)}</span></div>
      <span className="order-status">{product.priceMinor !== null ? formatMinor(product.priceMinor, product.currency, locale) : "—"}</span>
    </div>
    {product.media && product.media.length > 0 && <div className="admin-moderation-photos">{product.media.map(id => <a key={id} href={`/api/media/${id}`} target="_blank" rel="noreferrer"><img src={`/api/media/${id}`} alt="" loading="lazy" /></a>)}</div>}
    <p className="small">{[product.brand, product.model, product.sku ? `SKU ${product.sku}` : null].filter(Boolean).join(" · ")}</p>
    <p className="admin-moderation-text">{product.description}</p>
    {specs.length > 0 && <dl className="admin-moderation-specs">{specs.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>)}</dl>}
    <p className="small muted">{c.stock}: {product.stockQuantity ?? c.notCounted}{product.warrantyDescription ? ` · ${c.warranty}: ${product.warrantyDescription}` : ""}</p>
    {product.moderationNote && <p className="small"><strong>{c.reason}:</strong> {product.moderationNote}</p>}
    {product.status === "PUBLISHED" && <Link className="text-link small" href={`/products/${product.slug}`} target="_blank">{c.openPage} →</Link>}
    <div className="field"><label htmlFor={`mod-${product.id}`}>{c.reason}</label><input id={`mod-${product.id}`} value={note} maxLength={500} onChange={event => setNote(event.target.value)} /></div>
    <div className="order-actions">
      {product.moderation !== "APPROVED" && <button type="button" className="button" disabled={busy} onClick={() => void decide("APPROVE")}>{c.approve}</button>}
      {product.moderation !== "REJECTED" && <button type="button" className="button danger" disabled={busy} onClick={() => void decide("REJECT")}>{c.reject}</button>}
    </div>
  </article>;
}

type Payout = {
  id: string; amountMinor: number; status: string; bankName: string; account: string; mfo: string; recipient: string; reviewNote: string | null; paymentReference: string | null; createdAt: string;
  shop: { id: string; name: string; legalName: string | null; tin: string | null; balanceMinor: number };
};

/** Payout requests: staff send the bank transfer, then mark it paid with its number, or return it with a reason. */
export function AdminPayouts() {
  const { locale } = useSitePreferences();
  const c = copy[locale as Locale];
  const [state, setState] = useState<"REQUESTED" | "PAID" | "REJECTED">("REQUESTED");
  const [data, setData] = useState<{ payouts: Payout[]; open: number } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(() => { void call<typeof data>(`/api/admin/shop-payouts?status=${state}`).then(result => result.ok ? setData(result.data) : setError(result.error || c.failed)); }, [state, c.failed]);
  useEffect(load, [load]);
  return <section className="stack">
    <ToastMessage message={error} variant="error" />
    <ToastMessage message={notice} variant="success" />
    <nav className="shop-cats">{(["REQUESTED", "PAID", "REJECTED"] as const).map(value => <button key={value} type="button" className={`shop-chip${state === value ? " is-active" : ""}`} onClick={() => setState(value)}>
      {value === "REQUESTED" ? `${c.requested} · ${data?.open ?? 0}` : value === "PAID" ? c.paid : c.payoutRejected}</button>)}</nav>
    {data && data.payouts.length === 0 && <div className="empty-state">{c.empty}</div>}
    {data?.payouts.map(payout => <PayoutCard key={payout.id} payout={payout} c={c} onDone={text => { setNotice(text); load(); }} onError={setError} />)}
  </section>;
}

function PayoutCard({ payout, c, onDone, onError }: { payout: Payout; c: typeof copy.uz; onDone: (text: string) => void; onError: (text: string) => void }) {
  const { locale } = useSitePreferences();
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  async function decide(action: "PAID" | "REJECT") {
    if (action === "PAID" && !reference.trim()) { onError(c.referenceNeeded); return; }
    if (action === "REJECT" && note.trim().length < 3) { onError(c.reasonNeeded); return; }
    setBusy(true);
    const result = await call(`/api/admin/shop-payouts/${payout.id}`, { method: "PATCH", body: action === "PAID" ? { action, reference: reference.trim() } : { action, note: note.trim() } });
    setBusy(false);
    if (!result.ok) { onError(result.error || c.failed); return; }
    onDone(c.done);
  }
  return <article className="panel-card order-card">
    <div className="order-head">
      <div><h2>{payout.shop.name}</h2><span className="small muted">{formatDateTime(payout.createdAt)} · {payout.shop.legalName} · STIR {payout.shop.tin}</span></div>
      <span className="order-status">{formatMinor(payout.amountMinor, "UZS", locale)}</span>
    </div>
    <dl className="admin-moderation-specs">
      <div><dt>{c.recipient}</dt><dd>{payout.recipient}</dd></div>
      <div><dt>{c.bank}</dt><dd>{payout.bankName}</dd></div>
      <div><dt>{c.account}</dt><dd><code>{payout.account}</code></dd></div>
      <div><dt>{c.mfo}</dt><dd><code>{payout.mfo}</code></dd></div>
      <div><dt>{c.balanceNow}</dt><dd>{formatMinor(payout.shop.balanceMinor, "UZS", locale)}</dd></div>
    </dl>
    {payout.paymentReference && <p className="small">{c.reference}: <code>{payout.paymentReference}</code></p>}
    {payout.reviewNote && <p className="small">{c.reason}: {payout.reviewNote}</p>}
    {payout.status === "REQUESTED" && <>
      <div className="form-row">
        <div className="field"><label htmlFor={`ref-${payout.id}`}>{c.reference}</label><input id={`ref-${payout.id}`} value={reference} maxLength={120} onChange={event => setReference(event.target.value)} /></div>
        <div className="field"><label htmlFor={`note-${payout.id}`}>{c.reason}</label><input id={`note-${payout.id}`} value={note} maxLength={500} onChange={event => setNote(event.target.value)} /></div>
      </div>
      <div className="order-actions">
        <button type="button" className="button" disabled={busy} onClick={() => void decide("PAID")}>{c.markPaid}</button>
        <button type="button" className="button danger" disabled={busy} onClick={() => void decide("REJECT")}>{c.returnPayout}</button>
      </div>
    </>}
  </article>;
}

/** The daily price of a paid placement; empty switches advertising off. */
export function AdminPromotion() {
  const { locale } = useSitePreferences();
  const c = copy[locale as Locale];
  const [price, setPrice] = useState("");
  const [maxDays, setMaxDays] = useState("30");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    void call<{ promotion: { pricePerDayMinor: number | null; maxDays: number } }>("/api/admin/shop-promotion").then(result => {
      if (!result.ok) return;
      setPrice(result.data.promotion.pricePerDayMinor === null ? "" : String(result.data.promotion.pricePerDayMinor / 100));
      setMaxDays(String(result.data.promotion.maxDays));
    });
  }, []);
  async function save() {
    const value = price.trim() === "" ? null : Math.round(Number(price.replace(/\s/g, "")) * 100);
    if (value !== null && (!Number.isSafeInteger(value) || value <= 0)) { setError(c.failed); return; }
    setBusy(true); setError(""); setNotice("");
    const result = await call("/api/admin/shop-promotion", { method: "PUT", body: { pricePerDayMinor: value, maxDays: Number(maxDays) } });
    setBusy(false);
    if (!result.ok) { setError(result.error || c.failed); return; }
    setNotice(c.done);
  }
  return <section className="panel-card">
    <ToastMessage message={error} variant="error" />
    <ToastMessage message={notice} variant="success" />
    <h2>{c.promoTitle}</h2>
    <p className="small muted">{c.promoHint}</p>
    <div className="form-row">
      <div className="field"><label htmlFor="promo-price">{c.perDay}</label><input id="promo-price" inputMode="decimal" value={price} placeholder={c.off} onChange={event => setPrice(event.target.value)} /></div>
      <div className="field"><label htmlFor="promo-days">{c.maxDays}</label><input id="promo-days" inputMode="numeric" value={maxDays} onChange={event => setMaxDays(event.target.value.replace(/\D/g, ""))} /></div>
    </div>
    <button type="button" className="button" disabled={busy} onClick={() => void save()}>{c.save}</button>
  </section>;
}

type Dispute = {
  id: string; status: string; disputedAt: string; disputeNote: string | null; disputeResolution: string | null; disputeResolvedAt: string | null; sellerNote: string | null;
  itemsTotalMinor: number | null; deliveryShareMinor: number | null; shippedAt: string | null; deliveredAt: string | null;
  shop: { name: string; slug: string; phone: string; status: string };
  order: { id: string; reference: string; recipientName: string; phone: string; paymentMethod: string; paymentStatus: string; items: { name: string; quantity: number; shopId: string | null }[] };
};

/** Buyers' complaints about shop parcels; the part's money waits until staff pay the shop or refund the buyer. */
export function AdminDisputes() {
  const { locale } = useSitePreferences();
  const c = copy[locale as Locale];
  const [state, setState] = useState<"open" | "closed">("open");
  const [data, setData] = useState<{ disputes: Dispute[]; open: number } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(() => { void call<typeof data>(`/api/admin/shop-disputes?state=${state}`).then(result => result.ok ? setData(result.data) : setError(result.error || c.failed)); }, [state, c.failed]);
  useEffect(load, [load]);
  return <section className="stack">
    <ToastMessage message={error} variant="error" />
    <ToastMessage message={notice} variant="success" />
    <nav className="shop-cats">{(["open", "closed"] as const).map(value => <button key={value} type="button" className={`shop-chip${state === value ? " is-active" : ""}`} onClick={() => setState(value)}>
      {value === "open" ? `${c.disputesOpen} · ${data?.open ?? 0}` : c.disputesClosed}</button>)}</nav>
    {data && data.disputes.length === 0 && <div className="empty-state">{c.empty}</div>}
    {data?.disputes.map(dispute => <DisputeCard key={dispute.id} dispute={dispute} c={c} onDone={text => { setNotice(text); load(); }} onError={setError} />)}
  </section>;
}

function DisputeCard({ dispute, c, onDone, onError }: { dispute: Dispute; c: typeof copy.uz; onDone: (text: string) => void; onError: (text: string) => void }) {
  const { locale } = useSitePreferences();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const share = (dispute.itemsTotalMinor ?? 0) + (dispute.deliveryShareMinor ?? 0);
  async function decide(action: "RELEASE" | "REFUND") {
    if (note.trim().length < 3) { onError(c.reasonNeeded); return; }
    if (action === "REFUND" && !window.confirm(c.refundConfirm)) return;
    setBusy(true);
    const result = await call(`/api/admin/shop-disputes/${dispute.id}`, { method: "PATCH", body: { action, note: note.trim() } });
    setBusy(false);
    if (!result.ok) { onError(result.error || c.failed); return; }
    onDone(c.done);
  }
  const lines = dispute.order.items.filter(item => item.shopId !== null);
  return <article className="panel-card order-card">
    <div className="order-head">
      <div><h2>{c.order} {dispute.order.reference}</h2><span className="small muted">{formatDateTime(dispute.disputedAt)} · {c.shop}: <Link href={`/s/${dispute.shop.slug}`} target="_blank">{dispute.shop.name}</Link></span></div>
      <span className="order-status">{dispute.disputeResolution ? c[dispute.disputeResolution as "RELEASED" | "REFUNDED"] : formatMinor(share, "UZS", locale)}</span>
    </div>
    <dl className="admin-moderation-specs">
      <div><dt>{c.buyerSays}</dt><dd>{dispute.disputeNote}</dd></div>
      {dispute.sellerNote && <div><dt>{c.sellerNote}</dt><dd>{dispute.sellerNote}</dd></div>}
      <div><dt>{c.partSum}</dt><dd>{formatMinor(share, "UZS", locale)} · {lines.map(item => `${item.name} × ${item.quantity}`).join(", ")}</dd></div>
      <div><dt>{c.contacts}</dt><dd>{dispute.order.recipientName} <a href={`tel:${dispute.order.phone.replace(/[^\d+]/g, "")}`}>{dispute.order.phone}</a> · {dispute.shop.name} <a href={`tel:${dispute.shop.phone.replace(/[^\d+]/g, "")}`}>{dispute.shop.phone}</a></dd></div>
    </dl>
    {!dispute.disputeResolution && <>
      <p className="small muted">{dispute.order.paymentMethod === "WALLET" ? c.walletAuto : c.manualRefund}</p>
      <div className="field"><label htmlFor={`dn-${dispute.id}`}>{c.decisionNote}</label><textarea id={`dn-${dispute.id}`} rows={2} maxLength={500} value={note} onChange={event => setNote(event.target.value)} /></div>
      <div className="order-actions">
        <button type="button" className="button" disabled={busy} onClick={() => void decide("RELEASE")}>{c.release}</button>
        <button type="button" className="button danger" disabled={busy} onClick={() => void decide("REFUND")}>{c.refund}</button>
      </div>
    </>}
  </article>;
}

/** The hold on delivered money: the buyer's window to complain before a shop can withdraw it. */
export function AdminPayoutHold() {
  const { locale } = useSitePreferences();
  const c = copy[locale as Locale];
  const [days, setDays] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    void call<{ hold: { days: number | null } }>("/api/admin/shop-payout-hold").then(result => {
      if (result.ok) setDays(result.data.hold.days === null ? "" : String(result.data.hold.days));
    });
  }, []);
  async function save() {
    const value = days.trim() === "" ? null : Number(days);
    if (value !== null && (!Number.isInteger(value) || value < 1 || value > 60)) { setError(c.failed); return; }
    setBusy(true); setError(""); setNotice("");
    const result = await call("/api/admin/shop-payout-hold", { method: "PUT", body: { days: value } });
    setBusy(false);
    if (!result.ok) { setError(result.error || c.failed); return; }
    setNotice(c.done);
  }
  return <section className="panel-card">
    <ToastMessage message={error} variant="error" />
    <ToastMessage message={notice} variant="success" />
    <h2>{c.holdTitle}</h2>
    <p className="small muted">{c.holdHint}</p>
    <div className="field"><label htmlFor="hold-days">{c.holdDays}</label><input id="hold-days" inputMode="numeric" value={days} placeholder={c.holdOff} onChange={event => setDays(event.target.value.replace(/\D/g, ""))} /></div>
    <button type="button" className="button" disabled={busy} onClick={() => void save()}>{c.save}</button>
  </section>;
}
