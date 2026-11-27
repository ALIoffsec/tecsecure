import assert from "node:assert/strict";
import test from "node:test";
import { projectMoveAllowed, cashReference, invoiceDecision, invoiceRoom, newQuoteDecision, quoteLineFits } from "./quote-rules";

test("a new quote withdraws the open and the accepted ones while no invoice exists", () => {
  const quotes = [{ id: "a", status: "ACCEPTED", version: 1 }, { id: "b", status: "REJECTED", version: 2 }, { id: "c", status: "ISSUED", version: 3 }];
  assert.deepEqual(newQuoteDecision(quotes, 0), { ok: true, withdraw: ["a", "c"] });
  assert.deepEqual(newQuoteDecision(quotes, 1), { ok: false, reason: "INVOICE_EXISTS" });
  assert.deepEqual(newQuoteDecision([], 0), { ok: true, withdraw: [] });
});

test("one payable invoice per project, from its latest accepted quote", () => {
  assert.equal(invoiceDecision({ id: "a", status: "ACCEPTED", version: 2 }, 2, 0), "OK");
  assert.equal(invoiceDecision({ id: "a", status: "ISSUED", version: 2 }, 2, 0), "QUOTE_NOT_ACCEPTED");
  assert.equal(invoiceDecision({ id: "a", status: "ACCEPTED", version: 1 }, 2, 0), "NOT_LATEST");
  assert.equal(invoiceDecision({ id: "a", status: "ACCEPTED", version: 2 }, 2, 1), "INVOICE_EXISTS");
});

test("quote lines fit their columns and keep the discount inside the line", () => {
  assert.equal(quoteLineFits({ quantity: 2, unitPriceMinor: 1000, discountMinor: 2000 }), true);
  assert.equal(quoteLineFits({ quantity: 2, unitPriceMinor: 1000, discountMinor: 2001 }), false);
  assert.equal(quoteLineFits({ quantity: 1, unitPriceMinor: 2_147_483_648, discountMinor: 0 }), false);
});

test("payment reports never pass what is left; cash gets a server reference", () => {
  assert.equal(invoiceRoom(1000, 400), 600);
  assert.equal(invoiceRoom(1000, 1200), 0);
  assert.equal(cashReference("ab12cd", new Date("2026-03-01T00:00:00Z")), "CASH-2026-AB12CD");
});

test("project work moves one step at a time and is cancelled only before work", () => {
  assert.equal(projectMoveAllowed("APPROVED", "IN_PROGRESS"), true);
  assert.equal(projectMoveAllowed("QUOTED", "IN_PROGRESS"), false);
  assert.equal(projectMoveAllowed("IN_PROGRESS", "COMPLETED"), true);
  assert.equal(projectMoveAllowed("IN_PROGRESS", "CANCELLED"), false);
  assert.equal(projectMoveAllowed("COMPLETED", "CANCELLED"), false);
});
