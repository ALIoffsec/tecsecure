import assert from "node:assert/strict";
import test from "node:test";
import { monthlyCounts } from "./activity";

test("dates are counted per Tashkent month for the last months, oldest first", () => {
  const now = new Date("2026-03-15T10:00:00Z");
  const counts = monthlyCounts([
    "2026-03-01T10:00:00Z",
    "2026-02-28T20:00:00Z", // already 1 March in Tashkent
    "2026-02-10T10:00:00Z",
    "2025-12-31T10:00:00Z",
    "2024-01-01T10:00:00Z",
    "2026-04-02T10:00:00Z"
  ], now, 4);
  assert.deepEqual(counts.map(item => [item.year, item.month, item.count]), [[2025, 11, 1], [2026, 0, 0], [2026, 1, 1], [2026, 2, 2]]);
});
