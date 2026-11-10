import assert from "node:assert/strict";
import test from "node:test";
import { startOfTashkentDay } from "./staff-desk";
import { longDay } from "./tma-copy";

test("the staff desk's day starts at midnight in Tashkent, not in UTC", () => {
  // 2026-11-11 01:30 Tashkent is 2026-11-10 20:30 UTC; the day began at 2026-11-10 19:00 UTC.
  assert.equal(startOfTashkentDay(Date.UTC(2026, 10, 10, 20, 30)).toISOString(), "2026-11-10T19:00:00.000Z");
  assert.equal(startOfTashkentDay(Date.UTC(2026, 10, 11, 18, 59)).toISOString(), "2026-11-10T19:00:00.000Z");
  assert.equal(startOfTashkentDay(Date.UTC(2026, 10, 11, 19, 0)).toISOString(), "2026-11-11T19:00:00.000Z");
});

test("the Mini App date is spelled the same on the server and in the browser", () => {
  const late = new Date(Date.UTC(2026, 10, 10, 20, 30));
  assert.equal(longDay(late, "uz"), "chorshanba, 11-noyabr");
  assert.equal(longDay(late, "ru"), "среда, 11 ноября");
  assert.equal(longDay(late, "en"), "Wednesday, November 11");
});
