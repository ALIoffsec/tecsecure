import assert from "node:assert/strict";
import test from "node:test";
import { canTransitionRequest } from "./request-status";

test("valid request lifecycle advances and terminal states stay terminal", () => {
  assert.equal(canTransitionRequest("NEW", "UNDER_REVIEW", false), true);
  assert.equal(canTransitionRequest("QUOTATION_SENT", "APPROVED", false), true);
  assert.equal(canTransitionRequest("COMPLETED", "IN_PROGRESS", false), false);
});

test("customers can cancel only their own active request", () => {
  assert.equal(canTransitionRequest("NEW", "CANCELLED", true), true);
  assert.equal(canTransitionRequest("IN_PROGRESS", "COMPLETED", true), false);
  assert.equal(canTransitionRequest("COMPLETED", "CANCELLED", true), false);
});
