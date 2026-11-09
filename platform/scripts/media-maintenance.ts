/**
 * One-off maintenance of uploaded files, run on the server:
 *
 *   npm run media:maintenance -- strip-metadata            (dry run: only counts)
 *   npm run media:maintenance -- strip-metadata --apply    (re-encodes pictures that still carry EXIF/GPS)
 *   npm run media:maintenance -- cleanup-proofs            (dry run)
 *   npm run media:maintenance -- cleanup-proofs --apply    (deletes receipts nothing uses, older than 2 days)
 *
 * Run `npm run db:backup` first. A picture that cannot be re-encoded is left exactly as it was.
 */
import { prisma } from "../src/lib/prisma";
import { cleanImage, deleteOrphanedProofs, hasImageMetadata } from "../src/lib/media-maintenance";

const [command] = process.argv.slice(2).filter(arg => !arg.startsWith("--"));
const apply = process.argv.includes("--apply");

async function stripMetadata() {
  let cursor: string | undefined;
  let seen = 0;
  let withMetadata = 0;
  let cleaned = 0;
  let failed = 0;
  for (;;) {
    const batch = await prisma.mediaAsset.findMany({
      where: { mimeType: { in: ["image/jpeg", "image/png", "image/webp"] } },
      select: { id: true, mimeType: true, data: true },
      orderBy: { id: "asc" },
      take: 20,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
    });
    if (batch.length === 0) break;
    for (const asset of batch) {
      seen += 1;
      const data = Buffer.from(asset.data);
      if (!(await hasImageMetadata(data))) continue;
      withMetadata += 1;
      if (!apply) continue;
      const result = await cleanImage(data, asset.mimeType);
      if (!result) { failed += 1; continue; }
      await prisma.mediaAsset.update({ where: { id: asset.id }, data: { data: result.data, sizeBytes: result.data.length, mimeType: result.mimeType } });
      cleaned += 1;
    }
    cursor = batch.at(-1)?.id;
  }
  console.log(JSON.stringify({ command: "strip-metadata", apply, imagesChecked: seen, withMetadata, cleaned, leftUnchanged: failed }));
}

async function cleanupProofs() {
  let total = 0;
  for (;;) {
    const count = await deleteOrphanedProofs({ dryRun: !apply, limit: 500 });
    total += count;
    if (!apply || count < 500) break;
  }
  console.log(JSON.stringify({ command: "cleanup-proofs", apply, orphanedReceipts: total }));
}

(async () => {
  if (command === "strip-metadata") await stripMetadata();
  else if (command === "cleanup-proofs") await cleanupProofs();
  else console.log("Usage: npm run media:maintenance -- strip-metadata|cleanup-proofs [--apply]");
  await prisma.$disconnect();
})().catch(async (error) => {
  console.error("Media maintenance failed", error);
  await prisma.$disconnect();
  process.exitCode = 1;
});
