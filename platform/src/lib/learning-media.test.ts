import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { availableVideo, parseLearningMediaFile, sectionVideo } from "./learning-media";
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
    assert.deepEqual(await availableVideo(video), { src: "/api/learning/media/linux-fundamentals/0.mp4", durationSec: 300 });
    await writeFile(path.join(root, "linux-fundamentals", "0-poster.jpg"), "fake");
    await writeFile(path.join(root, "linux-fundamentals", "0.vtt"), "WEBVTT");
    const full = await availableVideo(video);
    assert.equal(full?.poster, "/api/learning/media/linux-fundamentals/0-poster.jpg");
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
