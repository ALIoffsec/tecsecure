import { getCurrentUser, isResponse, requireModuleApi } from "@/lib/auth";
import { parseByteRange } from "@/lib/media-validate";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };
const PUBLIC_CACHE = "public, max-age=31536000, immutable";
const PRIVATE_CACHE = "private, no-store";

async function canRead(asset: { private: boolean; ownerId: string | null }) {
  if (!asset.private) return true;
  const user = await getCurrentUser();
  if (user && asset.ownerId === user.id) return true;
  if (!user || user.role === "CUSTOMER") return false;
  // Payment proofs reach staff through wallet requests and through orders.
  return !isResponse(await requireModuleApi("WALLET")) || !isResponse(await requireModuleApi("PRODUCTS"));
}

export async function HEAD(_request: Request, context: Context) {
  const { id } = await context.params;
  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    select: { mimeType: true, sizeBytes: true, private: true, ownerId: true }
  });
  if (!asset || !(await canRead(asset))) return new Response(null, { status: 404 });
  return new Response(null, {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(asset.sizeBytes),
      "Accept-Ranges": "bytes",
      "Cache-Control": asset.private ? PRIVATE_CACHE : PUBLIC_CACHE,
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export async function GET(request: Request, context: Context) {
  const { id } = await context.params;
  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    select: { name: true, mimeType: true, data: true, private: true, ownerId: true }
  });
  // A private asset answers 404, not 403, so its existence is not disclosed.
  if (!asset || !(await canRead(asset))) return new Response("Not found", { status: 404 });
  const headers: Record<string, string> = {
    "Content-Type": asset.mimeType,
    "Content-Disposition": `inline; filename="${asset.name.replace(/[^\x20-\x7e]|["\\]/g, "_")}"`,
    "Accept-Ranges": "bytes",
    "Cache-Control": asset.private ? PRIVATE_CACHE : PUBLIC_CACHE,
    "X-Content-Type-Options": "nosniff"
  };
  const size = asset.data.length;
  const range = parseByteRange(request.headers.get("range"), size);
  if (range === "invalid") return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  if (range) {
    return new Response(new Uint8Array(asset.data.subarray(range.start, range.end + 1)), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${range.start}-${range.end}/${size}`, "Content-Length": String(range.end - range.start + 1) }
    });
  }
  return new Response(new Uint8Array(asset.data), { headers: { ...headers, "Content-Length": String(size) } });
}
