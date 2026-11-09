import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { getCurrentUser } from "@/lib/auth";
import { getLearningModule } from "@/lib/learning-content";
import { parseLearningMediaFile } from "@/lib/learning-media";
import { sectionPriceTec } from "@/lib/learning-pricing";
import { hasLearningModuleAccess } from "@/lib/learning-subscriptions";
import { parseByteRange } from "@/lib/media-validate";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Context = { params: Promise<{ slug: string; file: string }> };

/**
 * Lesson videos, posters and subtitles from LEARNING_MEDIA_DIR. Byte ranges are honoured so players can
 * seek (Safari will not play without them). A paid section's video goes only to people who opened it;
 * posters are a preview and stay public.
 */
async function serve(request: Request, context: Context, head: boolean): Promise<Response> {
  const { slug, file } = await context.params;
  const media = parseLearningMediaFile(slug, file);
  if (!media) return new Response("Not found", { status: 404 });
  const module = await getLearningModule(slug);
  if (!module || media.section >= module.sections.length) return new Response("Not found", { status: 404 });
  const paid = sectionPriceTec(module, media.section) > 0;
  if (paid && !media.poster) {
    const user = await getCurrentUser();
    if (!user || !(await hasLearningModuleAccess(prisma, user.id, module, media.section))) return new Response("Not found", { status: 404 });
  }
  let size: number;
  try {
    const info = await stat(media.diskPath);
    if (!info.isFile()) throw new Error("not a file");
    size = info.size;
  } catch {
    return new Response("Not found", { status: 404 });
  }
  const headers: Record<string, string> = {
    "Content-Type": media.type,
    "Accept-Ranges": "bytes",
    "Cache-Control": paid && !media.poster ? "private, max-age=3600" : "public, max-age=86400",
    "X-Content-Type-Options": "nosniff"
  };
  const range = parseByteRange(request.headers.get("range"), size);
  if (range === "invalid") return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${size}` } });
  const start = range?.start ?? 0;
  const end = range?.end ?? size - 1;
  const partHeaders = { ...headers, "Content-Length": String(end - start + 1), ...(range ? { "Content-Range": `bytes ${start}-${end}/${size}` } : {}) };
  if (head) return new Response(null, { status: range ? 206 : 200, headers: partHeaders });
  const stream = Readable.toWeb(createReadStream(media.diskPath, { start, end })) as ReadableStream<Uint8Array>;
  return new Response(stream, { status: range ? 206 : 200, headers: partHeaders });
}

export function GET(request: Request, context: Context) {
  return serve(request, context, false);
}

export function HEAD(request: Request, context: Context) {
  return serve(request, context, true);
}
