import assert from "node:assert/strict";
import test from "node:test";
import { exceedsWalletLimit, MAX_WALLET_MINOR, withdrawalRoom } from "./wallet-rules";

test("two withdrawals together cannot ask for more than the balance", () => {
  assert.equal(withdrawalRoom(100_000, 0), 100_000);
  assert.equal(withdrawalRoom(100_000, 70_000), 30_000);
  assert.equal(withdrawalRoom(100_000, 120_000), 0);
});

test("a balance that would not fit the column is refused, not wrapped", () => {
  assert.equal(exceedsWalletLimit(MAX_WALLET_MINOR - 10, 10), false);
  assert.equal(exceedsWalletLimit(MAX_WALLET_MINOR - 10, 11), true);
  assert.equal(exceedsWalletLimit(MAX_WALLET_MINOR, -5), false);
});
