/**
 * Quotes, invoices and payment reports: when a new quote may be issued, when an invoice may be made, and the
 * limits that keep amounts inside the database columns. Pure, so it is tested alone.
 */
export const INT_COLUMN_MAX = 2_147_483_647;

/** Invoices that count as "the" payable invoice of a project. A void one does not. */
export const LIVE_INVOICE_STATUSES = ["DRAFT", "ISSUED", "PARTIALLY_PAID", "OVERDUE", "PAID", "REFUNDED"] as const;
export const PAYABLE_INVOICE_STATUSES = ["ISSUED", "PARTIALLY_PAID", "OVERDUE"] as const;

type Quote = { id: string; status: string; version: number };

/**
 * A new quote replaces the open ones. Once the customer accepted one, a new version is still possible while no
 * invoice was made from it (the accepted one is then withdrawn too); after an invoice, it is refused.
 */
export function newQuoteDecision(quotes: Quote[], liveInvoices: number): { ok: true; withdraw: string[] } | { ok: false; reason: "INVOICE_EXISTS" } {
  if (liveInvoices > 0) return { ok: false, reason: "INVOICE_EXISTS" };
  return { ok: true, withdraw: quotes.filter(quote => quote.status === "ISSUED" || quote.status === "DRAFT" || quote.status === "ACCEPTED").map(quote => quote.id) };
}

/** An invoice comes only from the project's latest quote, once it is accepted, and only one per project. */
export function invoiceDecision(quote: Quote, latestVersion: number, liveInvoices: number): "OK" | "QUOTE_NOT_ACCEPTED" | "NOT_LATEST" | "INVOICE_EXISTS" {
  if (quote.status !== "ACCEPTED") return "QUOTE_NOT_ACCEPTED";
  if (quote.version !== latestVersion) return "NOT_LATEST";
  if (liveInvoices > 0) return "INVOICE_EXISTS";
  return "OK";
}

/** Every stored figure of a quote line fits its column, and the discount stays inside the line. */
export function quoteLineFits(item: { quantity: number; unitPriceMinor: number; discountMinor: number }): boolean {
  const line = item.quantity * item.unitPriceMinor;
  return item.unitPriceMinor <= INT_COLUMN_MAX && item.discountMinor <= INT_COLUMN_MAX && item.discountMinor <= line && Number.isSafeInteger(line);
}

/** What is still open on an invoice for a new payment report: total less what is reported or verified. */
export function invoiceRoom(totalMinor: number, committedMinor: number): number {
  return Math.max(0, totalMinor - committedMinor);
}

/** A cash payment has no bank document: the server gives it a reference. */
export function cashReference(random: string, now = new Date()): string {
  return `CASH-${now.getUTCFullYear()}-${random.toUpperCase()}`;
}

/** The project steps staff move by hand, each only from the step before; cancelling only before work starts. */
export const PROJECT_MOVES: Record<"IN_PROGRESS" | "COMPLETED" | "CANCELLED", readonly string[]> = {
  IN_PROGRESS: ["APPROVED"],
  COMPLETED: ["IN_PROGRESS"],
  CANCELLED: ["DRAFT", "QUOTE_REQUESTED", "QUOTED", "APPROVED"]
};
export function projectMoveAllowed(from: string, to: keyof typeof PROJECT_MOVES): boolean {
  return PROJECT_MOVES[to].includes(from);
}
