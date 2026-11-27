import assert from "node:assert/strict";
import test from "node:test";
import { cancelStopsMonitoring, subscriptionMoveAllowed, trialAllowed } from "./monitoring-rules";

test("one trial per organisation, cancelled ones included", () => {
  assert.equal(trialAllowed(0), true);
  assert.equal(trialAllowed(1), false);
});

test("subscription moves follow the list; a cancelled one stays cancelled", () => {
  assert.equal(subscriptionMoveAllowed("TRIAL_ACTIVE", "ACTIVE"), true);
  assert.equal(subscriptionMoveAllowed("CANCELLED", "ACTIVE"), false);
  assert.equal(subscriptionMoveAllowed("SUSPENDED", "PAST_DUE"), false);
  assert.equal(subscriptionMoveAllowed("NOPE", "ACTIVE"), false);
});

test("checks stop only on the move to cancelled, when no other live subscription is left", () => {
  assert.equal(cancelStopsMonitoring("CANCELLED", 0), true);
  assert.equal(cancelStopsMonitoring("CANCELLED", 1), false);
  assert.equal(cancelStopsMonitoring("SUSPENDED", 0), false);
});
