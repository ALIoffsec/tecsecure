export const TEC_PRICE_UZS = 4_990;
export const TEC_PRICE_MINOR = TEC_PRICE_UZS * 100;

export const tecPacks = [
  { id: "tec-1", amountTec: 1, discountPercent: 0 },
  { id: "tec-3", amountTec: 3, discountPercent: 0 },
  { id: "tec-5", amountTec: 5, discountPercent: 0 },
  { id: "tec-10", amountTec: 10, discountPercent: 0 },
  { id: "tec-25", amountTec: 25, discountPercent: 3 },
  { id: "tec-50", amountTec: 50, discountPercent: 8 },
  { id: "tec-100", amountTec: 100, discountPercent: 12 },
  { id: "tec-250", amountTec: 250, discountPercent: 18 },
  { id: "tec-500", amountTec: 500, discountPercent: 25 }
] as const;

export type TecPackId = typeof tecPacks[number]["id"];

export function getTecPack(id: string) {
  return tecPacks.find((pack) => pack.id === id);
}

export function tecPurchaseCostMinor(amountTec: number, discountPercent = 0): number {
  if (!Number.isInteger(amountTec) || amountTec < 1 || amountTec > 500) {
    throw new RangeError("TEC amount must be a whole number between 1 and 500.");
  }
  if (!Number.isInteger(discountPercent) || discountPercent < 0 || discountPercent > 25) {
    throw new RangeError("TEC pack discount must be between 0 and 25 percent.");
  }
  return Math.round(amountTec * TEC_PRICE_MINOR * (100 - discountPercent) / 100);
}
