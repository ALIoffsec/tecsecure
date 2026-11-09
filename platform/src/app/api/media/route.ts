import { randomUUID } from "node:crypto";
import { getCurrentUser, isResponse, requireModuleApi, type AdminModule } from "@/lib/auth";
import { clientIp } from "@/lib/client-ip";
import { cleanImage, deleteOrphanedProofs } from "@/lib/media-maintenance";
import { sniffMediaType } from "@/lib/media-validate";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const staffScopes = new Set<AdminModule>(["CONTENT", "PORTFOLIO", "SERVICES", "PRODUCTS", "NEWS"]);
const IMAGE_LIMIT = 8 * 1024 * 1024;
const VIDEO_LIMIT = 32 * 1024 * 1024;
/** The multipart envelope adds a little around the file itself. */
const REQUEST_LIMIT = VIDEO_LIMIT + 256 * 1024;
const PROOF_REQUEST_LIMIT = IMAGE_LIMIT + 256 * 1024;
export async function POST(request: Request) {
  // Size is judged from the header before anything is read, so an oversized body never fills the memory.
  const declared = Number(request.headers.get("content-length"));
  if (!Number.isFinite(declared) || declared <= 0) return Response.json({ error: "Fayl hajmi aniqlanmadi." }, { status: 411 });
  if (declared > REQUEST_LIMIT) return Response.json({ error: "Video hajmi 32 MB dan oshmasligi kerak." }, { status: 413 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Fayl yuklash so‘rovi noto‘g‘ri." }, { status: 400 });
  }
  const scope = form.get("scope");
  const file = form.get("file");
  const isProof = scope === "WALLET";
  if (!isProof && (typeof scope !== "string" || !staffScopes.has(scope as AdminModule))) {
    return Response.json({ error: "Media uchun bo‘lim ko‘rsatilmagan." }, { status: 400 });
  }
  // Wallet deposits are submitted by customers, so proof uploads are owner-scoped rather than staff-only.
  const actor = isProof ? await getCurrentUser() : await requireModuleApi(scope as AdminModule);
  if (!actor) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (isResponse(actor)) return actor;
  if (isProof) {
    if (declared > PROOF_REQUEST_LIMIT) return Response.json({ error: "Rasm hajmi 8 MB dan oshmasligi kerak." }, { status: 413 });
    // Accounts are free to open, so the address and the day are limited too, not only the account.
    if (!(await checkRateLimit("wallet-proof", actor.id, 20, 60 * 60 * 1000))
      || !(await checkRateLimit("wallet-proof-day", actor.id, 60, 24 * 60 * 60 * 1000))
      || !(await checkRateLimit("wallet-proof-ip", clientIp(request), 40, 60 * 60 * 1000))) {
      return Response.json({ error: "Yuklash limiti oshdi. Keyinroq urinib ko‘ring." }, { status: 429 });
    }
    // Receipts this customer picked but never sent are removed as they upload new ones.
    await deleteOrphanedProofs({ ownerId: actor.id, limit: 50 }).catch(error => console.error("Orphan proof cleanup failed", error instanceof Error ? error.message : "UnknownError"));
  }
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Yuklash uchun fayl tanlang." }, { status: 400 });
  }
  if (file.size > VIDEO_LIMIT) return Response.json({ error: "Video hajmi 32 MB dan oshmasligi kerak." }, { status: 413 });
  let data = Buffer.from(await file.arrayBuffer());
  let mimeType = sniffMediaType(data);
  if (!mimeType || (isProof && !mimeType.startsWith("image/"))) {
    return Response.json({ error: isProof ? "To‘lov tasdig‘i uchun JPG, PNG yoki WebP rasm yuklang." : "Faqat JPG, PNG, WebP, GIF, MP4 yoki WebM fayllar qabul qilinadi." }, { status: 415 });
  }
  if (mimeType.startsWith("image/")) {
    if (file.size > IMAGE_LIMIT) return Response.json({ error: "Rasm hajmi 8 MB dan oshmasligi kerak." }, { status: 413 });
    const cleaned = await cleanImage(data, mimeType);
    if (!cleaned) return Response.json({ error: "Rasmni o‘qib bo‘lmadi yoki u juda katta (50 megapikseldan oshmasin)." }, { status: 415 });
    ({ data, mimeType } = cleaned);
  }

  const asset = await prisma.mediaAsset.create({
    data: {
      name: file.name.slice(0, 200) || `upload-${randomUUID()}`,
      mimeType,
      sizeBytes: data.length,
      data,
      private: isProof,
      ownerId: isProof ? actor.id : null
    },
    select: { id: true, name: true, mimeType: true, sizeBytes: true }
  });
  return Response.json({ asset: { ...asset, url: `/api/media/${asset.id}` } }, { status: 201 });
}
