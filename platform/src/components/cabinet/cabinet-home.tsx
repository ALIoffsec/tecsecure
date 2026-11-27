"use client";

import Link from "next/link";
import { AccountSessionActions } from "@/components/account-session-actions";
import { useSitePreferences } from "@/components/site-preferences";
import { TecGiftNotifications } from "@/components/tec-gift-notifications";
import { UiIcon, type IconName } from "@/components/ui-icon";
import { formatDate, formatMinor, formatNumber } from "@/lib/format";
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
  phoneMissing: string; phoneUnverified: string; settingsOk: string; help: string; helpLine: string; cancelRequested: string;
};

const words: Record<"uz" | "ru" | "en", Words> = {
  uz: {
    waiting: "Sizdan kutilmoqda", lastOrder: "Oxirgi buyurtma", sections: "Bo‘limlar", track: "Buyurtma bosqichlari",
    steps: ["Qabul", "Tayyor", "Yo‘lda", "Yetdi"],
    attention: { invoiceOverdue: "To‘lov muddati o‘tdi", orderUnpaid: "To‘lov kutilmoqda", receiptRejected: "Chek qabul qilinmadi", invoiceUnpaid: "Hisob to‘lanmagan", quoteWaiting: "Taklif javobingizni kutyapti" },
    view: "Ko‘rish", pay: "To‘lash", more: n => `yana ${n} ta`,
    orders: n => `${n} ta faol buyurtma`, ordersNone: "Uskuna xarid qilish",
    quotes: n => `${n} ta taklif javob kutyapti`, requests: n => `${n} ta ariza jarayonda`, requestsNone: "Xizmat so‘rash",
    lesson: title => `Davom ettirish: ${title}`, lessonNone: "O‘qishni davom ettirish",
    devices: n => `${n} ta qurilma`, quiet: n => `${n} ta qurilma javob bermayapti`,
    phoneMissing: "Telefon qo‘shilmagan", phoneUnverified: "Telefon tasdiqlanmagan", settingsOk: "Ma’lumot va xavfsizlik",
    help: "Yordam", helpLine: "Savol yozish", cancelRequested: "Bekor qilish so‘raldi"
  },
  ru: {
    waiting: "Ждёт вашего действия", lastOrder: "Последний заказ", sections: "Разделы", track: "Этапы заказа",
    steps: ["Принят", "Готов", "В пути", "Доставлен"],
    attention: { invoiceOverdue: "Срок оплаты прошёл", orderUnpaid: "Ожидается оплата", receiptRejected: "Чек не принят", invoiceUnpaid: "Счёт не оплачен", quoteWaiting: "Предложение ждёт ответа" },
    view: "Открыть", pay: "Оплатить", more: n => `ещё ${n}`,
    orders: n => `Активных заказов: ${n}`, ordersNone: "Купить оборудование",
    quotes: n => `Предложений ждут ответа: ${n}`, requests: n => `Заявок в работе: ${n}`, requestsNone: "Заказать услугу",
    lesson: title => `Продолжить: ${title}`, lessonNone: "Продолжить обучение",
    devices: n => `Устройств: ${n}`, quiet: n => `Не отвечают: ${n}`,
    phoneMissing: "Телефон не добавлен", phoneUnverified: "Телефон не подтверждён", settingsOk: "Данные и безопасность",
    help: "Помощь", helpLine: "Написать вопрос", cancelRequested: "Запрошена отмена"
  },
  en: {
    waiting: "Waiting on you", lastOrder: "Latest order", sections: "Sections", track: "Order progress",
    steps: ["Received", "Ready", "On the way", "Delivered"],
    attention: { invoiceOverdue: "Payment is overdue", orderUnpaid: "Awaiting payment", receiptRejected: "Receipt not accepted", invoiceUnpaid: "Invoice unpaid", quoteWaiting: "A quote awaits your answer" },
    view: "View", pay: "Pay", more: n => `${n} more`,
    orders: n => `${n} active ${n === 1 ? "order" : "orders"}`, ordersNone: "Buy equipment",
    quotes: n => `${n} ${n === 1 ? "quote awaits" : "quotes await"} your answer`, requests: n => `${n} ${n === 1 ? "request" : "requests"} in progress`, requestsNone: "Request a service",
    lesson: title => `Continue: ${title}`, lessonNone: "Continue learning",
    devices: n => `${n} ${n === 1 ? "device" : "devices"}`, quiet: n => `${n} not responding`,
    phoneMissing: "No phone added", phoneUnverified: "Phone not verified", settingsOk: "Details and security",
    help: "Help", helpLine: "Ask a question", cancelRequested: "Cancellation requested"
  }
};

const attentionIcon: Record<AttentionKind, IconName> = { invoiceOverdue: "alert", orderUnpaid: "creditCard", receiptRejected: "receipt", invoiceUnpaid: "receipt", quoteWaiting: "clipboard" };
const payKinds = new Set<AttentionKind>(["invoiceOverdue", "orderUnpaid", "invoiceUnpaid"]);

type Tile = { id: CabinetSection | "help"; href: string; icon: IconName; label: string; line: string; count?: number; warn?: boolean };

/**
 * The cabinet's home: greeting with the wallet, what waits on the customer, the latest active order on its
 * four-step line, and one card per section with a live line. Cards are the way into every section on a phone;
 * a computer also has the side menu.
 */
export function CabinetHome({ user, unread, nav, data }: { user: CabinetUser; unread: number; nav: CabinetNavState; data: CabinetHomeData }) {
  const { locale } = useSitePreferences();
  const w = words[locale];
  const labels = cabinetLabels[locale];
  const quotesWaiting = data.waiting.filter(item => item.kind === "quoteWaiting").length;
  const requestsCount = nav.counts.requests ?? 0;
  const tiles: Tile[] = [
    { id: "orders", href: "/portal/orders", icon: "truck", label: labels.orders, line: data.activeOrders ? w.orders(data.activeOrders) : w.ordersNone, count: nav.counts.orders },
    { id: "requests", href: "/portal/requests", icon: "clipboard", label: labels.requests, line: quotesWaiting ? w.quotes(quotesWaiting) : data.openRequests ? w.requests(data.openRequests) : w.requestsNone, count: requestsCount },
    ...(nav.show.learning ? [{ id: "learning" as const, href: data.lessonSlug ? `/learning/${data.lessonSlug}` : "/portal/learning", icon: "book" as const, label: labels.learning, line: data.lesson ? w.lesson(data.lesson[locale]) : w.lessonNone }] : []),
    { id: "wallet", href: "/portal/wallet", icon: "wallet", label: labels.wallet, line: `${formatMinor(data.walletMinor, "UZS", locale)} · ${formatNumber(data.tec, 0)} TEC` },
    ...(nav.show.devices || data.devices ? [{ id: "devices" as const, href: "/portal/devices", icon: "server" as const, label: labels.devices, line: data.quietDevices ? w.quiet(data.quietDevices) : w.devices(data.devices), warn: data.quietDevices > 0 }] : []),
    { id: "settings", href: data.phone === "verified" ? "/portal/settings" : "/portal/settings/profile", icon: "settings", label: labels.settings, line: data.phone === "missing" ? w.phoneMissing : data.phone === "unverified" ? w.phoneUnverified : w.settingsOk, warn: data.phone !== "verified" },
    { id: "help", href: "/portal/messages", icon: "mail", label: w.help, line: w.helpLine }
  ];
  const order = data.lastOrder;
  const step = order ? orderStep(order.status) : -1;
  return <>
    <CabinetHeader user={user} unread={unread} home={{ walletMinor: data.walletMinor, tec: data.tec }} />
    <TecGiftNotifications />
    {data.waiting.length > 0 && <section className="cab-block-plain" aria-labelledby="cab-waiting">
      <h2 id="cab-waiting" className="cab-h2">{w.waiting}</h2>
      <ul className="cab-attention">
        {data.waiting.map(item => <li className="cab-attention-row" key={item.key}>
          <span className="cab-attention-icon" aria-hidden="true"><UiIcon name={attentionIcon[item.kind]} /></span>
          <span className="cab-attention-text"><strong>{w.attention[item.kind]}</strong><small>{item.subject}</small></span>
          <Link className="button ghost cab-attention-action" href={item.href}>{payKinds.has(item.kind) ? w.pay : w.view}<span className="sr-only"> · {item.subject}</span></Link>
        </li>)}
      </ul>
    </section>}
    {order && <section aria-labelledby="cab-last-order">
      <Link className="panel-card cab-order" href={`/portal/orders/${order.id}`}>
        <span className="cab-order-head">
          <h2 id="cab-last-order" className="cab-h2">{w.lastOrder}</h2>
          <StatusBadge kind="order" code={order.status} />
        </span>
        <span className="cab-order-line">
          {order.first ? `${order.first.name} × ${order.first.quantity}` : order.reference}
          {order.more > 0 && <span className="muted"> · {w.more(order.more)}</span>}
        </span>
        <small className="muted">{order.reference} · {formatDate(order.createdAt)}</small>
        {order.cancelRequested && <small className="cab-warn-text">{w.cancelRequested}</small>}
        {step >= 0 && <ol className="cab-track" aria-label={w.track}>
          {w.steps.map((label, index) => <li key={label} className={index <= step ? "is-done" : undefined} aria-current={index === step ? "step" : undefined}>
            <span className="cab-track-bar" aria-hidden="true" />
            <span className="cab-track-label">{label}</span>
          </li>)}
        </ol>}
      </Link>
    </section>}
    <nav className="cab-tiles" aria-label={w.sections}>
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
    <div className="cab-signout"><AccountSessionActions compact /></div>
  </>;
}
