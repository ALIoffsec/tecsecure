/**
 * The wallet page's ledger: which way each kind of entry moves the money, its name in words, and the filter
 * tabs. Pure, so it is tested alone.
 */
export type LedgerFilter = "all" | "in" | "out" | "tec";
export const LEDGER_FILTERS: LedgerFilter[] = ["all", "in", "out", "tec"];

const IN = ["DEPOSIT", "ORDER_REFUND"];
const TEC = ["TEC_PURCHASE"];

/** "+" for money that came in, "−" for money that went out. A refused or cancelled request moved nothing. */
export function ledgerSign(entry: { kind: string; status: string }): "+" | "−" | "" {
  if (entry.status === "REJECTED" || entry.status === "CANCELLED") return "";
  return IN.includes(entry.kind) ? "+" : "−";
}

export function ledgerMatches(entry: { kind: string }, filter: LedgerFilter): boolean {
  if (filter === "all") return true;
  if (filter === "tec") return TEC.includes(entry.kind);
  if (filter === "in") return IN.includes(entry.kind);
  return !IN.includes(entry.kind);
}

/** What may still be withdrawn: the balance less withdrawals already waiting. */
export function withdrawable(balanceMinor: number, entries: { kind: string; status: string; amountMinor: number }[]): number {
  const waiting = entries.filter(entry => entry.kind === "WITHDRAWAL" && entry.status === "PENDING").reduce((sum, entry) => sum + entry.amountMinor, 0);
  return Math.max(0, balanceMinor - waiting);
}

/** How much a purchase still lacks, for "{amount} more needed — top up". */
export function shortfallMinor(balanceMinor: number, costMinor: number): number {
  return Math.max(0, costMinor - balanceMinor);
}

export const ledgerNames: Record<"uz" | "ru" | "en", Record<string, string>> = {
  uz: { DEPOSIT: "Hamyonni to‘ldirish", WITHDRAWAL: "Pul yechish", TEC_PURCHASE: "TEC sotib olish", ORDER_PAYMENT: "Buyurtma uchun to‘lov", ORDER_REFUND: "Buyurtma puli qaytarildi", LEARNING_SUBSCRIPTION: "Ta’lim obunasi", PROMOTION: "Do‘kon reklamasi", OTHER: "Boshqa harakat" },
  ru: { DEPOSIT: "Пополнение кошелька", WITHDRAWAL: "Вывод денег", TEC_PURCHASE: "Покупка TEC", ORDER_PAYMENT: "Оплата заказа", ORDER_REFUND: "Возврат за заказ", LEARNING_SUBSCRIPTION: "Подписка на обучение", PROMOTION: "Реклама магазина", OTHER: "Другая операция" },
  en: { DEPOSIT: "Wallet top-up", WITHDRAWAL: "Withdrawal", TEC_PURCHASE: "TEC purchase", ORDER_PAYMENT: "Order payment", ORDER_REFUND: "Order refund", LEARNING_SUBSCRIPTION: "Learning plan", PROMOTION: "Shop promotion", OTHER: "Other entry" }
};
