import { parseCbuRates, type CurrencyRates } from "./currency";
import { prisma } from "./prisma";

export { toUzsMinor } from "./currency";

const CBU_URL = "https://cbu.uz/uz/arkhiv-kursov-valyut/json/";
const STORED_KEY = "cbuRates";

/**
 * Today's Central Bank rates. The last good answer is kept in the database, so a slow or failing
 * cbu.uz never stops an order; null only if the site has never once reached it.
 */
export async function getExchangeRates(): Promise<CurrencyRates | null> {
  try {
    const response = await fetch(CBU_URL, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error(`cbu.uz answered ${response.status}`);
    const rates = parseCbuRates(await response.json());
    const value = JSON.stringify(rates);
    await prisma.siteSetting.upsert({ where: { key: STORED_KEY }, create: { key: STORED_KEY, value }, update: { value } }).catch(() => undefined);
    return rates;
  } catch (error) {
    console.error("Exchange rate lookup failed, using the stored rate", error instanceof Error ? error.message : "UnknownError");
    const stored = await prisma.siteSetting.findUnique({ where: { key: STORED_KEY }, select: { value: true } }).catch(() => null);
    if (!stored) return null;
    try { return JSON.parse(stored.value) as CurrencyRates; } catch { return null; }
  }
}
