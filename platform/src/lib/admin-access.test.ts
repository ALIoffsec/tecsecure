import assert from "node:assert/strict";
import test from "node:test";
import { isAdminAccessActive } from "./admin-access";

test("admin access expires at the earlier of the session and elevation deadlines", () => {
  const now = new Date("2026-10-24T12:00:00.000Z");

  assert.equal(isAdminAccessActive(new Date("2026-10-25T12:00:00.000Z"), new Date("2026-10-24T12:30:00.000Z"), now), true);
  assert.equal(isAdminAccessActive(new Date("2026-10-25T12:00:00.000Z"), new Date("2026-10-24T12:00:00.000Z"), now), false);
  assert.equal(isAdminAccessActive(new Date("2026-10-25T12:00:00.000Z"), null, now), false);
  assert.equal(isAdminAccessActive(new Date("2026-10-24T12:00:00.000Z"), new Date("2026-10-25T12:00:00.000Z"), now), false);
});
