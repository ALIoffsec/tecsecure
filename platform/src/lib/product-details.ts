export type ProductDetailValue = string | number | boolean;
export type ProductDetails = Record<string, ProductDetailValue> | string[] | null;
export type ProductDetailsKind = "specifications" | "compatibility";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseValue(value: string): ProductDetailValue {
  const normalized = value.trim();
  if (/^(true|false)$/i.test(normalized)) return normalized.toLowerCase() === "true";
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(normalized)) {
    const number = Number(normalized);
    if (Number.isFinite(number)) return number;
  }
  return normalized;
}

function fromJson(text: string, kind: ProductDetailsKind): ProductDetails {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("JSON formati noto‘g‘ri. Oddiy matn uchun har qatorda «Nomi: qiymati» yozing.");
  }
  if (value === null) return null;
  if (kind === "compatibility" && Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value;
  }
  if (!isRecord(value) || Object.values(value).some((item) =>
    typeof item !== "string" && typeof item !== "number" && typeof item !== "boolean"
  )) {
    throw new Error(kind === "specifications"
      ? "Xususiyatlar JSON obyekti yoki «Nomi: qiymati» satrlari bo‘lishi kerak."
      : "Moslik JSON obyekti, matnlar ro‘yxati yoki oddiy satrlar bo‘lishi kerak.");
  }
  return value as Record<string, ProductDetailValue>;
}

export function parseProductDetails(text: string, kind: ProductDetailsKind): ProductDetails {
  const normalized = text.trim();
  if (!normalized) return null;
  if (normalized.startsWith("{") || normalized.startsWith("[")) return fromJson(normalized, kind);

  const lines = normalized.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const entries = lines.map((line, index) => {
    const separator = line.search(/[:=]/);
    if (separator < 0) {
      return { key: kind === "specifications" ? `Xususiyat ${index + 1}` : `Moslik ${index + 1}`, value: line, hasKey: false };
    }
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (!key || !value) throw new Error("Har bir qatorda nom va qiymat kiriting. Masalan: Portlar: 8.");
    return { key, value, hasKey: true };
  });

  if (kind === "compatibility" && entries.every((entry) => !entry.hasKey)) {
    return entries.map((entry) => entry.value);
  }

  const result: Record<string, ProductDetailValue> = {};
  for (const entry of entries) {
    if (Object.hasOwn(result, entry.key)) throw new Error(`«${entry.key}» nomi takrorlangan.`);
    result[entry.key] = parseValue(entry.value);
  }
  return result;
}

export function formatProductDetails(value: unknown): string {
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) return value.join("\n");
  if (!isRecord(value)) return "";
  return Object.entries(value).map(([key, item]) => {
    const text = typeof item === "string" ? item : String(item);
    return `${key}: ${text}`;
  }).join("\n");
}
