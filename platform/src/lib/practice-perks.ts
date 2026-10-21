export const labDiscountPercent: Record<string, number> = { basic: 0, standard: 25, expert: 100 };
export const examDiscountPercent: Record<string, number> = { basic: 0, standard: 0, expert: 50 };

function discounted(price: number, percent: number) {
  return Math.max(0, Math.ceil(price * (100 - percent) / 100));
}

export const labPriceFor = (planKey: string | null, priceTec: number) => discounted(priceTec, labDiscountPercent[planKey ?? ""] ?? 0);
export const examPriceFor = (planKey: string | null, feeTec: number) => discounted(feeTec, examDiscountPercent[planKey ?? ""] ?? 0);
