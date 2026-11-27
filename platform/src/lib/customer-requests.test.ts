import assert from "node:assert/strict";
import test from "node:test";
import { canCancelRequest, invoiceSums, projectTrack, quoteExpired, quoteTotalMinor, requestGroup, requestTrack, waitsOnCustomer } from "./customer-requests";
import { canTransitionRequest } from "./request-status";
import { parseSomInput, parseWholeSom } from "./money-input";

const quote = (status: string, validUntil: string | null = null) => ({ status, validUntil, items: [{ quantity: 2, unitPriceMinor: 1000, discountMinor: 500 }] });
const invoice = (status: string, payments: { status: string; amountMinor: number }[]) => ({ status, items: [{ quantity: 1, unitPriceMinor: 10_000, taxMinor: 0, discountMinor: 0 }], payments });

test("paid means verified; a reported payment is only being checked", () => {
  assert.deepEqual(invoiceSums(invoice("PARTIALLY_PAID", [{ status: "VERIFIED", amountMinor: 3000 }, { status: "PENDING", amountMinor: 2000 }, { status: "REJECTED", amountMinor: 9000 }])),
    { totalMinor: 10_000, paidMinor: 3000, checkingMinor: 2000, leftMinor: 5000 });
  assert.equal(quoteTotalMinor(quote("ISSUED").items), 1500);
});

test("a request waits on the buyer for a quote to answer or money left to report", () => {
  assert.equal(waitsOnCustomer(quote("ISSUED"), null), true);
  assert.equal(waitsOnCustomer(quote("ACCEPTED"), invoice("ISSUED", [])), true);
  assert.equal(waitsOnCustomer(quote("ACCEPTED"), invoice("ISSUED", [{ status: "PENDING", amountMinor: 10_000 }])), false);
  assert.equal(waitsOnCustomer(quote("ACCEPTED"), invoice("PAID", [])), false);
});

test("requests fall into waiting, in progress and finished", () => {
  assert.equal(requestGroup({ requestStatus: "QUOTATION_SENT", projectStatus: "QUOTED", quote: quote("ISSUED"), invoice: null }), "waiting");
  assert.equal(requestGroup({ requestStatus: "IN_PROGRESS", projectStatus: "IN_PROGRESS", quote: quote("ACCEPTED"), invoice: invoice("PAID", []) }), "active");
  assert.equal(requestGroup({ requestStatus: "COMPLETED", projectStatus: null, quote: null, invoice: null }), "done");
  assert.equal(requestGroup({ requestStatus: "CANCELLED", projectStatus: "QUOTED", quote: null, invoice: null }), "done");
  assert.equal(requestGroup({ requestStatus: null, projectStatus: "QUOTE_REQUESTED", quote: null, invoice: null }), "active");
});

test("the request line uses real dates and moves on with its project", () => {
  const track = requestTrack({ status: "CONTACTED", createdAt: "2026-01-01", history: [{ toStatus: "UNDER_REVIEW", createdAt: "2026-01-02" }, { toStatus: "CONTACTED", createdAt: "2026-01-03" }], projectStatus: "QUOTED", firstQuoteAt: "2026-01-05" });
  assert.equal(track.current, 2);
  assert.deepEqual(track.dates, ["2026-01-01", "2026-01-02", "2026-01-05", null, null]);
  assert.equal(requestTrack({ status: "REJECTED", createdAt: "2026-01-01", history: [] }).current, -1);
  assert.equal(projectTrack("APPROVED", "2026-01-01", "2026-01-02").current, 2);
});

test("the buyer cancels a request only before the work is agreed", () => {
  assert.equal(canCancelRequest("QUOTATION_SENT"), true);
  assert.equal(canCancelRequest("IN_PROGRESS"), false);
  assert.equal(canTransitionRequest("IN_PROGRESS", "CANCELLED", true), false);
  assert.equal(canTransitionRequest("IN_PROGRESS", "CANCELLED", false), true);
});

test("quote expiry and so'm amounts typed by hand", () => {
  assert.equal(quoteExpired({ validUntil: "2026-01-01" }, new Date("2026-02-01")), true);
  assert.equal(quoteExpired({ validUntil: null }), false);
  assert.equal(parseSomInput("1 250 000"), 125_000_000);
  assert.equal(parseSomInput("1250000,50"), 125_000_050);
  assert.equal(parseSomInput("1,500,000"), null);
  assert.equal(parseSomInput("abc"), null);
});

test("staff refund amounts are whole so'm digits only", () => {
  assert.equal(parseWholeSom("150 000"), 15_000_000);
  assert.equal(parseWholeSom("150,000"), null);
  assert.equal(parseWholeSom("1,5"), null);
  assert.equal(parseWholeSom("0"), null);
});
