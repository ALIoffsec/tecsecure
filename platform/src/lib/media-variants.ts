import sharp from "sharp";
import type { MediaWidth } from "./media-url";

/** Raster formats we re-encode. GIF (animation) and SVG pass through untouched. */
const RESIZABLE = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function canResize(mimeType: string) {
  return RESIZABLE.has(mimeType);
}

type Variant = { data: Uint8Array; mimeType: string };

/** Variants kept in memory, oldest dropped first, so a popular slide is encoded once per server start. */
const MAX_CACHE_BYTES = 48 * 1024 * 1024;
const cache = new Map<string, Variant>();
const pending = new Map<string, Promise<Variant>>();
let cachedBytes = 0;

function remember(key: string, variant: Variant) {
  cache.set(key, variant);
  cachedBytes += variant.data.length;
  for (const [oldKey, old] of cache) {
    if (cachedBytes <= MAX_CACHE_BYTES) break;
    cache.delete(oldKey);
    cachedBytes -= old.data.length;
  }
}

/**
 * A copy no wider than `width`, as WebP when the browser accepts it (JPEG otherwise, PNG kept for
 * transparency). Never enlarged; if the result is not smaller than the original, the original is used.
 */
export async function mediaVariant(id: string, original: Uint8Array, mimeType: string, width: MediaWidth, webp: boolean): Promise<Variant> {
  const key = `${id}:${width}:${webp ? "webp" : "legacy"}`;
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const running = pending.get(key);
  if (running) return running;
  const job = (async () => {
    const image = sharp(original, { limitInputPixels: 50_000_000 }).rotate().resize({ width, withoutEnlargement: true });
    const encoded = webp
      ? { data: await image.webp({ quality: 78, effort: 4 }).toBuffer(), mimeType: "image/webp" }
      : mimeType === "image/png"
        ? { data: await image.png({ compressionLevel: 9, palette: true }).toBuffer(), mimeType: "image/png" }
        : { data: await image.jpeg({ quality: 80, mozjpeg: true }).toBuffer(), mimeType: "image/jpeg" };
    const variant = encoded.data.length < original.length ? encoded : { data: original, mimeType };
    remember(key, variant);
    return variant;
  })().finally(() => pending.delete(key));
  pending.set(key, job);
  return job;
}
