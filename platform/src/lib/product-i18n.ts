import type { Locale } from "./messages";

/**
 * A product's own columns hold its Uzbek text. Russian and English live in `translations`,
 * and any field missing there falls back to Uzbek rather than showing nothing.
 */
export type ProductVariant = { name: string; description: string; specifications: unknown; compatibility: unknown };
export type ProductVariants = Record<Locale, ProductVariant>;
type ProductSource = { name: string; description: string; specifications?: unknown; compatibility?: unknown; translations?: unknown };

const locales: Locale[] = ["uz", "ru", "en"];

export function perLocale<T>(pick: (locale: Locale) => T): Record<Locale, T> {
  return { uz: pick("uz"), ru: pick("ru"), en: pick("en") };
}

export function productVariants(product: ProductSource): ProductVariants {
  const stored = product.translations && typeof product.translations === "object" ? product.translations as Record<string, Partial<ProductVariant> | undefined> : {};
  return Object.fromEntries(locales.map((locale): [Locale, ProductVariant] => {
    const own = locale === "uz" ? undefined : stored[locale];
    return [locale, {
      name: own?.name || product.name,
      description: own?.description || product.description,
      specifications: own?.specifications ?? product.specifications ?? null,
      compatibility: own?.compatibility ?? product.compatibility ?? null
    }];
  })) as ProductVariants;
}

const categoryNames: Record<string, { ru: string; en: string }> = {
  "Kameralar": { ru: "Камеры", en: "Cameras" },
  "Videoregistratorlar": { ru: "Видеорегистраторы", en: "Video recorders" },
  "Videoanalitika": { ru: "Видеоаналитика", en: "Video analytics" },
  "Domofonlar": { ru: "Домофоны", en: "Intercoms" },
  "Face ID va biometrika": { ru: "Face ID и биометрия", en: "Face ID and biometrics" },
  "Turniketlar": { ru: "Турникеты", en: "Turnstiles" },
  "Kirish nazorati": { ru: "Контроль доступа", en: "Access control" },
  "Xavfsizlik va yong‘in signalizatsiyasi": { ru: "Охранно-пожарная сигнализация", en: "Security and fire alarms" },
  "Kommutatorlar": { ru: "Коммутаторы", en: "Switches" },
  "Tarmoq uskunalari": { ru: "Сетевое оборудование", en: "Network equipment" },
  "Kabel": { ru: "Кабель", en: "Cable" },
  "Monitorlar": { ru: "Мониторы", en: "Monitors" },
  "Yong‘inga qarshi jihozlar": { ru: "Противопожарное оборудование", en: "Firefighting equipment" },
  "Videokuzatuv uskunalari": { ru: "Оборудование для видеонаблюдения", en: "CCTV equipment" },
  "Aqlli uy": { ru: "Умный дом", en: "Smart home" },
  "Parking va shlagbaumlar": { ru: "Парковка и шлагбаумы", en: "Parking and barriers" },
  "Ogohlantirish tizimlari": { ru: "Системы оповещения", en: "Public address systems" },
  "Energiya tizimlari": { ru: "Энергосистемы", en: "Power systems" }
};

/** A category the table does not know keeps the name staff gave it. */
export function categoryName(name: string, locale: Locale): string {
  return locale === "uz" ? name : categoryNames[name]?.[locale] ?? name;
}
