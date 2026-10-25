export const supportedCurrencies = ["UZS", "RUB", "USD"] as const;

export type SupportedCurrency = (typeof supportedCurrencies)[number];
export type CurrencyRates = {
  rates: Record<SupportedCurrency, number>;
  date: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseCbuRates(payload: unknown): CurrencyRates {
  if (!Array.isArray(payload)) throw new Error("Markaziy bank kurslari noto‘g‘ri formatda.");

  const rows = payload.filter(isRecord);
  const readRate = (currency: Exclude<SupportedCurrency, "UZS">) => {
    const row = rows.find((item) => item.Ccy === currency);
    const rate = Number(row?.Rate);
    const nominal = Number(row?.Nominal);
    if (!Number.isFinite(rate) || rate <= 0 || !Number.isFinite(nominal) || nominal <= 0) {
      throw new Error(`Markaziy bank ${currency} kursini bermadi.`);
    }
    return rate / nominal;
  };
  const usdRow = rows.find((item) => item.Ccy === "USD");
  const date = typeof usdRow?.Date === "string" ? usdRow.Date : "";
  if (!date) throw new Error("Markaziy bank kurs sanasini bermadi.");

  return {
    rates: {
      UZS: 1,
      RUB: readRate("RUB"),
      USD: readRate("USD"),
    },
    date,
  };
}

export function convertMinorAmount(
  amountMinor: number,
  from: string,
  to: SupportedCurrency,
  rates: CurrencyRates["rates"]
): number | null {
  if (!Number.isFinite(amountMinor)) return null;
  const source = from.toUpperCase();
  if (!supportedCurrencies.includes(source as SupportedCurrency)) return null;
  const sourceRate = rates[source as SupportedCurrency];
  const targetRate = rates[to];
  if (!Number.isFinite(sourceRate) || sourceRate <= 0 || !Number.isFinite(targetRate) || targetRate <= 0) {
    return null;
  }
  return (amountMinor / 100) * sourceRate / targetRate;
}
