import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { lockOrder, paymeCancelRefused } from "./order-flow";
import { PART_REFUND_DUE, PART_REFUNDED, PROOF_REJECTED } from "./order-refunds";
import { lockProof, proofInUse, proofUsedMessage } from "./payment-proof";
import { canMarkRefunded, canReuploadReceipt, openPartRefunds, partRefundMeta, partRefundRoom, wholeRefundMinor, type PartRefundDue } from "./order-refunds";
import { escapeTelegramHtml, notifyTelegramAdmins, notifyTelegramUser } from "./telegram";
import { formatMinor } from "./format";

type Tx = Prisma.TransactionClient;
export type RefundResult = { ok: true } | { ok: false; status: number; error: string; code?: string };

/** What was already paid back by hand for parts of this order. */
async function partsRefundedMinor(tx: Tx, orderId: string): Promise<number> {
  const rows = await tx.auditLog.findMany({ where: { action: PART_REFUNDED, metadata: { path: ["orderId"], equals: orderId } }, select: { metadata: true } });
  return rows.reduce((sum, row) => sum + (partRefundMeta(row.metadata).amountMinor ?? 0), 0);
}

async function tellCustomer(tx: Tx, order: { id: string; customerId: string; reference: string }, kind: "RECEIPT_REJECTED" | "REFUNDED") {
  await tx.notification.create({ data: { userId: order.customerId, channel: "IN_APP", event: "ORDER_PAYMENT_CHANGED", status: "UNREAD", payload: { reference: order.reference, orderId: order.id, kind } } });
}

/** Staff refuse a card-transfer receipt: the order goes back to waiting for payment, the old receipt is kept. */
export async function rejectReceipt(orderId: string, reason: string, actorId: string): Promise<RefundResult> {
  const order = await prisma.$transaction(async (tx) => {
    const locked = await lockOrder(tx, orderId);
    if (!locked) return null;
    const { paymentProofMediaId } = await tx.order.findUniqueOrThrow({ where: { id: orderId }, select: { paymentProofMediaId: true } });
    const claim = await tx.order.updateMany({
      where: { id: orderId, status: { not: "CANCELLED" }, paymentStatus: "AWAITING_CONFIRMATION", paymentMethod: "CARD_TRANSFER" },
      data: { paymentStatus: "AWAITING_PAYMENT" }
    });
    if (claim.count === 0) return null;
    await tx.auditLog.create({ data: { actorId, action: PROOF_REJECTED, entity: "Order", entityId: orderId, metadata: { proofMediaId: paymentProofMediaId, reason } } });
    await tellCustomer(tx, locked, "RECEIPT_REJECTED");
    return locked;
  });
  if (!order) return { ok: false, status: 409, error: "Bu buyurtmada rad etiladigan chek yo‘q." };
  await notifyTelegramUser(order.customerId, `<b>Tecsecure: chek qabul qilinmadi</b>\nBuyurtma <code>${escapeTelegramHtml(order.reference)}</code>.\nSabab: ${escapeTelegramHtml(reason)}\n\nKabinetdagi “Buyurtmalarim” bo‘limida yangi chek yuklang.`);
  return { ok: true };
}

/** The buyer sends a new receipt for a refused card transfer. The old one stays on record in the audit log. */
export async function reuploadReceipt(customerId: string, orderId: string, mediaId: string): Promise<RefundResult> {
  const media = await prisma.mediaAsset.findUnique({ where: { id: mediaId }, select: { ownerId: true, private: true, mimeType: true } });
  if (!media || media.ownerId !== customerId || !media.private || !media.mimeType.startsWith("image/")) {
    return { ok: false, status: 400, error: "Chek rasmini qayta yuklang.", code: "BAD_PROOF" };
  }
  try {
    const order = await prisma.$transaction(async (tx) => {
      const locked = await lockOrder(tx, orderId);
      if (!locked || locked.customerId !== customerId) return "MISSING" as const;
      if (!canReuploadReceipt(locked)) return "STATE" as const;
      await lockProof(tx, mediaId);
      if (await proofInUse(tx, mediaId, { orderId })) throw new Error("PROOF_USED");
      const claim = await tx.order.updateMany({
        where: { id: orderId, customerId, status: { not: "CANCELLED" }, paymentMethod: "CARD_TRANSFER", paymentStatus: "AWAITING_PAYMENT" },
        data: { paymentStatus: "AWAITING_CONFIRMATION", paymentProofMediaId: mediaId }
      });
      if (claim.count === 0) return "STATE" as const;
      await tx.auditLog.create({ data: { actorId: customerId, action: "ORDER_PROOF_REUPLOADED", entity: "Order", entityId: orderId, metadata: { proofMediaId: mediaId } } });
      return locked;
    });
    if (order === "MISSING") return { ok: false, status: 404, error: "Buyurtma topilmadi." };
    if (order === "STATE") return { ok: false, status: 409, error: "Bu buyurtmaga hozir chek yuklab bo‘lmaydi. Sahifani yangilang.", code: "NOT_AWAITING" };
    await notifyTelegramAdmins(`<b>🧾 Yangi chek</b>\nBuyurtma <code>${escapeTelegramHtml(order.reference)}</code>: mijoz chekni qayta yukladi. Admin panelda tekshiring.`, order.reference);
    return { ok: true };
  } catch (error) {
    if (error instanceof Error && error.message === "PROOF_USED") return { ok: false, status: 409, error: proofUsedMessage, code: "PROOF_USED" };
    throw error;
  }
}

/** Staff record that a refund owed by hand was paid out, with the document that proves it. */
export async function markOrderRefunded(orderId: string, document: string, actorId: string): Promise<RefundResult> {
  const outcome = await prisma.$transaction(async (tx) => {
    const order = await lockOrder(tx, orderId);
    if (!order) return { error: "MISSING" as const };
    // A Payme payment goes back from the Payme cabinet, unless Payme would refuse that cancel (goods delivered,
    // a shop paid, or a part already returned by hand): then staff close the rest by hand.
    const paymePerformed = (await tx.paymeTransaction.count({ where: { orderId, state: 2 } })) > 0 && !(await paymeCancelRefused(tx, orderId));
    if (order.paymentStatus === "REFUND_DUE" && paymePerformed) return { error: "PAYME" as const };
    if (!canMarkRefunded({ ...order, paymePerformed })) return { error: "STATE" as const };
    const claim = await tx.order.updateMany({ where: { id: orderId, paymentStatus: "REFUND_DUE" }, data: { paymentStatus: "REFUNDED" } });
    if (claim.count === 0) return { error: "STATE" as const };
    const amountMinor = wholeRefundMinor(order.totalMinor, await partsRefundedMinor(tx, orderId));
    await tx.auditLog.create({ data: { actorId, action: "ORDER_REFUNDED_BY_HAND", entity: "Order", entityId: orderId, metadata: { document, amountMinor } } });
    await tellCustomer(tx, order, "REFUNDED");
    return { order, amountMinor };
  });
  if ("error" in outcome) {
    if (outcome.error === "MISSING") return { ok: false, status: 404, error: "Buyurtma topilmadi." };
    if (outcome.error === "PAYME") return { ok: false, status: 409, error: "Payme orqali to‘langan pulni Payme kabinetidan qaytaring; Payme o‘zi xabar beradi.", code: "PAYME" };
    return { ok: false, status: 409, error: "Bu buyurtmada qaytarilishi kerak pul yo‘q." };
  }
  const amount = outcome.amountMinor ? `: <b>${escapeTelegramHtml(formatMinor(outcome.amountMinor, "UZS"))}</b>` : "";
  await notifyTelegramUser(outcome.order.customerId, `<b>Tecsecure: pul qaytarildi</b>\nBuyurtma <code>${escapeTelegramHtml(outcome.order.reference)}</code>${amount}.`);
  return { ok: true };
}

/** Staff record that one part's refund was paid out. Once per part; never more than the order total. */
export async function markPartRefunded(dueId: string, input: { document: string; amountMinor?: number; note?: string }, actorId: string): Promise<RefundResult> {
  const due = await prisma.auditLog.findUnique({ where: { id: dueId }, select: { action: true, entity: true, entityId: true, metadata: true } });
  const meta = due ? partRefundMeta(due.metadata) : null;
  if (!due || due.action !== PART_REFUND_DUE || !due.entityId || !meta?.orderId) return { ok: false, status: 404, error: "Qaytariladigan qism topilmadi." };
  const orderId = meta.orderId;
  const asked = meta.amountMinor ?? input.amountMinor ?? null;
  if (asked === null) return { ok: false, status: 400, error: "Bu qism summasi hisoblanmagan: summani va izohni yozing.", code: "AMOUNT_REQUIRED" };
  if (meta.amountMinor === null && (input.note?.trim().length ?? 0) < 3) return { ok: false, status: 400, error: "Summa qanday hisoblanganini izohda yozing.", code: "NOTE_REQUIRED" };
  const outcome = await prisma.$transaction(async (tx) => {
    const order = await lockOrder(tx, orderId);
    if (!order) return { error: "MISSING" as const };
    if (order.paymentStatus !== "PAID") return { error: "COVERED" as const };
    const done = await tx.auditLog.count({ where: { action: PART_REFUNDED, entity: due.entity, entityId: due.entityId } });
    if (done > 0) return { error: "DONE" as const };
    const already = await partsRefundedMinor(tx, orderId);
    if (partRefundRoom(order.totalMinor, already, asked) < asked) return { error: "OVER_TOTAL" as const };
    await tx.auditLog.create({
      data: { actorId, action: PART_REFUNDED, entity: due.entity, entityId: due.entityId, metadata: { orderId, dueId, amountMinor: asked, document: input.document, note: input.note?.trim() || null } }
    });
    await tellCustomer(tx, order, "REFUNDED");
    return { order };
  });
  if ("error" in outcome) {
    if (outcome.error === "MISSING") return { ok: false, status: 404, error: "Buyurtma topilmadi." };
    if (outcome.error === "COVERED") return { ok: false, status: 409, error: "Buyurtma to‘liq qaytarishga o‘tgan: pulni “Pul qaytarildi” orqali yoping.", code: "COVERED" };
    if (outcome.error === "DONE") return { ok: false, status: 409, error: "Bu qism puli allaqachon qaytarilgan.", code: "DONE" };
    return { ok: false, status: 409, error: "Summa buyurtma jamidan oshib ketadi. Summani tekshiring.", code: "OVER_TOTAL" };
  }
  await notifyTelegramUser(outcome.order.customerId, `<b>Tecsecure: pul qaytarildi</b>\nBuyurtma <code>${escapeTelegramHtml(outcome.order.reference)}</code>: ${escapeTelegramHtml(formatMinor(asked, "UZS"))}.`);
  return { ok: true };
}

export type OpenPartRefund = PartRefundDue & { reference: string; customerName: string; shopName: string | null; reason: string | null; totalMinor: number | null; paymentMethod: string };

/**
 * The staff queue: part refunds still owed on orders that stay paid, oldest first. The open entries are picked
 * in the database before any limit, so closed ones never push an open one out of the list.
 */
export async function openPartRefundQueue(): Promise<OpenPartRefund[]> {
  const open = await prisma.$queryRaw<{ id: string }[]>`
    SELECT a."id" FROM "AuditLog" a
    JOIN "Order" o ON o."id" = a."metadata"->>'orderId'
    WHERE a."action" = ${PART_REFUND_DUE} AND o."paymentStatus" = 'PAID'
      AND NOT EXISTS (SELECT 1 FROM "AuditLog" r WHERE r."action" = ${PART_REFUNDED} AND r."entity" = a."entity" AND r."entityId" = a."entityId")
    ORDER BY a."createdAt" ASC
    LIMIT 500`;
  if (open.length === 0) return [];
  const rows = await prisma.auditLog.findMany({ where: { id: { in: open.map(row => row.id) } }, orderBy: { createdAt: "asc" }, select: { id: true, entity: true, entityId: true, metadata: true, createdAt: true } });
  const due = rows.flatMap(row => {
    const meta = partRefundMeta(row.metadata);
    const reason = row.metadata && typeof row.metadata === "object" && typeof (row.metadata as Record<string, unknown>).reason === "string" ? String((row.metadata as Record<string, unknown>).reason) : null;
    return row.entityId && meta.orderId ? [{ id: row.id, entity: row.entity, entityId: row.entityId, orderId: meta.orderId, amountMinor: meta.amountMinor, shopName: meta.shopName, reason, createdAt: row.createdAt }] : [];
  });
  const orders = await prisma.order.findMany({ where: { id: { in: [...new Set(due.map(entry => entry.orderId))] } }, select: { id: true, reference: true, paymentStatus: true, paymentMethod: true, totalMinor: true, customer: { select: { name: true } } } });
  const byId = new Map(orders.map(order => [order.id, order]));
  // The same rule as the query, kept in code too (and tested): one entry per part, only while the order is paid.
  return openPartRefunds(due, [], id => byId.get(id)?.paymentStatus === "PAID").map(entry => {
    const order = byId.get(entry.orderId)!;
    return { ...entry, reference: order.reference, customerName: order.customer.name, totalMinor: order.totalMinor, paymentMethod: order.paymentMethod };
  });
}

/** The newest refusal reason for each of these orders, for the buyer's own order list. */
export async function receiptRefusals(orderIds: string[]): Promise<Map<string, string>> {
  if (orderIds.length === 0) return new Map();
  const rows = await prisma.auditLog.findMany({ where: { action: PROOF_REJECTED, entity: "Order", entityId: { in: orderIds } }, orderBy: { createdAt: "desc" }, select: { entityId: true, metadata: true } });
  const reasons = new Map<string, string>();
  for (const row of rows) {
    const reason = row.metadata && typeof row.metadata === "object" ? (row.metadata as Record<string, unknown>).reason : null;
    if (row.entityId && typeof reason === "string" && !reasons.has(row.entityId)) reasons.set(row.entityId, reason.slice(0, 300));
  }
  return reasons;
}
