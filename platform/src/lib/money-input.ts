/** Parses "1 250 000,50" or "1250000.5" as so'm into tiyin; null when it is not a plain amount. */
export function parseSomInput(raw: string): number | null {
  const cleaned = raw.replace(/[\s ]/g, "");
  if (!/^\d+([.,]\d{1,2})?$/.test(cleaned)) return null;
  const minor = Math.round(Number(cleaned.replace(",", ".")) * 100);
  return Number.isSafeInteger(minor) && minor > 0 ? minor : null;
}

/**
 * Staff type a refund in whole so'm, digits only ("150 000" is fine). Commas and dots are refused rather than
 * guessed at, since "150,000" could mean either. Returns tiyin, or null.
 */
export function parseWholeSom(raw: string): number | null {
  const digits = raw.replace(/[\s  ]/g, "");
  if (!/^\d{1,13}$/.test(digits)) return null;
  const minor = Number(digits) * 100;
  return Number.isSafeInteger(minor) && minor > 0 ? minor : null;
}
