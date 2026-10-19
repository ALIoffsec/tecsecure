export const TEC_PRICE_UZS = 10_000;
export const TEC_PRICE_MINOR = TEC_PRICE_UZS * 100;

export function tecPurchaseCostMinor(amountTec: number): number {
  return amountTec * TEC_PRICE_MINOR;
}
