import assert from "node:assert/strict";
import test from "node:test";
import { canCredit } from "./marketplace";
import { partRefundEffect, canMarkRefunded, canRejectReceipt, canReuploadReceipt, openPartRefunds, ownLinesShareMinor, partRefundMeta, partRefundRoom, wholeRefundMinor } from "./order-refunds";

const order = (status: string, paymentMethod: string, paymentStatus: string) => ({ status, paymentMethod, paymentStatus });

test("only a live card-transfer receipt under review can be refused", () => {
  assert.equal(canRejectReceipt(order("NEW", "CARD_TRANSFER", "AWAITING_CONFIRMATION")), true);
  assert.equal(canRejectReceipt(order("CANCELLED", "CARD_TRANSFER", "AWAITING_CONFIRMATION")), false);
  assert.equal(canRejectReceipt(order("NEW", "BANK_TRANSFER", "AWAITING_CONFIRMATION")), false);
  assert.equal(canRejectReceipt(order("NEW", "CARD_TRANSFER", "PAID")), false);
});

test("a new receipt is taken only after a refusal, never on a cancelled order", () => {
  assert.equal(canReuploadReceipt(order("NEW", "CARD_TRANSFER", "AWAITING_PAYMENT")), true);
  assert.equal(canReuploadReceipt(order("CANCELLED", "CARD_TRANSFER", "AWAITING_PAYMENT")), false);
  assert.equal(canReuploadReceipt(order("NEW", "CARD_TRANSFER", "AWAITING_CONFIRMATION")), false);
  assert.equal(canReuploadReceipt(order("NEW", "ONLINE_PAYME", "AWAITING_PAYMENT")), false);
});

test("a refund by hand is marked only when owed and not paid through Payme", () => {
  assert.equal(canMarkRefunded({ ...order("CANCELLED", "CARD_TRANSFER", "REFUND_DUE"), paymePerformed: false }), true);
  assert.equal(canMarkRefunded({ ...order("CANCELLED", "ONLINE_PAYME", "REFUND_DUE"), paymePerformed: true }), false);
  assert.equal(canMarkRefunded({ ...order("CANCELLED", "CARD_TRANSFER", "REFUNDED"), paymePerformed: false }), false);
});

test("two shops, one refunded by hand: the whole refund later never counts it twice", () => {
  // 300 000 total: shop A 100 000 (+ 10 000 delivery), shop B 150 000 (+ 10 000), own lines the rest.
  const parts = [{ itemsTotalMinor: 100_000, deliveryShareMinor: 10_000 }, { itemsTotalMinor: 150_000, deliveryShareMinor: 10_000 }];
  assert.equal(ownLinesShareMinor(300_000, parts), 30_000);
  assert.equal(ownLinesShareMinor(260_000, parts), null);
  assert.equal(ownLinesShareMinor(300_000, [{ itemsTotalMinor: null, deliveryShareMinor: null }]), null);
  const partA = 110_000;
  assert.equal(partRefundRoom(300_000, 0, partA), partA);
  assert.equal(wholeRefundMinor(300_000, partA), 190_000);
  assert.equal(partA + (wholeRefundMinor(300_000, partA) ?? 0), 300_000);
});

test("part refunds never pay out past the order total", () => {
  assert.equal(partRefundRoom(300_000, 250_000, 100_000), 50_000);
  assert.equal(partRefundRoom(300_000, 300_000, 1), 0);
  assert.equal(partRefundRoom(null, 0, 100), 0);
  assert.equal(partRefundRoom(300_000, 0, 0.5), 0);
});

test("the queue keeps each owed part once, drops paid ones and those covered by a whole refund", () => {
  const due = [
    { id: "d1", entity: "ShopOrder", entityId: "s1", orderId: "o1", amountMinor: 10, createdAt: "2026-01-01" },
    { id: "d2", entity: "ShopOrder", entityId: "s2", orderId: "o1", amountMinor: 20, createdAt: "2026-01-02" },
    { id: "d3", entity: "ShopOrder", entityId: "s2", orderId: "o1", amountMinor: 20, createdAt: "2026-01-03" },
    { id: "d4", entity: "Order", entityId: "o2", orderId: "o2", amountMinor: null, createdAt: "2026-01-04" }
  ];
  const open = openPartRefunds(due, [{ entity: "ShopOrder", entityId: "s1" }], id => id === "o1");
  assert.deepEqual(open.map(entry => entry.id), ["d2"]);
});

test("stored refund metadata is read defensively", () => {
  assert.deepEqual(partRefundMeta({ orderId: "o1", amountMinor: 500, shopName: "Do‘kon" }), { orderId: "o1", amountMinor: 500, shopName: "Do‘kon" });
  assert.deepEqual(partRefundMeta({ orderId: 5, amountMinor: -1 }), { orderId: null, amountMinor: null, shopName: null });
  assert.deepEqual(partRefundMeta(null), { orderId: null, amountMinor: null, shopName: null });
});

test("two shops, one refunded: the order stays paid and the other shop is still credited", () => {
  const order = { paymentMethod: "ONLINE_PAYME", paymentStatus: "PAID" };
  assert.equal(partRefundEffect(order, false), "QUEUE");
  const partB = { status: "DELIVERED", creditedAt: null, payoutMinor: 90_000, deliveredAt: new Date("2026-01-01"), disputedAt: null, disputeResolvedAt: null };
  assert.equal(canCredit(partB, order.paymentStatus, null, new Date("2026-02-01")), true);
  assert.equal(canCredit(partB, "REFUND_DUE", null, new Date("2026-02-01")), false);
});

test("a one-shop order refunded is owed back whole; a wallet order goes straight back", () => {
  assert.equal(partRefundEffect({ paymentMethod: "CARD_TRANSFER", paymentStatus: "PAID" }, true), "REFUND_DUE");
  assert.equal(partRefundEffect({ paymentMethod: "WALLET", paymentStatus: "PAID" }, false), "WALLET");
  assert.equal(partRefundEffect({ paymentMethod: "CASH", paymentStatus: "PENDING" }, false), "NONE");
});
