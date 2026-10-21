import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function HEAD(_request: Request, context: Context) {
  const { id } = await context.params;
  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    select: { mimeType: true, sizeBytes: true }
  });
  if (!asset) return new Response(null, { status: 404 });
  return new Response(null, {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(asset.sizeBytes),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    select: { name: true, mimeType: true, data: true }
  });
  if (!asset) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(asset.data), {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Disposition": `inline; filename="${asset.name.replace(/["\\\r\n]/g, "_")}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
