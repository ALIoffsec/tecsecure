import { stat } from "node:fs/promises";
import path from "node:path";
import type { LearningVideo } from "./learning-demo";
import { LEARNING_MEDIA_PREFIX } from "./learning-media-paths";

export { LEARNING_MEDIA_PREFIX, sectionVideo } from "./learning-media-paths";

/** Lesson video files: N.mp4, N-poster.jpg|webp and N.vtt, where N is the section number counted from 0. */
const FILE = /^(\d{1,3})(-poster)?\.(mp4|webm|jpg|jpeg|webp|vtt)$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const learningMediaTypes: Record<string, string> = {
  mp4: "video/mp4", webm: "video/webm", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", vtt: "text/vtt; charset=utf-8"
};

/** Where the files live: LEARNING_MEDIA_DIR on the server, platform/learning-media in development. */
export function learningMediaRoot(): string {
  return process.env.LEARNING_MEDIA_DIR?.trim() || path.join(process.cwd(), "learning-media");
}

/** The section a file belongs to and its disk path, or null for any name outside the fixed pattern. */
export function parseLearningMediaFile(slug: string, file: string): { section: number; poster: boolean; type: string; diskPath: string } | null {
  const match = file.match(FILE);
  if (!SLUG.test(slug) || !match) return null;
  return { section: Number(match[1]), poster: Boolean(match[2]), type: learningMediaTypes[match[3]], diskPath: path.join(learningMediaRoot(), slug, file) };
}

async function exists(src: string | undefined): Promise<boolean> {
  if (!src?.startsWith(LEARNING_MEDIA_PREFIX)) return Boolean(src);
  const [slug, file] = src.slice(LEARNING_MEDIA_PREFIX.length).split("/");
  const parsed = slug && file ? parseLearningMediaFile(slug, file) : null;
  if (!parsed) return false;
  try { return (await stat(parsed.diskPath)).isFile(); } catch { return false; }
}

/** The video as it can actually be played: null until the file is on the server, missing poster or captions left out. */
export async function availableVideo(video: LearningVideo | undefined): Promise<LearningVideo | null> {
  if (!video || !(await exists(video.src))) return null;
  const poster = video.poster && await exists(video.poster) ? video.poster : undefined;
  const captions = (await Promise.all((video.captions ?? []).map(async track => (await exists(track.src) ? track : null)))).filter(track => track !== null);
  return { src: video.src, ...(poster ? { poster } : {}), ...(captions.length ? { captions } : {}), ...(video.durationSec ? { durationSec: video.durationSec } : {}) };
}
