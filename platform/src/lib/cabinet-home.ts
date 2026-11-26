/**
 * The cabinet home's rules: what waits on the customer and in which order, and where an order stands on the
 * four-step line. Pure, so it is tested alone.
 */
export type AttentionKind = "invoiceOverdue" | "orderUnpaid" | "receiptRejected" | "invoiceUnpaid" | "quoteWaiting";

/** Most urgent first: an overdue payment, an unpaid order, a refused receipt, an unpaid invoice, a quote to answer. */
export const attentionRank: Record<AttentionKind, number> = { invoiceOverdue: 0, orderUnpaid: 1, receiptRejected: 2, invoiceUnpaid: 3, quoteWaiting: 4 };

export type AttentionItem = { kind: AttentionKind; key: string; subject: string; href: string; at: Date | string };

/** The few things waiting on the customer: by urgency, the older first within one kind, one row per record. */
export function pickAttention(items: AttentionItem[], limit = 3): AttentionItem[] {
  const seen = new Set<string>();
  return [...items]
    .sort((a, b) => attentionRank[a.kind] - attentionRank[b.kind] || new Date(a.at).getTime() - new Date(b.at).getTime())
    .filter(item => (seen.has(item.key) ? false : (seen.add(item.key), true)))
    .slice(0, limit);
}

/**
 * What an open invoice asks of the customer, judged by its newest payment report. A report still being checked
 * asks nothing; an overdue invoice stays overdue even when its receipt was refused.
 */
export function invoiceAttention(status: string, latestPayment: string | null | undefined): AttentionKind | null {
  if (latestPayment === "PENDING") return null;
  if (status === "OVERDUE") return "invoiceOverdue";
  if (latestPayment === "REJECTED") return "receiptRejected";
  if (status === "ISSUED" || status === "PARTIALLY_PAID") return "invoiceUnpaid";
  return null;
}

export const ACTIVE_ORDER_STATUSES = ["NEW", "CONFIRMED", "PREPARING", "SHIPPED"] as const;
export const OPEN_REQUEST_STATUSES = ["NEW", "UNDER_REVIEW", "CONTACTED", "INSPECTION_REQUIRED", "QUOTATION_SENT", "APPROVED", "IN_PROGRESS"] as const;

/** Received · Ready · On the way · Delivered. -1 for a cancelled order, which has no place on the line. */
export function orderStep(status: string): number {
  switch (status) {
    case "NEW": case "CONFIRMED": return 0;
    case "PREPARING": return 1;
    case "SHIPPED": return 2;
    case "DELIVERED": return 3;
    default: return -1;
  }
}
