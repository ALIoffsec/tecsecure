import { z } from "zod";
import type { Locale } from "./messages";

/** The fourteen top-level regions of Uzbekistan, in the order people expect to see them. */
export const regionCodes = [
  "TASHKENT_CITY", "TASHKENT_REGION", "ANDIJAN", "BUKHARA", "FERGANA", "JIZZAKH", "KHOREZM",
  "NAMANGAN", "NAVOI", "KASHKADARYA", "KARAKALPAKSTAN", "SAMARKAND", "SYRDARYA", "SURKHANDARYA"
] as const;
export type RegionCode = (typeof regionCodes)[number];

export const regionNames: Record<Locale, Record<RegionCode, string>> = {
  uz: {
    TASHKENT_CITY: "Toshkent shahri", TASHKENT_REGION: "Toshkent viloyati", ANDIJAN: "Andijon viloyati", BUKHARA: "Buxoro viloyati",
    FERGANA: "Farg‘ona viloyati", JIZZAKH: "Jizzax viloyati", KHOREZM: "Xorazm viloyati", NAMANGAN: "Namangan viloyati",
    NAVOI: "Navoiy viloyati", KASHKADARYA: "Qashqadaryo viloyati", KARAKALPAKSTAN: "Qoraqalpog‘iston Respublikasi",
    SAMARKAND: "Samarqand viloyati", SYRDARYA: "Sirdaryo viloyati", SURKHANDARYA: "Surxondaryo viloyati"
  },
  ru: {
    TASHKENT_CITY: "г. Ташкент", TASHKENT_REGION: "Ташкентская область", ANDIJAN: "Андижанская область", BUKHARA: "Бухарская область",
    FERGANA: "Ферганская область", JIZZAKH: "Джизакская область", KHOREZM: "Хорезмская область", NAMANGAN: "Наманганская область",
    NAVOI: "Навоийская область", KASHKADARYA: "Кашкадарьинская область", KARAKALPAKSTAN: "Республика Каракалпакстан",
    SAMARKAND: "Самаркандская область", SYRDARYA: "Сырдарьинская область", SURKHANDARYA: "Сурхандарьинская область"
  },
  en: {
    TASHKENT_CITY: "Tashkent city", TASHKENT_REGION: "Tashkent region", ANDIJAN: "Andijan region", BUKHARA: "Bukhara region",
    FERGANA: "Fergana region", JIZZAKH: "Jizzakh region", KHOREZM: "Khorezm region", NAMANGAN: "Namangan region",
    NAVOI: "Navoi region", KASHKADARYA: "Kashkadarya region", KARAKALPAKSTAN: "Republic of Karakalpakstan",
    SAMARKAND: "Samarkand region", SYRDARYA: "Syrdarya region", SURKHANDARYA: "Surkhandarya region"
  }
};

/** EXPRESS: a same-city courier such as Yandex. COURIER: a parcel service or the post. PICKUP: the customer collects it. */
export const deliveryMethods = ["EXPRESS", "COURIER", "PICKUP"] as const;
export type DeliveryMethod = (typeof deliveryMethods)[number];

const days = z.tuple([z.number().int().min(0).max(30), z.number().int().min(0).max(30)]).refine(([min, max]) => min <= max);
const price = z.number().int().min(0).max(100_000_000).nullable();
const regionTariff = z.object({
  express: price.default(null),
  expressDays: days.default([0, 1]),
  courier: price.default(null),
  courierDays: days.default([1, 3])
});
export type RegionTariff = z.infer<typeof regionTariff>;

/** Prices are whole so'm, as staff type them. Null means the method is not offered there. */
export const deliveryTariffsSchema = z.object({
  regions: z.partialRecord(z.enum(regionCodes), regionTariff).default({}),
  pickup: z.object({ enabled: z.boolean().default(false), address: z.string().trim().max(300).default("") }).default({ enabled: false, address: "" }),
  freeFrom: z.number().int().min(0).max(10_000_000_000).nullable().default(null)
});
export type DeliveryTariffs = z.infer<typeof deliveryTariffsSchema>;
export const emptyTariffs: DeliveryTariffs = { regions: {}, pickup: { enabled: false, address: "" }, freeFrom: null };

export function parseTariffs(raw: string | null | undefined): DeliveryTariffs {
  if (!raw) return emptyTariffs;
  try {
    const parsed = deliveryTariffsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : emptyTariffs;
  } catch {
    return emptyTariffs;
  }
}

export type DeliveryOption = { method: DeliveryMethod; feeMinor: number; days: [number, number]; free: boolean };

/**
 * The ways an order can reach a region, cheapest first, with the fee in minor units (tiyin).
 * `itemsMinor` is the goods total in so'm; when it reaches the free-delivery threshold, couriers cost nothing.
 */
export function deliveryOptions(tariffs: DeliveryTariffs, region: RegionCode, itemsMinor: number | null): DeliveryOption[] {
  const row = tariffs.regions[region];
  const free = tariffs.freeFrom !== null && itemsMinor !== null && itemsMinor >= tariffs.freeFrom * 100;
  const options: DeliveryOption[] = [];
  if (row?.express != null) options.push({ method: "EXPRESS", feeMinor: free ? 0 : row.express * 100, days: row.expressDays, free });
  if (row?.courier != null) options.push({ method: "COURIER", feeMinor: free ? 0 : row.courier * 100, days: row.courierDays, free });
  if (tariffs.pickup.enabled) options.push({ method: "PICKUP", feeMinor: 0, days: [0, 1], free: false });
  return options;
}

/** True once staff have priced at least one way to deliver somewhere. */
export function tariffsConfigured(tariffs: DeliveryTariffs): boolean {
  return tariffs.pickup.enabled || Object.values(tariffs.regions).some(row => row && (row.express !== null || row.courier !== null));
}

/** "today", "1–3 days" and so on, in the visitor's language. */
export function deliveryTime(daysRange: [number, number], locale: Locale): string {
  const [min, max] = daysRange;
  const words = {
    uz: { today: "bugun", tomorrow: "ertaga", todayOrTomorrow: "bugun yoki ertaga", days: (a: string) => `${a} kun` },
    ru: { today: "сегодня", tomorrow: "завтра", todayOrTomorrow: "сегодня или завтра", days: (a: string) => `${a} дн.` },
    en: { today: "today", tomorrow: "tomorrow", todayOrTomorrow: "today or tomorrow", days: (a: string) => `${a} days` }
  }[locale];
  if (max === 0) return words.today;
  if (min === 0 && max === 1) return words.todayOrTomorrow;
  if (min === 1 && max === 1) return words.tomorrow;
  return words.days(min === max ? String(min) : `${min}–${max}`);
}

/** VAT is 12% in Uzbekistan and our prices already contain it; this is the part of a total that is VAT. */
export const VAT_PERCENT = 12;
export function vatPart(totalMinor: number): number {
  return Math.round((totalMinor * VAT_PERCENT) / (100 + VAT_PERCENT) / 100) * 100;
}
