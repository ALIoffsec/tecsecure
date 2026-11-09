import type { LearningVideo } from "./learning-demo";

/** Lesson media URLs. Kept free of server imports because course data also reaches the browser. */
export const LEARNING_MEDIA_PREFIX = "/api/learning/media/";

/** The standard file set for one section: N.mp4, N-poster.jpg and N.vtt (Uzbek subtitles), N counted from 0. */
export function sectionVideo(slug: string, section: number, durationSec?: number): LearningVideo {
  const base = `${LEARNING_MEDIA_PREFIX}${slug}/${section}`;
  return {
    src: `${base}.mp4`,
    poster: `${base}-poster.jpg`,
    captions: [{ src: `${base}.vtt`, srclang: "uz", label: "O‘zbekcha" }],
    ...(durationSec ? { durationSec } : {})
  };
}
