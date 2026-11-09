import sharp from "sharp";
import { prisma } from "./prisma";

/** 50 megapixels: any real photo fits; a tiny file that unpacks into a gigantic bitmap does not. */
export const PIXEL_LIMIT = 50_000_000;

/**
 * Decodes and re-encodes a picture. The result carries no EXIF/XMP/IPTC data (phone photos otherwise
 * publish their GPS position and device), cannot smuggle a second file inside it, and is proven to be a
 * real image. Animated GIFs are only checked, not re-encoded, so they keep moving. Null when unreadable.
 */
export async function cleanImage(data: Buffer, mimeType: string): Promise<{ data: Buffer; mimeType: string } | null> {
  try {
    const image = sharp(data, { limitInputPixels: PIXEL_LIMIT, failOn: "error", animated: mimeType === "image/gif" });
    const meta = await image.metadata();
    if (!meta.width || !meta.height) return null;
    if (mimeType === "image/gif") return { data, mimeType };
    const oriented = image.rotate();
    if (mimeType === "image/png") return { data: await oriented.png({ compressionLevel: 9 }).toBuffer(), mimeType };
    if (mimeType === "image/webp") return { data: await oriented.webp({ quality: 88 }).toBuffer(), mimeType };
    return { data: await oriented.jpeg({ quality: 88, mozjpeg: true }).toBuffer(), mimeType: "image/jpeg" };
  } catch {
    return null;
  }
}

/** True when a stored picture still carries metadata worth removing. */
export async function hasImageMetadata(data: Buffer): Promise<boolean> {
  try {
    const meta = await sharp(data, { limitInputPixels: PIXEL_LIMIT }).metadata();
    return Boolean(meta.exif || meta.xmp || meta.iptc);
  } catch {
    return false;
  }
}

const ORPHAN_AGE_MS = 48 * 60 * 60 * 1000;

/**
 * Private uploads (payment receipts) that nothing points at after two days: the customer picked a file and
 * then never sent the order or the wallet request. Public files, which staff use in pages, are never touched.
 * Returns how many were (or, on a dry run, would be) deleted.
 */
export async function deleteOrphanedProofs(options: { ownerId?: string; dryRun?: boolean; limit?: number } = {}): Promise<number> {
  const candidates = await prisma.mediaAsset.findMany({
    where: { private: true, createdAt: { lt: new Date(Date.now() - ORPHAN_AGE_MS) }, ...(options.ownerId ? { ownerId: options.ownerId } : {}) },
    select: { id: true },
    orderBy: { createdAt: "asc" },
    take: options.limit ?? 500
  });
  if (candidates.length === 0) return 0;
  const ids = candidates.map(candidate => candidate.id);
  const [orders, wallet, shops] = await Promise.all([
    prisma.order.findMany({ where: { paymentProofMediaId: { in: ids } }, select: { paymentProofMediaId: true } }),
    prisma.walletTransaction.findMany({ where: { proofMediaId: { in: ids } }, select: { proofMediaId: true } }),
    prisma.shop.findMany({ where: { logoMediaId: { in: ids } }, select: { logoMediaId: true } })
  ]);
  const used = new Set([...orders.map(row => row.paymentProofMediaId), ...wallet.map(row => row.proofMediaId), ...shops.map(row => row.logoMediaId)]);
  const orphans = ids.filter(id => !used.has(id));
  if (options.dryRun || orphans.length === 0) return orphans.length;
  const deleted = await prisma.mediaAsset.deleteMany({ where: { id: { in: orphans }, private: true } });
  return deleted.count;
}
