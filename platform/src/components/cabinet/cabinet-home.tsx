"use client";

import Link from "next/link";
import { useSitePreferences } from "@/components/site-preferences";
import { UiIcon, type IconName } from "@/components/ui-icon";
import { formatDate } from "@/lib/format";
import { ActivityBars } from "@/components/activity-bars";
import { MONTH_SHORT } from "@/lib/activity";
import { cabinetLabels, type CabinetSection } from "@/lib/cabinet-routes";
import { orderStep, type AttentionKind } from "@/lib/cabinet-home";
import type { CabinetHomeData } from "@/lib/cabinet-data";
import type { CabinetNavState } from "./cabinet-nav";
import type { CabinetUser } from "./cabinet-frame";
import { CabinetHeader } from "./cabinet-header";
import { StatusBadge } from "./sections";

type Words = {
  waiting: string; lastOrder: string; sections: string; track: string; steps: [string, string, string, string];
  attention: Record<AttentionKind, string>; view: string; pay: string; more: (n: number) => string;
  orders: (n: number) => string; ordersNone: string; quotes: (n: number) => string; requests: (n: number) => string; requestsNone: string;
  lesson: (title: string) => string; lessonNone: string; devices: (n: number) => string; quiet: (n: number) => string;
  phoneMissing: string; phoneUnverified: string; settingsOk: string; help: string; helpLine: string; cancelRequested: string; news: (n: number) => string;
  tileOrders: string; tileRequests: string; tileLearning: string; tileCertificates: string; ordersShort: (n: number) => string; quotesShort: (n: number) => string; requestsShort: (n: number) => string; lessonShort: (n: number) => string;
  activity: string; activityHint: string; activityEmpty: string; activityAction: string; certificates: (n: number) => string; certificatesNone: string; perMonth: string;
};

const words: Record<"uz" | "ru" | "en", Words> = {
  uz: {
    waiting: "Sizdan kutilmoqda", lastOrder: "Oxirgi buyurtma", sections: "Bo‘limlar", track: "Buyurtma bosqichlari",
    steps: ["Qabul", "Tayyor", "Yo‘lda", "Yetdi"],
    attention: { invoiceOverdue: "To‘lov muddati o‘tdi", orderUnpaid: "To‘lov kutilmoqda", receiptRejected: "Chek qabul qilinmadi", invoiceUnpaid: "Hisob to‘lanmagan", quoteWaiting: "Taklif javobingizni kutyapti", staffReply: "Xodim javob berdi", phoneUnverified: "Telefon raqamingizni tasdiqlang" },
    view: "Ko‘rish", pay: "To‘lash", more: n => `yana ${n} ta`,
    orders: n => `${n} ta faol buyurtma`, ordersNone: "Uskuna xarid qilish",
    quotes: n => `${n} ta taklif javob kutyapti`, requests: n => `${n} ta ariza jarayonda`, requestsNone: "Xizmat so‘rash",
    lesson: title => `Davom ettirish: ${title}`, lessonNone: "O‘qishni davom ettirish",
    devices: n => `${n} ta qurilma`, quiet: n => `${n} ta qurilma javob bermayapti`,
    phoneMissing: "Telefon qo‘shilmagan", phoneUnverified: "Telefon tasdiqlanmagan", settingsOk: "Ma’lumot va xavfsizlik",
    help: "Yordam", helpLine: "Savol yozish", news: n => `${n} ta yangi bildirishnoma`, cancelRequested: "Bekor qilish so‘raldi",
    tileOrders: "Buyurtmalar", tileRequests: "Arizalar", tileLearning: "O‘qishim", tileCertificates: "Sertifikatlar", ordersShort: n => `${n} faol`, quotesShort: n => `${n} taklif`, requestsShort: n => `${n} jarayonda`, lessonShort: n => `${n}-dars`,
    activity: "Faollik (12 oy)", activityHint: "Buyurtmalar, darslar va arizalar oylar bo‘yicha", activityEmpty: "Bu yerda oylik faolligingiz chiziladi. Birinchi qadam:", activityAction: "Darsni boshlash", certificates: n => `${n} ta sertifikat`, certificatesNone: "Birinchisini oling", perMonth: "ta"
  },
  ru: {
    waiting: "Ждёт вашего действия", lastOrder: "Последний заказ", sections: "Разделы", track: "Этапы заказа",
    steps: ["Принят", "Готов", "В пути", "Доставлен"],
    attention: { invoiceOverdue: "Срок оплаты прошёл", orderUnpaid: "Ожидается оплата", receiptRejected: "Чек не принят", invoiceUnpaid: "Счёт не оплачен", quoteWaiting: "Предложение ждёт ответа", staffReply: "Сотрудник ответил", phoneUnverified: "Подтвердите номер телефона" },
    view: "Открыть", pay: "Оплатить", more: n => `ещё ${n}`,
    orders: n => `Активных заказов: ${n}`, ordersNone: "Купить оборудование",
    quotes: n => `Предложений ждут ответа: ${n}`, requests: n => `Заявок в работе: ${n}`, requestsNone: "Заказать услугу",
    lesson: title => `Продолжить: ${title}`, lessonNone: "Продолжить обучение",
    devices: n => `Устройств: ${n}`, quiet: n => `Не отвечают: ${n}`,
    phoneMissing: "Телефон не добавлен", phoneUnverified: "Телефон не подтверждён", settingsOk: "Данные и безопасность",
    help: "Помощь", helpLine: "Написать вопрос", news: n => `Новых уведомлений: ${n}`, cancelRequested: "Запрошена отмена",
    tileOrders: "Заказы", tileRequests: "Заявки", tileLearning: "Обучение", tileCertificates: "Сертификаты", ordersShort: n => `${n} активн.`, quotesShort: n => `предложений: ${n}`, requestsShort: n => `в работе: ${n}`, lessonShort: n => `урок ${n}`,
    activity: "Активность (12 мес.)", activityHint: "Заказы, уроки и заявки по месяцам", activityEmpty: "Здесь появится ваша активность по месяцам. Первый шаг:", activityAction: "Начать урок", certificates: n => `Сертификатов: ${n}`, certificatesNone: "Получите первый", perMonth: ""
  },
  en: {
    waiting: "Waiting on you", lastOrder: "Latest order", sections: "Sections", track: "Order progress",
    steps: ["Received", "Ready", "On the way", "Delivered"],
    attention: { invoiceOverdue: "Payment is overdue", orderUnpaid: "Awaiting payment", receiptRejected: "Receipt not accepted", invoiceUnpaid: "Invoice unpaid", quoteWaiting: "A quote awaits your answer", staffReply: "Staff replied", phoneUnverified: "Verify your phone number" },
    view: "View", pay: "Pay", more: n => `${n} more`,
    orders: n => `${n} active ${n === 1 ? "order" : "orders"}`, ordersNone: "Buy equipment",
    quotes: n => `${n} ${n === 1 ? "quote awaits" : "quotes await"} your answer`, requests: n => `${n} ${n === 1 ? "request" : "requests"} in progress`, requestsNone: "Request a service",
    lesson: title => `Continue: ${title}`, lessonNone: "Continue learning",
    devices: n => `${n} ${n === 1 ? "device" : "devices"}`, quiet: n => `${n} not responding`,
    phoneMissing: "No phone added", phoneUnverified: "Phone not verified", settingsOk: "Details and security",
    help: "Help", helpLine: "Ask a question", news: n => `${n} new notification${n === 1 ? "" : "s"}`, cancelRequested: "Cancellation requested",
    tileOrders: "Orders", tileRequests: "Requests", tileLearning: "Learning", tileCertificates: "Certificates", ordersShort: n => `${n} active`, quotesShort: n => `${n} quote${n === 1 ? "" : "s"}`, requestsShort: n => `${n} in progress`, lessonShort: n => `lesson ${n}`,
    activity: "Activity (12 months)", activityHint: "Orders, lessons and requests by month", activityEmpty: "Your monthly activity will be drawn here. A first step:", activityAction: "Start a lesson", certificates: n => `${n} certificate${n === 1 ? "" : "s"}`, certificatesNone: "Earn your first", perMonth: ""
  }
};

const attentionIcon: Record<AttentionKind, IconName> = { invoiceOverdue: "alert", orderUnpaid: "creditCard", receiptRejected: "receipt", invoiceUnpaid: "receipt", quoteWaiting: "clipboard", staffReply: "mail", phoneUnverified: "phone" };
const payKinds = new Set<AttentionKind>(["invoiceOverdue", "orderUnpaid", "invoiceUnpaid"]);

type Tile = { id: CabinetSection; href: string; icon: IconName; label: string; line: string; count?: number; warn?: boolean };

/**
 * The cabinet's home: the identity card (wallet, TEC and learning level), what waits on the customer, the latest
 * order, a year of activity, and compact tiles (2×2, or 2×3 with devices). Everything else is in the avatar
 * menu and, on a computer, the side menu.
 */
export function CabinetHome({ user, unread, nav, data }: { user: CabinetUser; unread: number; nav: CabinetNavState; data: CabinetHomeData }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const labels = cabinetLabels[locale];
  const quotesWaiting = data.waiting.filter(item => item.kind === "quoteWaiting").length;
  const tiles: Tile[] = [
    { id: "orders", href: "/portal/orders", icon: "truck", label: w.tileOrders, line: data.activeOrders ? w.ordersShort(data.activeOrders) : w.ordersNone, count: nav.counts.orders },
    { id: "requests", href: "/portal/requests", icon: "clipboard", label: w.tileRequests, line: quotesWaiting ? w.quotesShort(quotesWaiting) : data.openRequests ? w.requestsShort(data.openRequests) : w.requestsNone, count: nav.counts.requests },
    { id: "learning", href: "/learning", icon: "book", label: w.tileLearning, line: data.lessonNext ? w.lessonShort(data.lessonNext) : w.lessonNone },
    { id: "certificates", href: "/learning/certifications", icon: "shield", label: w.tileCertificates, line: data.certificates ? w.certificates(data.certificates) : w.certificatesNone },
    ...(nav.show.devices || data.devices ? [{ id: "devices" as const, href: "/portal/devices", icon: "server" as const, label: labels.devices, line: data.quietDevices ? w.quiet(data.quietDevices) : w.devices(data.devices), warn: data.quietDevices > 0 }] : [])
  ];
  const order = data.lastOrder;
  const step = order ? orderStep(order.status) : -1;
  const months = MONTH_SHORT[locale];
  const activityEmpty = data.activity.every(item => item.count === 0);
  return <div className="cab-home">
    <CabinetHeader user={user} unread={unread} home={{ walletMinor: data.walletMinor, tec: data.tec, level: data.level, levelXp: data.levelXp, levelSpan: data.levelSpan }} />
    {unread > 0 && <Link className="cab-news-line" href="/portal/notifications"><UiIcon name="bell" size={18} /><span>{w.news(unread)}</span><UiIcon name="chevronRight" size={18} /></Link>}
    {data.waiting.length > 0 && <section className="cab-block-plain" aria-labelledby="cab-waiting">
      <h2 id="cab-waiting" className="cab-h2">{w.waiting}</h2>
      <ul className="cab-attention">
        {data.waiting.map(item => <li key={item.key}>
          <Link className="cab-attention-row is-link" href={item.href}>
            <span className="cab-attention-icon" aria-hidden="true"><UiIcon name={attentionIcon[item.kind]} /></span>
            <span className="cab-attention-text"><strong>{item.subject}: {w.attention[item.kind]}</strong><span className="sr-only"> · {payKinds.has(item.kind) ? w.pay : w.view}</span></span>
            <span className="cab-attention-chevron" aria-hidden="true"><UiIcon name="chevronRight" size={18} /></span>
          </Link>
        </li>)}
      </ul>
    </section>}
    {order && <section aria-labelledby="cab-last-order">
      <Link className="panel-card cab-order" href={`/portal/orders/${order.id}`}>
        <span className="cab-order-head">
          <h2 id="cab-last-order" className="cab-h2">{w.lastOrder}</h2>
          <StatusBadge kind="order" code={order.status} />
        </span>
        <span className="sr-only">{order.first ? `${order.first.name} × ${order.first.quantity}` : order.reference} · {formatDate(order.createdAt)}</span>
        {order.cancelRequested && <small className="cab-warn-text">{w.cancelRequested}</small>}
        {step >= 0 && <ol className="cab-track" aria-label={w.track}>
          {w.steps.map((label, index) => <li key={label} className={index <= step ? "is-done" : undefined} aria-current={index === step ? "step" : undefined}>
            <span className="cab-track-bar" aria-hidden="true" />
            <span className="cab-track-label">{label}</span>
          </li>)}
        </ol>}
      </Link>
    </section>}
    <section className="panel-card cab-activity" aria-labelledby="cab-activity">
      <h2 id="cab-activity" className="cab-h2">{w.activity}</h2>
      {activityEmpty
        ? <p className="small muted">{w.activityEmpty} <Link className="text-link" href="/learning">{w.activityAction}</Link></p>
        : <>
          <ActivityBars label={w.activityHint} unit={w.perMonth} bars={data.activity.map(item => ({ key: `${item.year}-${item.month}`, short: months[item.month], long: `${months[item.month]} ${item.year}`, value: item.count }))} />
          <p className="small muted">{w.activityHint}</p>
        </>}
    </section>
    <nav className={`cab-tiles${tiles.length > 4 ? " is-six" : ""}`} aria-label={w.sections}>
      <ul>
        {tiles.map(tile => <li key={tile.id}>
          <Link className="cab-tile" href={tile.href}>
            <span className="cab-tile-top">
              <span className="cab-tile-icon" aria-hidden="true"><UiIcon name={tile.icon} /></span>
              {(tile.count ?? 0) > 0 && <span className="cab-nav-count">{tile.count! > 9 ? "9+" : tile.count}</span>}
            </span>
            <span className="cab-tile-name">{tile.label}</span>
            <span className={`cab-tile-line${tile.warn ? " is-warn" : ""}`}>{tile.line}</span>
          </Link>
        </li>)}
      </ul>
    </nav>
  </div>;
}
