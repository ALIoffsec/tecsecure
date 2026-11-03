import { prisma } from "./prisma";
import { mediaIds, orderedMedia } from "./catalog-utils";

export async function catalogMedia(records: { media: unknown }[]) {
  const ids = [...new Set(records.flatMap(record => mediaIds(record.media)))];
  const assets = ids.length ? await prisma.mediaAsset.findMany({
    where: { id: { in: ids } }, select: { id: true, mimeType: true }
  }) : [];
  return (value: unknown) => orderedMedia(value, assets);
}
