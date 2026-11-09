import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { availableVideo, learningMediaRoot, mediaRequestAllowed, MEDIA_LINK_SECONDS, parseLearningMediaFile, sectionVideo, signMediaUrl, verifyMediaSignature } from "./learning-media";
import { validateLearningData } from "./learning-content";
import { linuxFundamentalsSections } from "./linux-fundamentals-content";

test("only the fixed lesson file names are served, never a path", () => {
  assert.equal(parseLearningMediaFile("linux-fundamentals", "0.mp4")?.section, 0);
  assert.equal(parseLearningMediaFile("linux-fundamentals", "7-poster.jpg")?.poster, true);
  assert.equal(parseLearningMediaFile("linux-fundamentals", "3.vtt")?.type, "text/vtt; charset=utf-8");
  for (const bad of ["../0.mp4", "0.mp4/..", "..%2F0.mp4", "0.exe", "a.mp4", "0.MP4", ".mp4"]) assert.equal(parseLearningMediaFile("linux-fundamentals", bad), null, bad);
  assert.equal(parseLearningMediaFile("../etc", "0.mp4"), null);
  assert.equal(parseLearningMediaFile("Linux", "0.mp4"), null);
});

test("a section's video is announced only once its file exists; a missing poster or subtitle is left out", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "learning-media-"));
  const previous = process.env.LEARNING_MEDIA_DIR;
  process.env.LEARNING_MEDIA_DIR = root;
  try {
    const video = sectionVideo("linux-fundamentals", 0, 300);
    assert.equal(await availableVideo(video), null);
    await mkdir(path.join(root, "linux-fundamentals"));
    await writeFile(path.join(root, "linux-fundamentals", "0.mp4"), "fake");
    const bare = await availableVideo(video);
    assert.match(bare?.src ?? "", /^\/api\/learning\/media\/linux-fundamentals\/0\.mp4\?e=\d+&s=[\w-]+$/);
    assert.equal(bare?.poster, undefined);
    assert.equal(bare?.durationSec, 300);
    await writeFile(path.join(root, "linux-fundamentals", "0-poster.jpg"), "fake");
    await writeFile(path.join(root, "linux-fundamentals", "0.vtt"), "WEBVTT");
    const full = await availableVideo(video);
    assert.match(full?.poster ?? "", /^\/api\/learning\/media\/linux-fundamentals\/0-poster\.jpg\?e=/);
    assert.equal(full?.captions?.[0].srclang, "uz");
    assert.equal(await availableVideo(undefined), null);
  } finally {
    if (previous === undefined) delete process.env.LEARNING_MEDIA_DIR; else process.env.LEARNING_MEDIA_DIR = previous;
    await rm(root, { recursive: true, force: true });
  }
});

test("every Linux lesson carries its video slot, and stored modules with videos still validate", () => {
  linuxFundamentalsSections.forEach((section, index) => assert.equal(section.video?.src, `/api/learning/media/linux-fundamentals/${index}.mp4`));
  const module = { slug: "x-module", title: "X", summary: "X", difficulty: "easy", category: "systems", hours: 1, hasLab: false, sections: [{ title: "A", video: sectionVideo("x-module", 0) }] };
  assert.doesNotThrow(() => validateLearningData("module", module));
  assert.throws(() => validateLearningData("module", { ...module, sections: [{ title: "A", video: { src: "/a.mp4", extra: 1 } }] }));
});

test("lesson links and media refuse addresses that run code", () => {
  const module = (href: string) => ({ slug: "x-module", title: "X", summary: "X", difficulty: "easy", category: "systems", hours: 1, hasLab: false, references: [{ label: "L", href }], sections: [{ title: "A" }] });
  for (const good of ["https://example.com/a", "/learning-assets/a.svg", "http://legacy.example.com"]) assert.doesNotThrow(() => validateLearningData("module", module(good)), good);
  for (const bad of ["javascript:alert(1)", " JavaScript:alert(1)", "java\tscript:alert(1)", "data:text/html,<script>", "vbscript:x"]) assert.throws(() => validateLearningData("module", module(bad)), bad);
});

test("lesson file links carry a signature that fits one file and expires", () => {
  const now = Date.UTC(2026, 10, 10, 12);
  const url = new URL(signMediaUrl("/api/learning/media/linux-fundamentals/0.mp4", now), "http://x");
  const [e, sig] = [url.searchParams.get("e"), url.searchParams.get("s")];
  assert.equal(verifyMediaSignature("linux-fundamentals", "0.mp4", e, sig, now), true);
  assert.equal(verifyMediaSignature("linux-fundamentals", "1.mp4", e, sig, now), false, "another file");
  assert.equal(verifyMediaSignature("linux-fundamentals", "0.mp4", e, sig, now + (MEDIA_LINK_SECONDS + 5) * 1000), false, "expired");
  assert.equal(verifyMediaSignature("linux-fundamentals", "0.mp4", String(Number(e) + 3600), sig, now), false, "stretched expiry");
  assert.equal(verifyMediaSignature("linux-fundamentals", "0.mp4", e, null, now), false);
  assert.equal(verifyMediaSignature("linux-fundamentals", "0.mp4", "9999999999", sig, now), false, "too far in the future");
});

test("lesson files load only into our own player, never as a page of their own", () => {
  const h = (dest?: string, site = "same-origin") => new Headers({ ...(dest ? { "sec-fetch-dest": dest } : {}), "sec-fetch-site": site });
  assert.equal(mediaRequestAllowed(h("video"), "video"), true);
  assert.equal(mediaRequestAllowed(h("image"), "poster"), true);
  assert.equal(mediaRequestAllowed(h("track"), "track"), true);
  assert.equal(mediaRequestAllowed(h("document", "none"), "video"), false, "typed into the address bar");
  assert.equal(mediaRequestAllowed(h("document"), "video"), false);
  assert.equal(mediaRequestAllowed(h("empty"), "video"), false, "fetched by a script");
  assert.equal(mediaRequestAllowed(h("video", "cross-site"), "video"), false, "embedded elsewhere");
  assert.equal(mediaRequestAllowed(new Headers(), "video"), true, "old browsers still play with a signed link");
});

test("the media folder is found from the standalone server's working directory too", async () => {
  const app = await mkdtemp(path.join(os.tmpdir(), "learning-app-"));
  try {
    await mkdir(path.join(app, "learning-media"));
    await mkdir(path.join(app, ".next", "standalone"), { recursive: true });
    assert.equal(learningMediaRoot(path.join(app, ".next", "standalone"), ""), path.join(app, "learning-media"));
    assert.equal(learningMediaRoot(app, ""), path.join(app, "learning-media"));
    assert.equal(learningMediaRoot(app, "/srv/media"), "/srv/media");
  } finally {
    await rm(app, { recursive: true, force: true });
  }
});
