/**
 * Every status a customer can see, in three languages, with a tone for its badge. The site, the admin
 * panel, Telegram messages and the Mini App read from here, so a raw code (NEW, TRIAL_ACTIVE) never shows.
 * An unknown code shows as "—" and is logged, never as a guess.
 */

export type StatusLocale = "uz" | "ru" | "en";
/** info: under way · wait: waiting for someone · done · bad: cancelled or refused · neutral. */
export type StatusTone = "info" | "wait" | "done" | "bad" | "neutral";
export type StatusKind = "order" | "payment" | "request" | "project" | "quote" | "invoice" | "invoicePayment" | "subscription" | "device" | "wallet";

type Entry = { tone: StatusTone; uz: string; ru: string; en: string };
const e = (tone: StatusTone, uz: string, ru: string, en: string): Entry => ({ tone, uz, ru, en });

const labels: Record<StatusKind, Record<string, Entry>> = {
  order: {
    NEW: e("wait", "Qabul qilindi", "Принят", "Received"),
    CONFIRMED: e("info", "Tasdiqlandi", "Подтверждён", "Confirmed"),
    PREPARING: e("info", "Tayyorlanmoqda", "Готовится", "Preparing"),
    SHIPPED: e("info", "Yo‘lda", "В пути", "On the way"),
    DELIVERED: e("done", "Yetkazildi", "Доставлен", "Delivered"),
    CANCELLED: e("bad", "Bekor qilindi", "Отменён", "Cancelled")
  },
  payment: {
    PENDING: e("neutral", "Qabul qilganda to‘lanadi", "Оплата при получении", "Pay on delivery"),
    AWAITING_CONFIRMATION: e("wait", "Chek tekshirilmoqda", "Чек проверяется", "Receipt under review"),
    AWAITING_PAYMENT: e("wait", "To‘lov kutilmoqda", "Ожидается оплата", "Awaiting payment"),
    PAID: e("done", "To‘langan", "Оплачен", "Paid"),
    REFUND_DUE: e("wait", "Qaytarilishi kerak", "Нужен возврат", "Refund due"),
    REFUNDED: e("neutral", "Qaytarilgan", "Возвращён", "Refunded")
  },
  request: {
    NEW: e("wait", "Ariza yuborildi", "Заявка отправлена", "Request sent"),
    UNDER_REVIEW: e("info", "Ko‘rib chiqilmoqda", "На рассмотрении", "Under review"),
    CONTACTED: e("info", "Siz bilan bog‘lanildi", "С вами связались", "We contacted you"),
    INSPECTION_REQUIRED: e("info", "Joyida ko‘rik kerak", "Нужен осмотр на месте", "Site visit needed"),
    QUOTATION_SENT: e("wait", "Narx taklifi yuborildi", "Предложение отправлено", "Quote sent"),
    APPROVED: e("info", "Tasdiqlandi", "Одобрено", "Approved"),
    IN_PROGRESS: e("info", "Ish bajarilmoqda", "Работа выполняется", "Work in progress"),
    COMPLETED: e("done", "Yakunlandi", "Завершено", "Completed"),
    REJECTED: e("bad", "Rad etildi", "Отклонено", "Declined"),
    CANCELLED: e("bad", "Bekor qilindi", "Отменено", "Cancelled")
  },
  project: {
    DRAFT: e("neutral", "Qoralama", "Черновик", "Draft"),
    QUOTE_REQUESTED: e("wait", "Narx so‘raldi", "Запрошена цена", "Price requested"),
    QUOTED: e("wait", "Narx taklifi keldi", "Пришло предложение", "Quote received"),
    APPROVED: e("info", "Tasdiqlandi", "Одобрено", "Approved"),
    IN_PROGRESS: e("info", "Ish bajarilmoqda", "Работа выполняется", "Work in progress"),
    COMPLETED: e("done", "Yakunlandi", "Завершено", "Completed"),
    CANCELLED: e("bad", "Bekor qilindi", "Отменено", "Cancelled")
  },
  quote: {
    DRAFT: e("neutral", "Tayyorlanmoqda", "Готовится", "Being prepared"),
    ISSUED: e("wait", "Javobingiz kutilmoqda", "Ждёт вашего ответа", "Waiting for your answer"),
    ACCEPTED: e("done", "Qabul qilindi", "Принято", "Accepted"),
    REJECTED: e("bad", "Rad etildi", "Отклонено", "Declined"),
    EXPIRED: e("neutral", "Muddati tugagan", "Срок истёк", "Expired"),
    CANCELLED: e("bad", "Bekor qilindi", "Отменено", "Cancelled")
  },
  invoice: {
    DRAFT: e("neutral", "Tayyorlanmoqda", "Готовится", "Being prepared"),
    ISSUED: e("wait", "To‘lov kutilmoqda", "Ожидает оплаты", "Awaiting payment"),
    PARTIALLY_PAID: e("wait", "Qisman to‘langan", "Оплачен частично", "Partly paid"),
    PAID: e("done", "To‘langan", "Оплачен", "Paid"),
    OVERDUE: e("bad", "Muddati o‘tgan", "Просрочен", "Overdue"),
    VOID: e("neutral", "Bekor qilingan, to‘lamang", "Отменён, не оплачивайте", "Void, do not pay"),
    REFUNDED: e("neutral", "Qaytarilgan", "Возвращён", "Refunded")
  },
  invoicePayment: {
    PENDING: e("wait", "Tekshirilmoqda", "Проверяется", "Being checked"),
    VERIFIED: e("done", "Tasdiqlandi", "Подтверждён", "Confirmed"),
    REJECTED: e("bad", "Rad etildi", "Отклонён", "Rejected"),
    REFUNDED: e("neutral", "Qaytarilgan", "Возвращён", "Refunded")
  },
  subscription: {
    NOT_ENROLLED: e("neutral", "Ulanmagan", "Не подключено", "Not enrolled"),
    TRIAL_ACTIVE: e("info", "Sinov davri", "Пробный период", "Trial"),
    ACTIVE: e("done", "Faol", "Активна", "Active"),
    PAST_DUE: e("wait", "To‘lov kutilmoqda", "Ожидается оплата", "Payment due"),
    SUSPENDED: e("bad", "To‘xtatilgan", "Приостановлена", "Suspended"),
    CANCELLED: e("bad", "Bekor qilingan", "Отменена", "Cancelled")
  },
  device: {
    UNKNOWN: e("neutral", "Tekshirilmagan", "Не проверено", "Not checked"),
    ONLINE: e("done", "Ishlayapti", "Работает", "Online"),
    OFFLINE: e("bad", "Javob bermadi", "Не отвечает", "Not responding"),
    STALE: e("wait", "Ma’lumot eskirgan", "Данные устарели", "Out of date"),
    MAINTENANCE: e("neutral", "Texnik xizmatda", "На обслуживании", "Under maintenance")
  },
  wallet: {
    PENDING: e("wait", "Ko‘rib chiqilmoqda", "На рассмотрении", "Under review"),
    APPROVED: e("done", "Tasdiqlandi", "Подтверждено", "Approved"),
    REJECTED: e("bad", "Rad etildi", "Отклонено", "Rejected"),
    CANCELLED: e("neutral", "Bekor qilindi", "Отменено", "Cancelled")
  }
};

/** The badge class for a tone: one of the two existing badges, never a raw status class. */
export const toneClass: Record<StatusTone, string> = { info: "", wait: "is-review", done: "is-done", bad: "is-cancelled", neutral: "is-neutral" };

/** The words and tone for a status. Unknown codes give "—" (and a log line), never a guess. */
export function statusLabel(kind: StatusKind, code: string | null | undefined, locale: StatusLocale = "uz"): { text: string; tone: StatusTone } {
  const entry = code ? labels[kind][code] : undefined;
  if (!entry) {
    if (code) console.warn(`Unknown ${kind} status: ${code}`);
    return { text: "—", tone: "neutral" };
  }
  return { text: entry[locale], tone: entry.tone };
}

/** Just the words, for Telegram messages and plain text. */
export function statusText(kind: StatusKind, code: string | null | undefined, locale: StatusLocale = "uz"): string {
  return statusLabel(kind, code, locale).text;
}

export const statusCodes = (kind: StatusKind): string[] => Object.keys(labels[kind]);
