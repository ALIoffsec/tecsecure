/**
 * The buyer's "My requests": which group a request (or a project that came without one) belongs to, where it
 * stands on its line, what it asks of the buyer, and the sums of its quote and invoice. Pure, so it is tested
 * alone; words are in customer-requests-copy.ts.
 */
export type RequestGroup = "waiting" | "active" | "done";

type QuoteLike = { status: string; validUntil: Date | string | null; items: { quantity: number; unitPriceMinor: number; discountMinor: number }[] };
type PaymentLike = { status: string; amountMinor: number };
type InvoiceLike = { status: string; items: { quantity: number; unitPriceMinor: number; taxMinor: number; discountMinor: number }[]; payments: PaymentLike[] };

const DONE_REQUEST = ["COMPLETED", "REJECTED", "CANCELLED"];
const DONE_PROJECT = ["COMPLETED", "CANCELLED"];
const PAYABLE = ["ISSUED", "PARTIALLY_PAID", "OVERDUE"];

export function quoteTotalMinor(items: QuoteLike["items"]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPriceMinor - item.discountMinor, 0);
}

/** Paid means verified; a reported payment is "being checked" on its own, never counted as paid. */
export function invoiceSums(invoice: InvoiceLike): { totalMinor: number; paidMinor: number; checkingMinor: number; leftMinor: number } {
  const totalMinor = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPriceMinor + item.taxMinor - item.discountMinor, 0);
  const paidMinor = invoice.payments.filter(payment => payment.status === "VERIFIED").reduce((sum, payment) => sum + payment.amountMinor, 0);
  const checkingMinor = invoice.payments.filter(payment => payment.status === "PENDING").reduce((sum, payment) => sum + payment.amountMinor, 0);
  return { totalMinor, paidMinor, checkingMinor, leftMinor: Math.max(0, totalMinor - paidMinor - checkingMinor) };
}

export function quoteExpired(quote: Pick<QuoteLike, "validUntil">, now = new Date()): boolean {
  return Boolean(quote.validUntil && new Date(quote.validUntil).getTime() < now.getTime());
}

/** The buyer must act: a quote to answer, or an open invoice with money still left to report. */
export function waitsOnCustomer(quote: QuoteLike | null, invoice: InvoiceLike | null): boolean {
  if (quote?.status === "ISSUED") return true;
  return Boolean(invoice && PAYABLE.includes(invoice.status) && invoiceSums(invoice).leftMinor > 0);
}

export function requestGroup(item: { requestStatus: string | null; projectStatus: string | null; quote: QuoteLike | null; invoice: InvoiceLike | null }): RequestGroup {
  if (waitsOnCustomer(item.quote, item.invoice)) return "waiting";
  const requestDone = item.requestStatus ? DONE_REQUEST.includes(item.requestStatus) : true;
  const projectDone = item.projectStatus ? DONE_PROJECT.includes(item.projectStatus) : true;
  const closed = item.requestStatus === "REJECTED" || item.requestStatus === "CANCELLED" || item.projectStatus === "COMPLETED";
  return (requestDone && projectDone) || closed ? "done" : "active";
}

/** Sent · Under review · Quote · Work in progress · Done. Contact and site visit are part of "under review". */
export const REQUEST_STAGES = ["sent", "review", "quote", "work", "done"] as const;
const stageOf: Record<string, number> = { NEW: 0, UNDER_REVIEW: 1, CONTACTED: 1, INSPECTION_REQUIRED: 1, QUOTATION_SENT: 2, APPROVED: 3, IN_PROGRESS: 3, COMPLETED: 4 };

/**
 * Where a request stands, and the real date each stage was first reached. A linked project moves the line on:
 * a quote counts as stage 3, an accepted one or work started as stage 4. Rejected or cancelled: -1.
 */
export function requestTrack(input: {
  status: string; createdAt: Date | string; history: { toStatus: string; createdAt: Date | string }[];
  projectStatus?: string | null; firstQuoteAt?: Date | string | null;
}): { current: number; dates: (Date | string | null)[] } {
  const dates: (Date | string | null)[] = REQUEST_STAGES.map(() => null);
  dates[0] = input.createdAt;
  for (const entry of input.history) {
    const stage = stageOf[entry.toStatus];
    if (stage !== undefined && stage > 0 && !dates[stage]) dates[stage] = entry.createdAt;
  }
  if (!dates[2] && input.firstQuoteAt) dates[2] = input.firstQuoteAt;
  if (input.status === "REJECTED" || input.status === "CANCELLED") return { current: -1, dates };
  let current = stageOf[input.status] ?? 0;
  if (input.projectStatus === "QUOTED") current = Math.max(current, 2);
  if (input.projectStatus === "APPROVED" || input.projectStatus === "IN_PROGRESS") current = Math.max(current, 3);
  if (input.projectStatus === "COMPLETED") current = 4;
  return { current, dates };
}

/** A project that came without a request (asked from the product cart): Price request · Quote · Work · Done. */
export const PROJECT_STAGES = ["asked", "quote", "work", "done"] as const;
export function projectTrack(status: string, createdAt: Date | string, firstQuoteAt: Date | string | null): { current: number; dates: (Date | string | null)[] } {
  const current = status === "QUOTED" ? 1 : status === "APPROVED" || status === "IN_PROGRESS" ? 2 : status === "COMPLETED" ? 3 : status === "CANCELLED" ? -1 : 0;
  return { current, dates: [createdAt, firstQuoteAt, null, null] };
}

/** The buyer cancels a request only before the work was agreed on. */
export const CUSTOMER_CANCELLABLE = ["NEW", "UNDER_REVIEW", "CONTACTED", "INSPECTION_REQUIRED", "QUOTATION_SENT"] as const;
export function canCancelRequest(status: string): boolean {
  return (CUSTOMER_CANCELLABLE as readonly string[]).includes(status);
}

export const QUOTE_REASON = { min: 3, max: 500 } as const;
