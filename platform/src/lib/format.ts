// Deterministic formatting. Intl locale data differs between Node and browsers, and
// toLocaleString() uses the runtime's time zone; both break React hydration.
const TIME_ZONE = "Asia/Tashkent";
const NBSP = " ";
const currencyLabels: Record<string, Record<string, string>> = {
  UZS: { uz: "so‘m", ru: "сум", en: "UZS" },
  RUB: { uz: "rubl", ru: "₽", en: "RUB" },
  USD: { uz: "USD", ru: "USD", en: "USD" }
};
const dateParts = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, day: "2-digit", month: "2-digit", year: "numeric" });
const timeParts = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

export function formatNumber(value: number, fractionDigits = 2): string {
  const [whole, fraction] = Math.abs(value).toFixed(fractionDigits).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  const trimmed = fraction?.replace(/0+$/, "");
  return `${value < 0 ? "-" : ""}${grouped}${trimmed ? `.${trimmed}` : ""}`;
}

export function formatMoney(major: number, currency: string, locale = "uz"): string {
  const code = currency.toUpperCase();
  const label = currencyLabels[code]?.[locale] ?? code;
  return `${formatNumber(major, code === "UZS" ? 0 : 2)}${NBSP}${label}`;
}

export function formatMinor(minor: number, currency: string, locale = "uz"): string {
  return formatMoney(minor / 100, currency, locale);
}

export function formatDate(value: Date | string | number): string {
  const parts = Object.fromEntries(dateParts.formatToParts(new Date(value)).map((part) => [part.type, part.value]));
  return `${parts.day}.${parts.month}.${parts.year}`;
}

export function formatTime(value: Date | string | number): string {
  return timeParts.format(new Date(value));
}

export function formatDateTime(value: Date | string | number): string {
  return `${formatDate(value)}, ${formatTime(value)}`;
}

/** Converts a major-unit price typed by staff ("1 250 000,50") into minor units. */
export function parseMajorPrice(raw: string): number | null {
  const normalized = raw.replace(/[\s ]/g, "").replace(",", ".");
  if (!normalized) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return Number.NaN;
  return Math.round(Number(normalized) * 100);
}

export function minorToMajorInput(minor: number | null | undefined): string {
  if (minor === null || minor === undefined) return "";
  return minor % 100 === 0 ? String(minor / 100) : (minor / 100).toFixed(2);
}
