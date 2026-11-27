import assert from "node:assert/strict";
import test from "node:test";
import { invoiceAttention, orderStep, pickAttention, type AttentionItem } from "./cabinet-home";

const item = (kind: AttentionItem["kind"], key: string, at: string): AttentionItem => ({ kind, key, subject: key, href: "/portal", at });

test("what waits on the customer comes most urgent first, at most three", () => {
  const picked = pickAttention([
    item("quoteWaiting", "q1", "2026-01-01"),
    item("receiptRejected", "i2", "2026-01-05"),
    item("orderUnpaid", "o2", "2026-01-04"),
    item("orderUnpaid", "o1", "2026-01-02"),
    item("invoiceOverdue", "i1", "2026-01-09")
  ]);
  assert.deepEqual(picked.map(entry => entry.key), ["i1", "o1", "o2"]);
});

test("one record shows once, under its most urgent reason", () => {
  const picked = pickAttention([item("receiptRejected", "i1", "2026-01-01"), item("invoiceOverdue", "i1", "2026-01-01"), item("quoteWaiting", "q1", "2026-01-01")]);
  assert.deepEqual(picked.map(entry => [entry.kind, entry.key]), [["invoiceOverdue", "i1"], ["quoteWaiting", "q1"]]);
  assert.deepEqual(pickAttention([]), []);
});

test("an invoice asks for action only when nothing is being checked", () => {
  assert.equal(invoiceAttention("ISSUED", "PENDING"), null);
  assert.equal(invoiceAttention("OVERDUE", "PENDING"), null);
  assert.equal(invoiceAttention("OVERDUE", "REJECTED"), "invoiceOverdue");
  assert.equal(invoiceAttention("ISSUED", "REJECTED"), "receiptRejected");
  assert.equal(invoiceAttention("PARTIALLY_PAID", "VERIFIED"), "invoiceUnpaid");
  assert.equal(invoiceAttention("ISSUED", null), "invoiceUnpaid");
  assert.equal(invoiceAttention("PAID", null), null);
  assert.equal(invoiceAttention("ISSUED", null, "2026-01-01", new Date("2026-02-01")), "invoiceOverdue");
  assert.equal(invoiceAttention("ISSUED", null, "2026-03-01", new Date("2026-02-01")), "invoiceUnpaid");
  assert.equal(invoiceAttention("ISSUED", "PENDING", "2026-01-01", new Date("2026-02-01")), null);
});

test("an order's place on the four-step line", () => {
  assert.equal(orderStep("NEW"), 0);
  assert.equal(orderStep("CONFIRMED"), 0);
  assert.equal(orderStep("PREPARING"), 1);
  assert.equal(orderStep("SHIPPED"), 2);
  assert.equal(orderStep("DELIVERED"), 3);
  assert.equal(orderStep("CANCELLED"), -1);
});
