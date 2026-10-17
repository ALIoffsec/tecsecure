import { randomUUID } from "node:crypto";
import { isResponse, requireModuleApi, type AdminModule } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const uploadScopes = new Set<AdminModule>(["CONTENT", "PORTFOLIO", "SERVICES", "PRODUCTS", "NEWS", "WALLET"]);
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const videoTypes = new Set(["video/mp4", "video/webm"]);

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Fayl yuklash so‘rovi noto‘g‘ri." }, { status: 400 });
  }
  const scope = form.get("scope");
  const file = form.get("file");
  if (typeof scope !== "string" || !uploadScopes.has(scope as AdminModule)) {
    return Response.json({ error: "Media uchun bo‘lim ko‘rsatilmagan." }, { status: 400 });
  }
  const actor = await requireModuleApi(scope as AdminModule);
  if (isResponse(actor)) return actor;
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Yuklash uchun fayl tanlang." }, { status: 400 });
  }
  const isImage = imageTypes.has(file.type);
  const isVideo = videoTypes.has(file.type);
  if (!isImage && !isVideo) return Response.json({ error: "Faqat JPG, PNG, WebP, GIF, MP4 yoki WebM fayllar qabul qilinadi." }, { status: 415 });
  const maxSize = isImage ? 8 * 1024 * 1024 : 32 * 1024 * 1024;
  if (file.size > maxSize) return Response.json({ error: isImage ? "Rasm hajmi 8 MB dan oshmasligi kerak." : "Video hajmi 32 MB dan oshmasligi kerak." }, { status: 413 });

  const asset = await prisma.mediaAsset.create({
    data: {
      name: file.name.slice(0, 200) || `upload-${randomUUID()}`,
      mimeType: file.type,
      sizeBytes: file.size,
      data: Buffer.from(await file.arrayBuffer())
    },
    select: { id: true, name: true, mimeType: true, sizeBytes: true }
  });
  return Response.json({ asset: { ...asset, url: `/api/media/${asset.id}` } }, { status: 201 });
}
