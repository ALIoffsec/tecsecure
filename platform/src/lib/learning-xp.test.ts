import assert from "node:assert/strict";
import test from "node:test";
import { LEVEL_NAMES, levelForXp, skillScore, streakWeeks, weekStart, weeklyXp, xpForLevel } from "./learning-xp";

test("levels follow 100·L + 25·L² and name every three stages", () => {
  assert.equal(xpForLevel(1), 0);
  assert.equal(xpForLevel(2), 125);
  assert.equal(xpForLevel(3), 300);
  assert.equal(xpForLevel(4), 525);
  const at680 = levelForXp(680);
  assert.equal(at680.level, 4);
  assert.equal(at680.floor, 525);
  assert.equal(at680.ceil, 800);
  assert.equal(at680.toNext, 120);
  assert.equal(LEVEL_NAMES.uz[at680.nameIndex], "Shogird");
  assert.equal(at680.stage, 1);
  assert.equal(levelForXp(0).level, 1);
  assert.equal(levelForXp(0).stage, 1);
  assert.equal(levelForXp(-5).level, 1);
  const top = levelForXp(1_000_000);
  assert.equal(LEVEL_NAMES.en[top.nameIndex], "Expert");
  assert.equal(top.stage, 3);
});

test("weeks start on Monday in Tashkent", () => {
  // Sunday 2026-03-01 20:00 UTC is Monday 01:00 in Tashkent.
  assert.equal(weekStart("2026-03-01T20:00:00Z").toISOString(), "2026-03-01T19:00:00.000Z");
  assert.equal(weekStart("2026-03-01T18:00:00Z").toISOString(), "2026-02-22T19:00:00.000Z");
});

test("weekly XP fills the last weeks, oldest first, ignoring older and future events", () => {
  const now = new Date("2026-03-04T10:00:00Z");
  const weeks = weeklyXp([
    { at: "2026-03-03T10:00:00Z", xp: 50 },
    { at: "2026-03-02T10:00:00Z", xp: 30 },
    { at: "2026-02-25T10:00:00Z", xp: 200 },
    { at: "2025-01-01T10:00:00Z", xp: 999 },
    { at: "2026-04-01T10:00:00Z", xp: 999 }
  ], now, 3);
  assert.deepEqual(weeks.map(week => week.xp), [0, 200, 80]);
});

test("the streak counts finished goal weeks and is not broken by the current week", () => {
  assert.equal(streakWeeks([{ xp: 250 }, { xp: 200 }, { xp: 50 }]), 2);
  assert.equal(streakWeeks([{ xp: 250 }, { xp: 200 }, { xp: 210 }]), 3);
  assert.equal(streakWeeks([{ xp: 250 }, { xp: 10 }, { xp: 300 }]), 1);
  assert.equal(streakWeeks([]), 0);
});

test("a skill score is earned over possible XP, kept between 0 and 100", () => {
  assert.equal(skillScore(50, 200), 25);
  assert.equal(skillScore(0, 0), 0);
  assert.equal(skillScore(300, 200), 100);
});
