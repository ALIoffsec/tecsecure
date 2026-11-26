/** Wallet limits, as pure functions so they are tested without a database. */

/** The balance column is a 32-bit integer of tiyin. */
export const MAX_WALLET_MINOR = 2_147_483_647;
/** Requests waiting for staff at once, per customer. */
export const MAX_PENDING_REQUESTS = 5;

/** How much may still be asked to withdraw: the balance less what is already waiting to be paid out. */
export function withdrawalRoom(balanceMinor: number, pendingWithdrawalsMinor: number): number {
  return Math.max(0, balanceMinor - pendingWithdrawalsMinor);
}

/** True when adding this amount would not fit in the balance column. */
export function exceedsWalletLimit(balanceMinor: number, addMinor: number): boolean {
  return addMinor > 0 && balanceMinor + addMinor > MAX_WALLET_MINOR;
}

/** Statuses of a request that still holds its receipt (a rejected or cancelled one frees it). */
export const PROOF_HOLDING_STATUSES = ["PENDING", "APPROVED"] as const;

export const walletStatusLabels = {
  uz: { PENDING: "Ko‘rib chiqilmoqda", APPROVED: "Tasdiqlandi", REJECTED: "Rad etildi", CANCELLED: "Bekor qilindi" },
  ru: { PENDING: "На рассмотрении", APPROVED: "Подтверждено", REJECTED: "Отклонено", CANCELLED: "Отменено" },
  en: { PENDING: "Under review", APPROVED: "Approved", REJECTED: "Rejected", CANCELLED: "Cancelled" }
} as const;
