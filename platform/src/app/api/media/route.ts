import { randomUUID } from "node:crypto";
import { getCurrentUser, isResponse, requireModuleApi, type AdminModule } from "@/lib/auth";
import { sniffMediaType } from "@/lib/media-validate";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const staffScopes = new Set<AdminModule>(["CONTENT", "PORTFOLIO", "SERVICES", "PRODUCTS", "NEWS"]);
const IMAGE_LIMIT = 8 * 1024 * 1024;
const VIDEO_LIMIT = 32 * 1024 * 1024;

export async function POST(request: Request) {
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
  if (isProof && !(await checkRateLimit("wallet-proof", actor.id, 20, 60 * 60 * 1000))) {
    return Response.json({ error: "Yuklash limiti oshdi. Keyinroq urinib ko‘ring." }, { status: 429 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Yuklash uchun fayl tanlang." }, { status: 400 });
  }
  if (file.size > VIDEO_LIMIT) return Response.json({ error: "Video hajmi 32 MB dan oshmasligi kerak." }, { status: 413 });
  const data = Buffer.from(await file.arrayBuffer());
  const mimeType = sniffMediaType(data);
  if (!mimeType || (isProof && !mimeType.startsWith("image/"))) {
    return Response.json({ error: isProof ? "To‘lov tasdig‘i uchun JPG, PNG yoki WebP rasm yuklang." : "Faqat JPG, PNG, WebP, GIF, MP4 yoki WebM fayllar qabul qilinadi." }, { status: 415 });
  }
  if (mimeType.startsWith("image/") && file.size > IMAGE_LIMIT) return Response.json({ error: "Rasm hajmi 8 MB dan oshmasligi kerak." }, { status: 413 });

  const asset = await prisma.mediaAsset.create({
    data: {
      name: file.name.slice(0, 200) || `upload-${randomUUID()}`,
      mimeType,
      sizeBytes: file.size,
      data,
      private: isProof,
      ownerId: isProof ? actor.id : null
    },
    select: { id: true, name: true, mimeType: true, sizeBytes: true }
  });
  return Response.json({ asset: { ...asset, url: `/api/media/${asset.id}` } }, { status: 201 });
}
