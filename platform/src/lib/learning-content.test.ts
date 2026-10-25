import assert from "node:assert/strict";
import test from "node:test";
import { learningModules, learningPaths } from "@/lib/learning-demo";
import { learningLabs } from "@/lib/learning-labs";
import { learningExams } from "@/lib/learning-exams";
import { validateLearningData } from "@/lib/learning-content";

test("all built-in learning content matches the CMS schemas", () => {
  for (const module of learningModules) assert.doesNotThrow(() => validateLearningData("module", module), module.slug);
  for (const path of learningPaths) assert.doesNotThrow(() => validateLearningData("path", path), path.slug);
  for (const lab of learningLabs) assert.doesNotThrow(() => validateLearningData("lab", lab), lab.slug);
  for (const exam of learningExams) assert.doesNotThrow(() => validateLearningData("exam", exam), exam.slug);
});
