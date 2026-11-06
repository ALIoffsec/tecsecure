export type CatalogMedia = { id: string; mimeType: string };

export function mediaIds(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string" && /^[a-z0-9]{20,40}$/i.test(id)))] : [];
}

export function orderedMedia(value: unknown, assets: CatalogMedia[]): CatalogMedia[] {
  const byId = new Map(assets.map(asset => [asset.id, asset]));
  return mediaIds(value).flatMap(id => {
    const asset = byId.get(id);
    return asset && /^(image|video)\//.test(asset.mimeType) ? [asset] : [];
  });
}

export function coverMedia(assets: CatalogMedia[]) {
  return assets.find(asset => asset.mimeType.startsWith("image/")) ?? assets[0];
}

export function detailRows(value: unknown): [string, string][] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string").map(item => ["", item]);
  return Object.entries(value).flatMap(([key, item]): [string, string][] =>
    typeof item === "string" || typeof item === "number" || typeof item === "boolean" ? [[key, String(item)]] : []);
}

export function comparisonIds(value: string | undefined) {
  return [...new Set((value ?? "").split(",").filter(id => /^[a-z0-9]{20,40}$/i.test(id)))].slice(0, 3);
}

export function priceBound(value: string | undefined): number | undefined {
  if (!value?.trim() || !/^\d+(\.\d{1,2})?$/.test(value.trim())) return undefined;
  const minor = Math.round(Number(value) * 100);
  return Number.isSafeInteger(minor) && minor >= 0 && minor <= 10_000_000_000_000 ? minor : undefined;
}

export function specificationFilter(raw: string | undefined): { key: string; value: string | number | boolean } | null {
  if (!raw || raw.length > 1200) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || value.length !== 2 || typeof value[0] !== "string" || !value[0] || value[0].length > 100) return null;
    if (typeof value[1] !== "string" && typeof value[1] !== "number" && typeof value[1] !== "boolean") return null;
    return { key: value[0], value: value[1] };
  } catch { return null; }
}

export type QuotedProduct = { id: string; priceMinor: number | null; currency: string; stockStatus: string };
export function pricesMatch(expected: QuotedProduct[], actual: QuotedProduct[]) {
  if (expected.length !== actual.length || new Set(expected.map(item => item.id)).size !== expected.length) return false;
  const byId = new Map(actual.map(item => [item.id, item]));
  return expected.every(item => {
    const current = byId.get(item.id);
    return current && item.priceMinor === current.priceMinor && item.currency === current.currency && item.stockStatus === current.stockStatus;
  });
}
