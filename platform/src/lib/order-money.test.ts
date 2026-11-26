import assert from "node:assert/strict";
import test from "node:test";
import { paymeRefusal } from "./payme";
import { refundRoom } from "./order-flow";

const open = { paymentMethod: "ONLINE_PAYME", paymentStatus: "AWAITING_PAYMENT", status: "NEW", currency: "UZS", totalMinor: 100_000 };

test("Payme takes money only for an open, unpaid order of the exact total", () => {
  assert.equal(paymeRefusal(open, 100_000), null);
  assert.equal(paymeRefusal({ ...open, status: "CANCELLED" }, 100_000), "notPayable");
  assert.equal(paymeRefusal({ ...open, paymentStatus: "PAID" }, 100_000), "notPayable");
  assert.equal(paymeRefusal({ ...open, paymentStatus: "REFUND_DUE" }, 100_000), "notPayable");
  assert.equal(paymeRefusal({ ...open, paymentMethod: "WALLET" }, 100_000), "notPayable");
  assert.equal(paymeRefusal(open, 99_999), "wrongAmount");
  assert.equal(paymeRefusal({ ...open, totalMinor: null }, 100_000), "wrongAmount");
});

test("refunds to the wallet together never exceed what the order cost", () => {
  // A shop part refunded first, then the whole order cancelled: the second refund only gets the rest.
  assert.equal(refundRoom(100_000, 0, 40_000), 40_000);
  assert.equal(refundRoom(100_000, 40_000, 100_000), 60_000);
  // Same steps the other way round: nothing is left for the part.
  assert.equal(refundRoom(100_000, 100_000, 40_000), 0);
  assert.equal(refundRoom(100_000, 120_000, 1), 0);
  assert.equal(refundRoom(null, 0, 5_000), 0);
});

test("a cancelled order is never confirmed as paid; its unchecked receipt waits for a staff decision", async () => {
  const { canConfirmPayment, needsCancelledReceiptDecision } = await import("./orders");
  const receipt = { status: "NEW", paymentStatus: "AWAITING_CONFIRMATION", paymentMethod: "CARD_TRANSFER" };
  assert.equal(canConfirmPayment(receipt), true);
  assert.equal(canConfirmPayment({ ...receipt, status: "CANCELLED" }), false);
  assert.equal(needsCancelledReceiptDecision({ ...receipt, status: "CANCELLED" }), true);
  assert.equal(needsCancelledReceiptDecision(receipt), false);
  assert.equal(canConfirmPayment({ status: "NEW", paymentStatus: "AWAITING_PAYMENT", paymentMethod: "BANK_TRANSFER" }), true);
  assert.equal(canConfirmPayment({ status: "CANCELLED", paymentStatus: "AWAITING_PAYMENT", paymentMethod: "BANK_TRANSFER" }), false);
});
