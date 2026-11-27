import assert from "node:assert/strict";
import test from "node:test";
import { ledgerMatches, ledgerSign, shortfallMinor, withdrawable } from "./wallet-view";

test("each wallet entry shows its direction; refused and cancelled ones moved nothing", () => {
  assert.equal(ledgerSign({ kind: "DEPOSIT", status: "APPROVED" }), "+");
  assert.equal(ledgerSign({ kind: "ORDER_REFUND", status: "APPROVED" }), "+");
  assert.equal(ledgerSign({ kind: "TEC_PURCHASE", status: "APPROVED" }), "−");
  assert.equal(ledgerSign({ kind: "WITHDRAWAL", status: "REJECTED" }), "");
  assert.equal(ledgerSign({ kind: "DEPOSIT", status: "CANCELLED" }), "");
});

test("the activity tabs sort entries into in, out and TEC", () => {
  assert.equal(ledgerMatches({ kind: "DEPOSIT" }, "in"), true);
  assert.equal(ledgerMatches({ kind: "DEPOSIT" }, "out"), false);
  assert.equal(ledgerMatches({ kind: "ORDER_PAYMENT" }, "out"), true);
  assert.equal(ledgerMatches({ kind: "TEC_PURCHASE" }, "tec"), true);
  assert.equal(ledgerMatches({ kind: "WITHDRAWAL" }, "all"), true);
});

test("withdrawable counts withdrawals already waiting; the store names what is missing", () => {
  assert.equal(withdrawable(100_000, [{ kind: "WITHDRAWAL", status: "PENDING", amountMinor: 30_000 }, { kind: "WITHDRAWAL", status: "REJECTED", amountMinor: 50_000 }]), 70_000);
  assert.equal(withdrawable(10_000, [{ kind: "WITHDRAWAL", status: "PENDING", amountMinor: 30_000 }]), 0);
  assert.equal(shortfallMinor(40_000, 100_000), 60_000);
  assert.equal(shortfallMinor(200_000, 100_000), 0);
});
