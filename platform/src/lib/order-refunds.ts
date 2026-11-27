/**
 * Receipts and refunds by hand: when staff may refuse a card-transfer receipt, when the buyer may send a new
 * one, when a refund may be marked as paid out, and which shop-part refunds are still owed. Pure, so it is
 * tested alone; the server side lives in order-refunds-server.ts.
 */
export const PART_REFUND_DUE = "SHOP_PART_REFUND_DUE";
export const PART_REFUNDED = "SHOP_PART_REFUNDED";
export const PROOF_REJECTED = "ORDER_PROOF_REJECTED";

type OrderMoney = { status: string; paymentMethod: string; paymentStatus: string };

export const RECEIPT_REASON = { min: 3, max: 300 } as const;
export const REFUND_DOCUMENT = { min: 2, max: 120 } as const;
/** Receipt uploads one buyer may send for orders in an hour. */
export const RECEIPT_UPLOADS_PER_HOUR = 5;

/** Staff refuse a receipt still waiting to be checked on a live card-transfer order. */
export function canRejectReceipt(order: OrderMoney): boolean {
  return order.status !== "CANCELLED" && order.paymentMethod === "CARD_TRANSFER" && order.paymentStatus === "AWAITING_CONFIRMATION";
}

/** The buyer sends a new receipt after a refusal (the order is back to waiting for payment). */
export function canReuploadReceipt(order: OrderMoney): boolean {
  return order.status !== "CANCELLED" && order.paymentMethod === "CARD_TRANSFER" && order.paymentStatus === "AWAITING_PAYMENT";
}

/**
 * Staff mark a refund owed by hand as paid out. A Payme payment is returned from the Payme cabinet, and Payme
 * itself then reports it, so there is no button for it.
 */
export function canMarkRefunded(order: OrderMoney & { paymePerformed: boolean }): boolean {
  return order.paymentStatus === "REFUND_DUE" && !order.paymePerformed;
}

/** What a whole-order refund still owes: the total less shop parts already paid back by hand. */
export function wholeRefundMinor(totalMinor: number | null, partsRefundedMinor: number): number | null {
  if (totalMinor === null) return null;
  return Math.max(0, totalMinor - partsRefundedMinor);
}

/**
 * The share of a paid order that belongs to lines sold by no shop (Tecsecure's own goods): the total less
 * every shop part. Null when a part has no figures, so staff enter the amount themselves.
 */
export function ownLinesShareMinor(totalMinor: number | null, parts: { itemsTotalMinor: number | null; deliveryShareMinor: number | null }[]): number | null {
  if (totalMinor === null || parts.some(part => part.itemsTotalMinor === null)) return null;
  const shops = parts.reduce((sum, part) => sum + (part.itemsTotalMinor ?? 0) + (part.deliveryShareMinor ?? 0), 0);
  const share = totalMinor - shops;
  return share > 0 ? share : null;
}

/**
 * What refunding one shop's part does to a paid order: wallet money goes straight back; outside money is owed
 * back by hand for the whole order when the part is the whole order, otherwise only that part is queued and
 * the order stays paid, so the other shops are still credited.
 */
export function partRefundEffect(order: { paymentMethod: string; paymentStatus: string }, wholeOrder: boolean): "WALLET" | "REFUND_DUE" | "QUEUE" | "NONE" {
  if (order.paymentStatus !== "PAID") return "NONE";
  if (order.paymentMethod === "WALLET") return "WALLET";
  return wholeOrder ? "REFUND_DUE" : "QUEUE";
}

export type PartRefundDue = { id: string; entity: string; entityId: string; orderId: string; amountMinor: number | null; createdAt: Date | string };

/**
 * The shop-part refunds still owed: each "refund due" entry without its "refunded" entry, and only while
 * the order itself stays paid (a whole-order refund covers whatever was still owed).
 */
export function openPartRefunds<T extends PartRefundDue>(due: T[], refunded: { entity: string; entityId: string }[], orderPaid: (orderId: string) => boolean): T[] {
  const done = new Set(refunded.map(entry => `${entry.entity}:${entry.entityId}`));
  const seen = new Set<string>();
  return due.filter(entry => {
    const key = `${entry.entity}:${entry.entityId}`;
    if (done.has(key) || seen.has(key) || !orderPaid(entry.orderId)) return false;
    seen.add(key);
    return true;
  });
}

/** How much a part refund may still pay out: never past the order total, counting what was already paid back. */
export function partRefundRoom(totalMinor: number | null, alreadyRefundedMinor: number, askedMinor: number): number {
  if (totalMinor === null || !Number.isSafeInteger(askedMinor) || askedMinor <= 0) return 0;
  return Math.max(0, Math.min(askedMinor, totalMinor - alreadyRefundedMinor));
}

/** Reads a stored "refund due" entry's metadata. */
export function partRefundMeta(metadata: unknown): { orderId: string | null; amountMinor: number | null; shopName: string | null } {
  const data = metadata && typeof metadata === "object" ? metadata as Record<string, unknown> : {};
  return {
    orderId: typeof data.orderId === "string" ? data.orderId : null,
    amountMinor: typeof data.amountMinor === "number" && Number.isSafeInteger(data.amountMinor) && data.amountMinor > 0 ? data.amountMinor : null,
    shopName: typeof data.shopName === "string" ? data.shopName.slice(0, 120) : null
  };
}

export const refundWords = {
  uz: {
    reject: "Chekni rad etish", rejectReason: "Rad etish sababi (mijozga ko‘rinadi)", rejectSend: "Rad etish", cancel: "Bekor",
    refunded: "Pul qaytarildi", document: "Qaytarish hujjati raqami", refundedSend: "Saqlash", paymeRefund: "Payme kabinetidan qaytaring",
    reasonShort: "Sababni 3–300 belgida yozing.", documentShort: "Hujjat raqamini 2–120 belgida yozing.",
    partTitle: "Qism puli qaytarilishi kerak", partDone: "Qism puli qaytarildi", amount: "Summa (so‘m)", amountNote: "Summa qanday hisoblandi",
    partEmpty: "Qaytariladigan qism yo‘q.", failed: "Saqlanmadi. Qayta urinib ko‘ring.", amountInvalid: "Summani butun so‘mda, faqat raqam bilan yozing (masalan 150000).", amountHint: "Butun so‘mda, faqat raqam",
    rejected: "Chek qabul qilinmadi", reupload: "Chekni qayta yuklash", reuploadSend: "Chekni yuborish", reuploadPick: "Avval chek rasmini tanlang.", reuploadSent: "Chek yuborildi. Xodim tekshiradi."
  },
  ru: {
    reject: "Отклонить чек", rejectReason: "Причина отказа (её увидит клиент)", rejectSend: "Отклонить", cancel: "Отмена",
    refunded: "Деньги возвращены", document: "Номер документа возврата", refundedSend: "Сохранить", paymeRefund: "Верните через кабинет Payme",
    reasonShort: "Напишите причину: 3–300 символов.", documentShort: "Номер документа: 2–120 символов.",
    partTitle: "Нужно вернуть деньги за часть", partDone: "Деньги за часть возвращены", amount: "Сумма (сум)", amountNote: "Как посчитана сумма",
    partEmpty: "Возвратов по частям нет.", failed: "Не сохранено. Попробуйте ещё раз.", amountInvalid: "Укажите сумму в целых сумах, только цифрами (например 150000).", amountHint: "В целых сумах, только цифры",
    rejected: "Чек не принят", reupload: "Загрузить чек заново", reuploadSend: "Отправить чек", reuploadPick: "Сначала выберите фото чека.", reuploadSent: "Чек отправлен. Сотрудник проверит."
  },
  en: {
    reject: "Reject receipt", rejectReason: "Reason (the customer sees it)", rejectSend: "Reject", cancel: "Cancel",
    refunded: "Money returned", document: "Refund document number", refundedSend: "Save", paymeRefund: "Refund it from the Payme cabinet",
    reasonShort: "Write a reason of 3–300 characters.", documentShort: "Write a document number of 2–120 characters.",
    partTitle: "Part refund owed", partDone: "Part refund paid", amount: "Amount (UZS)", amountNote: "How the amount was worked out",
    partEmpty: "No part refunds owed.", failed: "Not saved. Please try again.", amountInvalid: "Enter the amount in whole so‘m, digits only (for example 150000).", amountHint: "Whole so‘m, digits only",
    rejected: "Receipt not accepted", reupload: "Upload the receipt again", reuploadSend: "Send receipt", reuploadPick: "Pick the receipt photo first.", reuploadSent: "Receipt sent. Staff will check it."
  }
} as const;
