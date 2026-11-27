/**
 * The buyer's "My orders": which tab an order belongs to, the one next step it asks for, and what the buyer may
 * do with it. Pure, so it is tested alone; the words are in customer-orders-copy.ts.
 */
export type OrderFilter = "active" | "delivered" | "cancelled" | "all";
export const ORDER_FILTERS: OrderFilter[] = ["all", "active", "delivered", "cancelled"];
export const ORDERS_PAGE = 20;
export const ORDERS_MAX_PAGES = 10;

/** A cancelled order whose money question is still open stays in "Active" until it is settled. */
export const MONEY_OPEN_STATUSES = ["AWAITING_CONFIRMATION", "REFUND_DUE"] as const;
const LIVE = ["NEW", "CONFIRMED", "PREPARING", "SHIPPED"];

type OrderState = { status: string; paymentMethod: string; paymentStatus: string };

export function orderFilterOf(order: OrderState): Exclude<OrderFilter, "all"> {
  if (LIVE.includes(order.status)) return "active";
  if (order.status === "CANCELLED") return (MONEY_OPEN_STATUSES as readonly string[]).includes(order.paymentStatus) ? "active" : "cancelled";
  return "delivered";
}

/** The Prisma filter for one tab (kept next to `orderFilterOf`, which says the same in code). */
export function orderFilterWhere(filter: OrderFilter): Record<string, unknown> {
  if (filter === "active") return { OR: [{ status: { in: LIVE } }, { status: "CANCELLED", paymentStatus: { in: [...MONEY_OPEN_STATUSES] } }] };
  if (filter === "delivered") return { status: "DELIVERED" };
  if (filter === "cancelled") return { status: "CANCELLED", paymentStatus: { notIn: [...MONEY_OPEN_STATUSES] } };
  return {};
}

/** "Active" by default; when nothing is active but other orders exist, "All". */
export function defaultOrderFilter(counts: Record<Exclude<OrderFilter, "all">, number>): OrderFilter {
  return counts.active > 0 ? "active" : "all";
}

export function parseOrderFilter(raw: string | undefined, counts: Record<Exclude<OrderFilter, "all">, number>): OrderFilter {
  return ORDER_FILTERS.includes(raw as OrderFilter) ? raw as OrderFilter : defaultOrderFilter(counts);
}

export type NextStep =
  | "payPayme" | "payBank" | "reupload" | "checking" | "refundDue" | "refunded"
  | "cancelRequested" | "received" | "preparing" | "onTheWay" | "delivered" | "cancelled";

/** The one thing to say at the top of an order page: what happens next, or what the buyer has to do. */
export function orderNextStep(order: OrderState & { cancelRequested?: boolean }): NextStep {
  if (order.status === "CANCELLED") {
    if (order.paymentStatus === "AWAITING_CONFIRMATION") return "checking";
    if (order.paymentStatus === "REFUND_DUE") return "refundDue";
    if (order.paymentStatus === "REFUNDED") return "refunded";
    return "cancelled";
  }
  if (order.paymentStatus === "AWAITING_PAYMENT") {
    if (order.paymentMethod === "ONLINE_PAYME") return "payPayme";
    if (order.paymentMethod === "BANK_TRANSFER") return "payBank";
    if (order.paymentMethod === "CARD_TRANSFER") return "reupload";
  }
  if (order.paymentStatus === "AWAITING_CONFIRMATION") return "checking";
  if (order.paymentStatus === "REFUND_DUE") return "refundDue";
  // A request is only news while staff have not moved the order on.
  if (order.cancelRequested && (order.status === "NEW" || order.status === "CONFIRMED")) return "cancelRequested";
  if (order.status === "NEW") return "received";
  if (order.status === "CONFIRMED" || order.status === "PREPARING") return "preparing";
  if (order.status === "SHIPPED") return "onTheWay";
  return "delivered";
}

/** The one button a list row carries; everything else opens the order page. */
export function rowAction(step: NextStep): "pay" | "invoice" | "reupload" | null {
  return step === "payPayme" ? "pay" : step === "payBank" ? "invoice" : step === "reupload" ? "reupload" : null;
}

type CancelState = { status: string; paymentMethod: string; paymentStatus: string };

/**
 * A bank or card transfer may already be on its way while the order still waits for it; only staff, who can
 * look at the account, may cancel such an order. The buyer asks instead.
 */
function transferMayBeOnItsWay(order: CancelState): boolean {
  return order.paymentStatus === "AWAITING_PAYMENT" && (order.paymentMethod === "BANK_TRANSFER" || order.paymentMethod === "CARD_TRANSFER");
}

/** The buyer cancels by themselves only before anyone started: the order and every shop part still new. */
export function canCustomerCancel(order: CancelState, parts: { status: string }[]): boolean {
  return order.status === "NEW" && parts.every(part => part.status === "NEW") && !transferMayBeOnItsWay(order);
}

/** Once accepted (or while a transfer may be on its way), the buyer asks staff to cancel instead, once. */
export function canAskToCancel(order: CancelState, parts: { status: string }[], alreadyAsked: boolean): boolean {
  if (alreadyAsked) return false;
  if (order.status === "CONFIRMED") return true;
  return order.status === "NEW" && !canCustomerCancel(order, parts);
}

/** The history note a buyer's own cancellation leaves; the page shows it in the visitor's language. */
export const SELF_CANCEL_NOTE = "Mijoz bekor qildi";
export function selfCancelReason(note: string | null): { self: boolean; reason: string | null } {
  if (!note) return { self: false, reason: null };
  if (note === SELF_CANCEL_NOTE) return { self: true, reason: null };
  if (note.startsWith(`${SELF_CANCEL_NOTE}: `)) return { self: true, reason: note.slice(SELF_CANCEL_NOTE.length + 2) || null };
  return { self: false, reason: note };
}

/** "First product" and how many other lines there are. */
export function orderTitle(items: { name: string }[]): { first: string | null; more: number } {
  return { first: items[0]?.name ?? null, more: Math.max(0, items.length - 1) };
}

/** Payme return: how many times the page looks again, and how often. */
export const PAYME_RECHECK = { times: 10, everyMs: 3000 } as const;

export const ORDER_TRACK = ["NEW", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"] as const;

/** A real move from one status to another (a shop note or a dispute note repeats the status or has no "from"). */
export function isStatusMove(entry: { fromStatus: string | null; toStatus: string }): boolean {
  return entry.fromStatus !== null && entry.fromStatus !== entry.toStatus;
}

/** The date each step was first reached (the order's own date for the first), and where the order is now. */
export function orderTrack(createdAt: Date | string, history: { fromStatus: string | null; toStatus: string; createdAt: Date | string }[], status: string) {
  const moves = history.filter(isStatusMove);
  return {
    dates: ORDER_TRACK.map(code => code === "NEW" ? createdAt : moves.find(entry => entry.toStatus === code)?.createdAt ?? null),
    current: (ORDER_TRACK as readonly string[]).indexOf(status)
  };
}
