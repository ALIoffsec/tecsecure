import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Payme Merchant API. The card number is typed on Payme's own page, so it never reaches this server;
 * Payme then calls /api/payments/payme to ask about the order and to report what happened.
 * Everything here stays dormant until PAYME_MERCHANT_ID and PAYME_KEY are set.
 */
const TIMEOUT_MS = 43_200_000;

export const paymeStates = { created: 1, performed: 2, cancelled: -1, cancelledAfterPerform: -2 } as const;

export function paymeConfigured(): boolean {
  return Boolean(process.env.PAYME_MERCHANT_ID && process.env.PAYME_KEY);
}

function paymeHost(): string {
  return process.env.PAYME_TEST_MODE === "1" ? "https://test.paycom.uz" : "https://checkout.paycom.uz";
}

/** The page the customer is sent to. `a` is in tiyin, which is what totals are stored in. */
export function paymeCheckoutUrl(input: { merchantId: string; reference: string; amountMinor: number; locale: string; returnUrl: string; host?: string }): string {
  const params = `m=${input.merchantId};ac.order_id=${input.reference};a=${Math.round(input.amountMinor)};l=${input.locale === "en" ? "en" : input.locale === "ru" ? "ru" : "uz"};c=${input.returnUrl}`;
  return `${input.host ?? paymeHost()}/${Buffer.from(params).toString("base64")}`;
}

export function paymeAuthorized(header: string | null, key: string | undefined): boolean {
  if (!key || !header?.startsWith("Basic ")) return false;
  const given = Buffer.from(header.slice(6));
  const expected = Buffer.from(Buffer.from(`Paycom:${key}`).toString("base64"));
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export class PaymeError extends Error {
  constructor(readonly code: number, readonly ru: string, readonly uz: string, readonly en: string, readonly data?: string) {
    super(en);
  }
}

const orderNotFound = () => new PaymeError(-31050, "Заказ не найден", "Buyurtma topilmadi", "Order not found", "order_id");
const orderNotPayable = () => new PaymeError(-31051, "Заказ нельзя оплатить", "Buyurtmani to‘lab bo‘lmaydi", "This order cannot be paid", "order_id");
const orderBusy = () => new PaymeError(-31052, "Заказ уже ожидает оплаты", "Buyurtma allaqachon to‘lov kutmoqda", "This order already has a payment in progress", "order_id");
const wrongAmount = () => new PaymeError(-31001, "Неверная сумма", "Summa noto‘g‘ri", "Wrong amount");
const notFound = () => new PaymeError(-31003, "Транзакция не найдена", "Tranzaksiya topilmadi", "Transaction not found");
const cannotPerform = () => new PaymeError(-31008, "Операция невозможна", "Amalni bajarib bo‘lmaydi", "This operation cannot be performed");
const cannotCancel = () => new PaymeError(-31007, "Заказ выполнен, отмена невозможна", "Buyurtma yakunlangan, bekor qilib bo‘lmaydi", "The order is complete and cannot be cancelled");

type Params = { id?: string; time?: number; amount?: number; account?: { order_id?: string }; reason?: number; from?: number; to?: number };

async function payableOrder(params: Params) {
  const reference = params.account?.order_id;
  if (typeof reference !== "string") throw orderNotFound();
  const order = await prisma.order.findUnique({ where: { reference }, select: { id: true, reference: true, status: true, paymentMethod: true, paymentStatus: true, totalMinor: true, currency: true } });
  if (!order) throw orderNotFound();
  if (order.paymentMethod !== "ONLINE_PAYME" || order.paymentStatus !== "AWAITING_PAYMENT" || order.status === "CANCELLED" || order.currency !== "UZS") throw orderNotPayable();
  if (order.totalMinor === null || Number(params.amount) !== order.totalMinor) throw wrongAmount();
  return order;
}

const view = (tx: { id: string; state: number; reason: number | null; createTime: bigint; performTime: bigint; cancelTime: bigint }) => ({
  transaction: tx.id,
  state: tx.state,
  create_time: Number(tx.createTime),
  perform_time: Number(tx.performTime),
  cancel_time: Number(tx.cancelTime),
  reason: tx.reason
});

async function expire(id: string) {
  await prisma.paymeTransaction.update({ where: { id }, data: { state: paymeStates.cancelled, reason: 4, cancelTime: BigInt(Date.now()) } });
}

export async function handlePaymeMethod(method: string, params: Params): Promise<Record<string, unknown>> {
  switch (method) {
    case "CheckPerformTransaction":
      await payableOrder(params);
      return { allow: true };

    case "CreateTransaction": {
      const id = String(params.id ?? "");
      const existing = await prisma.paymeTransaction.findUnique({ where: { paymeId: id } });
      if (existing) {
        if (existing.state !== paymeStates.created) throw cannotPerform();
        if (Date.now() - Number(existing.createTime) > TIMEOUT_MS) { await expire(existing.id); throw cannotPerform(); }
        const { transaction, state, create_time } = view(existing);
        return { transaction, state, create_time };
      }
      const order = await payableOrder(params);
      const other = await prisma.paymeTransaction.findFirst({ where: { orderId: order.id, state: paymeStates.created } });
      if (other) {
        if (Date.now() - Number(other.createTime) <= TIMEOUT_MS) throw orderBusy();
        await expire(other.id);
      }
      const created = await prisma.paymeTransaction.create({
        data: { paymeId: id, orderId: order.id, amountMinor: Number(params.amount), paymeTime: BigInt(Number(params.time) || Date.now()), createTime: BigInt(Date.now()) }
      });
      const { transaction, state, create_time } = view(created);
      return { transaction, state, create_time };
    }

    case "PerformTransaction": {
      const tx = await prisma.paymeTransaction.findUnique({ where: { paymeId: String(params.id ?? "") } });
      if (!tx) throw notFound();
      if (tx.state === paymeStates.performed) {
        const { transaction, state, perform_time } = view(tx);
        return { transaction, state, perform_time };
      }
      if (tx.state !== paymeStates.created) throw cannotPerform();
      if (Date.now() - Number(tx.createTime) > TIMEOUT_MS) { await expire(tx.id); throw cannotPerform(); }
      const updated = await prisma.$transaction(async db => {
        const done = await db.paymeTransaction.update({ where: { id: tx.id }, data: { state: paymeStates.performed, performTime: BigInt(Date.now()) } });
        await db.order.update({ where: { id: tx.orderId }, data: { paymentStatus: "PAID", paymentReference: `Payme ${tx.paymeId}` } });
        await db.auditLog.create({ data: { action: "ORDER_PAYMENT_PAYME_PERFORMED", entity: "Order", entityId: tx.orderId } });
        return done;
      });
      const { transaction, state, perform_time } = view(updated);
      return { transaction, state, perform_time };
    }

    case "CancelTransaction": {
      const tx = await prisma.paymeTransaction.findUnique({ where: { paymeId: String(params.id ?? "") }, include: { order: { select: { status: true } } } });
      if (!tx) throw notFound();
      if (tx.state < 0) {
        const { transaction, state, cancel_time } = view(tx);
        return { transaction, state, cancel_time };
      }
      if (tx.state === paymeStates.performed && tx.order.status === "DELIVERED") throw cannotCancel();
      const after = tx.state === paymeStates.performed ? paymeStates.cancelledAfterPerform : paymeStates.cancelled;
      const updated = await prisma.$transaction(async db => {
        const done = await db.paymeTransaction.update({ where: { id: tx.id }, data: { state: after, reason: Number(params.reason) || null, cancelTime: BigInt(Date.now()) } });
        await db.order.update({ where: { id: tx.orderId }, data: { paymentStatus: after === paymeStates.cancelledAfterPerform ? "REFUNDED" : "AWAITING_PAYMENT" } });
        await db.auditLog.create({ data: { action: "ORDER_PAYMENT_PAYME_CANCELLED", entity: "Order", entityId: tx.orderId, metadata: { reason: Number(params.reason) || null } } });
        return done;
      });
      const { transaction, state, cancel_time } = view(updated);
      return { transaction, state, cancel_time };
    }

    case "CheckTransaction": {
      const tx = await prisma.paymeTransaction.findUnique({ where: { paymeId: String(params.id ?? "") } });
      if (!tx) throw notFound();
      return view(tx);
    }

    case "GetStatement": {
      const list = await prisma.paymeTransaction.findMany({
        where: { paymeTime: { gte: BigInt(Number(params.from) || 0), lte: BigInt(Number(params.to) || 0) } },
        include: { order: { select: { reference: true } } },
        orderBy: { paymeTime: "asc" }
      });
      return {
        transactions: list.map(tx => ({
          id: tx.paymeId, time: Number(tx.paymeTime), amount: tx.amountMinor, account: { order_id: tx.order.reference },
          create_time: Number(tx.createTime), perform_time: Number(tx.performTime), cancel_time: Number(tx.cancelTime),
          transaction: tx.id, state: tx.state, reason: tx.reason
        }))
      };
    }

    default:
      throw new PaymeError(-32601, "Метод не найден", "Metod topilmadi", "Method not found", method);
  }
}
