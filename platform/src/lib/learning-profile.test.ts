import assert from "node:assert/strict";
import test from "node:test";
import { computeProfile } from "./learning-profile";
import { learningLabs } from "./learning-labs";
import { learningExams } from "./learning-exams";

test("profile xp breakdown and level are computed correctly", () => {
  const profile = computeProfile({
    sections: [
      { moduleSlug: "network-fundamentals", sectionIndex: 0 },
      { moduleSlug: "network-fundamentals", sectionIndex: 1 },
      { moduleSlug: "linux-fundamentals", sectionIndex: 0 }
    ],
    modulesDone: ["network-fundamentals"],
    labsDone: ["subnet-vlsm-office"],
    examsPassed: ["tec-network-foundations"],
    certificates: 1,
    pathsFinished: 0
  });

  assert.equal(profile.breakdown.sections, 30);
  assert.equal(profile.breakdown.modules, 100);
  assert.equal(profile.breakdown.labs, 150);
  assert.equal(profile.breakdown.exams, 400);
  assert.equal(profile.xp, 680);
  assert.equal(profile.level, 4);
});

test("skills and achievements react to full completion", () => {
  const profile = computeProfile({
    sections: [
      ...Array.from({ length: 8 }, (_, sectionIndex) => ({ moduleSlug: "network-fundamentals", sectionIndex })),
      ...Array.from({ length: 8 }, (_, sectionIndex) => ({ moduleSlug: "linux-fundamentals", sectionIndex })),
      ...Array.from({ length: 8 }, (_, sectionIndex) => ({ moduleSlug: "soc-log-analysis", sectionIndex }))
    ],
    modulesDone: ["network-fundamentals", "linux-fundamentals", "soc-log-analysis"],
    labsDone: learningLabs.map((item) => item.slug),
    examsPassed: learningExams.map((exam) => exam.slug),
    certificates: learningExams.length,
    pathsFinished: 1
  });

  assert.ok(profile.skills.every((item) => item.score >= 0 && item.score <= 100));
  assert.ok(profile.skills.some((item) => item.score >= 60));
  assert.equal(profile.achievements.find((item) => item.id === "all-labs")?.earned, true);
  assert.equal(profile.achievements.find((item) => item.id === "all-exams")?.earned, true);
  assert.equal(profile.achievements.find((item) => item.id === "path")?.earned, true);
});
