import { createHmac, timingSafeEqual } from "node:crypto";
import { existsSync, statSync } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import type { LearningVideo } from "./learning-demo";
import { LEARNING_MEDIA_PREFIX } from "./learning-media-paths";

export { LEARNING_MEDIA_PREFIX, sectionVideo } from "./learning-media-paths";

/** Lesson video files: N.mp4, N-poster.jpg|webp and N.vtt, where N is the section number counted from 0. */
const FILE = /^(\d{1,3})(-poster)?\.(mp4|webm|jpg|jpeg|webp|vtt)$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** How long a signed link plays: long enough to watch and pause, short enough that a copied link soon dies. */
export const MEDIA_LINK_SECONDS = 4 * 60 * 60;

export const learningMediaTypes: Record<string, string> = {
  mp4: "video/mp4", webm: "video/webm", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", vtt: "text/vtt; charset=utf-8"
};

const isDirectory = (candidate: string) => { try { return existsSync(candidate) && statSync(candidate).isDirectory(); } catch { return false; } };

/**
 * Where the files live. LEARNING_MEDIA_DIR wins when set. Otherwise the app's own `learning-media` folder:
 * the standalone server changes its working directory to `.next/standalone`, so the folder is looked for
 * both there and two levels up, in the app directory itself.
 */
export function learningMediaRoot(cwd = process.cwd(), configured = process.env.LEARNING_MEDIA_DIR): string {
  if (configured?.trim()) return configured.trim();
  const here = path.join(cwd, "learning-media");
  const appRoot = path.resolve(cwd, "..", "..", "learning-media");
  const insideStandalone = path.basename(cwd) === "standalone" && path.basename(path.dirname(cwd)) === ".next";
  if (isDirectory(here)) return here;
  if (insideStandalone || isDirectory(appRoot)) return appRoot;
  return here;
}

/** The section a file belongs to and its disk path, or null for any name outside the fixed pattern. */
export function parseLearningMediaFile(slug: string, file: string): { section: number; poster: boolean; type: string; diskPath: string } | null {
  const match = file.match(FILE);
  if (!SLUG.test(slug) || !match) return null;
  return { section: Number(match[1]), poster: Boolean(match[2]), type: learningMediaTypes[match[3]], diskPath: path.join(learningMediaRoot(), slug, file) };
}

function signingKey(): string {
  return process.env.INTEGRATION_CREDENTIALS_KEY || process.env.NEXTAUTH_SECRET || "development-only-learning-media";
}
const signature = (slug: string, file: string, expires: number) => createHmac("sha256", signingKey()).update(`learning-media:${slug}/${file}:${expires}`).digest("base64url");

/** A lesson file's URL with an expiring signature, so a copied link cannot be shared or reused later. */
export function signMediaUrl(src: string, nowMs = Date.now()): string {
  if (!src.startsWith(LEARNING_MEDIA_PREFIX)) return src;
  const [slug, file] = src.slice(LEARNING_MEDIA_PREFIX.length).split("/");
  const expires = Math.floor(nowMs / 1000) + MEDIA_LINK_SECONDS;
  return `${src}?e=${expires}&s=${signature(slug, file, expires)}`;
}

/** True for a signature this server made for exactly this file, still within its time. */
export function verifyMediaSignature(slug: string, file: string, expiresRaw: string | null, given: string | null, nowMs = Date.now()): boolean {
  const expires = Number(expiresRaw);
  if (!given || !Number.isInteger(expires) || expires < Math.floor(nowMs / 1000) || expires > Math.floor(nowMs / 1000) + MEDIA_LINK_SECONDS + 60) return false;
  const expected = Buffer.from(signature(slug, file, expires));
  const received = Buffer.from(given);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/**
 * Fetch Metadata the browser adds by itself. A lesson file may load into a <video>, <track> or poster image
 * on our own pages; typing its URL into the address bar (the usual way to then "Save as"), embedding it on
 * another site or a page's script fetching it are refused. Clients that send no such headers (old browsers)
 * still need a valid signed link.
 */
export function mediaRequestAllowed(headers: Headers, kind: "video" | "poster" | "track"): boolean {
  const dest = headers.get("sec-fetch-dest");
  const site = headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;
  if (!dest) return true;
  const allowed = kind === "video" ? ["video", "audio"] : kind === "poster" ? ["image"] : ["track"];
  return allowed.includes(dest);
}

async function exists(src: string | undefined): Promise<boolean> {
  if (!src?.startsWith(LEARNING_MEDIA_PREFIX)) return Boolean(src);
  const [slug, file] = src.slice(LEARNING_MEDIA_PREFIX.length).split("/");
  const parsed = slug && file ? parseLearningMediaFile(slug, file) : null;
  if (!parsed) return false;
  try { return (await stat(parsed.diskPath)).isFile(); } catch { return false; }
}

/**
 * The video as it can actually be played, with freshly signed links: null until the file is on the server,
 * a missing poster or caption simply left out.
 */
export async function availableVideo(video: LearningVideo | undefined, nowMs = Date.now()): Promise<LearningVideo | null> {
  if (!video || !(await exists(video.src))) return null;
  const poster = video.poster && await exists(video.poster) ? video.poster : undefined;
  const captions = (await Promise.all((video.captions ?? []).map(async track => (await exists(track.src) ? track : null)))).filter(track => track !== null);
  return {
    src: signMediaUrl(video.src, nowMs),
    ...(poster ? { poster: signMediaUrl(poster, nowMs) } : {}),
    ...(captions.length ? { captions: captions.map(track => ({ ...track, src: signMediaUrl(track.src, nowMs) })) } : {}),
    ...(video.durationSec ? { durationSec: video.durationSec } : {})
  };
}
