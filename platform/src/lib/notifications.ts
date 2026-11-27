/**
 * The customer's notification list. Rows hold raw payloads, delivery errors and dedup keys, so only known
 * customer events are shown, and only fields picked here leave the server. Links are built from the event,
 * never taken from the payload. Pure, so it is tested without a database.
 */
import { statusText, type StatusLocale } from "./status-labels";

export const CUSTOMER_EVENTS = [
  "TEC_GIFT", "ORDER_STATUS_CHANGED", "ORDER_PAYMENT_CHANGED", "WALLET_APPROVED", "WALLET_REJECTED", "SUPPORT_MESSAGE_RECEIVED",
  "SERVICE_REQUEST_STATUS_CHANGED", "TRIAL_EXPIRING", "TRIAL_EXPIRED", "SHOP_APPROVE", "SHOP_REJECT", "SHOP_SUSPEND", "SHOP_REACTIVATE"
] as const;
export type CustomerEvent = typeof CUSTOMER_EVENTS[number];
export const isCustomerEvent = (event: string): event is CustomerEvent => (CUSTOMER_EVENTS as readonly string[]).includes(event);

export type NotificationParams = { reference?: string; status?: string; kind?: string; amountMinor?: number; amountTec?: number; senderName?: string; daysRemaining?: number };
export type NotificationView = { id: string; event: CustomerEvent; unread: boolean; createdAt: string; href: string; params: NotificationParams };

/** Where each kind of news is handled. Pages check ownership themselves. */
export const notificationLinks: Record<CustomerEvent, string> = {
  TEC_GIFT: "/portal/wallet",
  ORDER_STATUS_CHANGED: "/portal/orders",
  ORDER_PAYMENT_CHANGED: "/portal/orders",
  WALLET_APPROVED: "/portal/wallet",
  WALLET_REJECTED: "/portal/wallet",
  SUPPORT_MESSAGE_RECEIVED: "/portal/messages",
  SERVICE_REQUEST_STATUS_CHANGED: "/portal/requests",
  TRIAL_EXPIRING: "/portal/devices",
  TRIAL_EXPIRED: "/portal/devices",
  SHOP_APPROVE: "/shop",
  SHOP_REJECT: "/shop",
  SHOP_SUSPEND: "/shop",
  SHOP_REACTIVATE: "/shop"
};

const text = (value: unknown, max = 80) => typeof value === "string" && value.trim() ? value.trim().slice(0, max) : undefined;
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : undefined;

/** One stored row as the customer may see it, or null for anything not meant for them. */
export function notificationView(row: { id: string; event: string; status: string; createdAt: Date | string; payload: unknown }): NotificationView | null {
  if (!isCustomerEvent(row.event)) return null;
  const payload = row.payload && typeof row.payload === "object" ? row.payload as Record<string, unknown> : {};
  const params: NotificationParams = {
    reference: text(payload.reference, 40), status: text(payload.status, 40), kind: text(payload.kind, 20),
    amountMinor: number(payload.amountMinor), amountTec: number(payload.amountTec), senderName: text(payload.senderName), daysRemaining: number(payload.daysRemaining)
  };
  for (const key of Object.keys(params) as (keyof NotificationParams)[]) if (params[key] === undefined) delete params[key];
  return {
    id: row.id, event: row.event, unread: row.status === "UNREAD",
    createdAt: typeof row.createdAt === "string" ? row.createdAt : row.createdAt.toISOString(),
    href: notificationLinks[row.event], params
  };
}

const money = (minor: number) => `${Math.round(minor / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} UZS`;

/** The sentence shown for a notification, in the visitor's language. */
export function notificationText(view: NotificationView, locale: StatusLocale): string {
  const p = view.params;
  const ref = p.reference ? ` ${p.reference}` : "";
  const words = {
    uz: {
      TEC_GIFT: `${p.senderName ?? "Tecsecure"} sizga ${p.amountTec ?? ""} TEC sovg‘a qildi`,
      ORDER_STATUS_CHANGED: `Buyurtma${ref}: ${statusText("order", p.status, "uz")}`,
      ORDER_PAYMENT_CHANGED: `Buyurtma${ref}: ${p.kind === "REFUNDED" ? "pul qaytarildi" : "chek qabul qilinmadi, yangi chek yuklang"}`,
      WALLET_APPROVED: `Hamyon so‘rovi tasdiqlandi${p.amountMinor ? `: ${money(p.amountMinor)}` : ""}`,
      WALLET_REJECTED: `Hamyon so‘rovi rad etildi${p.amountMinor ? `: ${money(p.amountMinor)}` : ""}`,
      SUPPORT_MESSAGE_RECEIVED: `Yangi javob${ref}`,
      SERVICE_REQUEST_STATUS_CHANGED: `Ariza${ref}: ${statusText("request", p.status, "uz")}`,
      TRIAL_EXPIRING: `Monitoring sinov davri ${p.daysRemaining ?? ""} kunda tugaydi`,
      TRIAL_EXPIRED: "Monitoring sinov davri tugadi",
      SHOP_APPROVE: "Do‘koningiz tasdiqlandi", SHOP_REJECT: "Do‘kon arizasi rad etildi", SHOP_SUSPEND: "Do‘koningiz to‘xtatildi", SHOP_REACTIVATE: "Do‘koningiz qayta ochildi"
    },
    ru: {
      TEC_GIFT: `${p.senderName ?? "Tecsecure"} подарил(а) вам ${p.amountTec ?? ""} TEC`,
      ORDER_STATUS_CHANGED: `Заказ${ref}: ${statusText("order", p.status, "ru")}`,
      ORDER_PAYMENT_CHANGED: `Заказ${ref}: ${p.kind === "REFUNDED" ? "деньги возвращены" : "чек не принят, загрузите новый"}`,
      WALLET_APPROVED: `Заявка кошелька подтверждена${p.amountMinor ? `: ${money(p.amountMinor)}` : ""}`,
      WALLET_REJECTED: `Заявка кошелька отклонена${p.amountMinor ? `: ${money(p.amountMinor)}` : ""}`,
      SUPPORT_MESSAGE_RECEIVED: `Новый ответ${ref}`,
      SERVICE_REQUEST_STATUS_CHANGED: `Заявка${ref}: ${statusText("request", p.status, "ru")}`,
      TRIAL_EXPIRING: `Пробный период мониторинга закончится через ${p.daysRemaining ?? ""} дн.`,
      TRIAL_EXPIRED: "Пробный период мониторинга закончился",
      SHOP_APPROVE: "Ваш магазин одобрен", SHOP_REJECT: "Заявка магазина отклонена", SHOP_SUSPEND: "Ваш магазин приостановлен", SHOP_REACTIVATE: "Ваш магазин снова открыт"
    },
    en: {
      TEC_GIFT: `${p.senderName ?? "Tecsecure"} gave you ${p.amountTec ?? ""} TEC`,
      ORDER_STATUS_CHANGED: `Order${ref}: ${statusText("order", p.status, "en")}`,
      ORDER_PAYMENT_CHANGED: `Order${ref}: ${p.kind === "REFUNDED" ? "money returned" : "receipt not accepted, upload a new one"}`,
      WALLET_APPROVED: `Wallet request approved${p.amountMinor ? `: ${money(p.amountMinor)}` : ""}`,
      WALLET_REJECTED: `Wallet request rejected${p.amountMinor ? `: ${money(p.amountMinor)}` : ""}`,
      SUPPORT_MESSAGE_RECEIVED: `New reply${ref}`,
      SERVICE_REQUEST_STATUS_CHANGED: `Request${ref}: ${statusText("request", p.status, "en")}`,
      TRIAL_EXPIRING: `The monitoring trial ends in ${p.daysRemaining ?? ""} days`,
      TRIAL_EXPIRED: "The monitoring trial has ended",
      SHOP_APPROVE: "Your shop was approved", SHOP_REJECT: "Your shop application was declined", SHOP_SUSPEND: "Your shop was suspended", SHOP_REACTIVATE: "Your shop is open again"
    }
  } satisfies Record<StatusLocale, Record<CustomerEvent, string>>;
  return words[locale][view.event];
}

/** "9+" past nine; nothing at zero. */
export function unreadBadge(count: number): string | null {
  return count <= 0 ? null : count > 9 ? "9+" : String(count);
}
