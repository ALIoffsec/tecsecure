import assert from "node:assert/strict";
import test from "node:test";
import { canAskToCancel, canCustomerCancel, selfCancelReason, defaultOrderFilter, orderFilterOf, orderNextStep, orderTitle, orderTrack, parseOrderFilter, rowAction } from "./customer-orders";

const o = (status: string, paymentMethod: string, paymentStatus: string, cancelRequested = false) => ({ status, paymentMethod, paymentStatus, cancelRequested });

test("a cancelled order with money still open stays in Active", () => {
  assert.equal(orderFilterOf(o("CANCELLED", "CARD_TRANSFER", "AWAITING_CONFIRMATION")), "active");
  assert.equal(orderFilterOf(o("CANCELLED", "ONLINE_PAYME", "REFUND_DUE")), "active");
  assert.equal(orderFilterOf(o("CANCELLED", "CARD_TRANSFER", "REFUNDED")), "cancelled");
  assert.equal(orderFilterOf(o("CANCELLED", "CASH", "PENDING")), "cancelled");
  assert.equal(orderFilterOf(o("SHIPPED", "CASH", "PENDING")), "active");
  assert.equal(orderFilterOf(o("DELIVERED", "CASH", "PAID")), "delivered");
});

test("Active by default, All when nothing is active; an unknown tab falls back the same way", () => {
  assert.equal(defaultOrderFilter({ active: 2, delivered: 1, cancelled: 0 }), "active");
  assert.equal(defaultOrderFilter({ active: 0, delivered: 3, cancelled: 1 }), "all");
  assert.equal(parseOrderFilter("delivered", { active: 2, delivered: 1, cancelled: 0 }), "delivered");
  assert.equal(parseOrderFilter("nonsense", { active: 0, delivered: 1, cancelled: 0 }), "all");
  assert.equal(parseOrderFilter(undefined, { active: 1, delivered: 0, cancelled: 0 }), "active");
});

test("the next step names what the buyer has to do first", () => {
  assert.equal(orderNextStep(o("NEW", "ONLINE_PAYME", "AWAITING_PAYMENT")), "payPayme");
  assert.equal(orderNextStep(o("NEW", "BANK_TRANSFER", "AWAITING_PAYMENT")), "payBank");
  assert.equal(orderNextStep(o("NEW", "CARD_TRANSFER", "AWAITING_PAYMENT")), "reupload");
  assert.equal(orderNextStep(o("NEW", "CARD_TRANSFER", "AWAITING_CONFIRMATION")), "checking");
  assert.equal(orderNextStep(o("CANCELLED", "CARD_TRANSFER", "AWAITING_CONFIRMATION")), "checking");
  assert.equal(orderNextStep(o("CANCELLED", "ONLINE_PAYME", "AWAITING_PAYMENT")), "cancelled");
  assert.equal(orderNextStep(o("CANCELLED", "ONLINE_PAYME", "REFUND_DUE")), "refundDue");
  assert.equal(orderNextStep(o("CONFIRMED", "CASH", "PENDING", true)), "cancelRequested");
  assert.equal(orderNextStep(o("SHIPPED", "CASH", "PENDING")), "onTheWay");
  assert.equal(orderNextStep(o("DELIVERED", "CASH", "PAID", true)), "delivered");
  assert.equal(rowAction("payPayme"), "pay");
  assert.equal(rowAction("reupload"), "reupload");
  assert.equal(rowAction("onTheWay"), null);
});

test("the buyer cancels alone only while everything is new; afterwards asks once", () => {
  const cash = (status: string) => ({ status, paymentMethod: "CASH", paymentStatus: "PENDING" });
  assert.equal(canCustomerCancel(cash("NEW"), [{ status: "NEW" }, { status: "NEW" }]), true);
  assert.equal(canCustomerCancel(cash("NEW"), [{ status: "NEW" }, { status: "CONFIRMED" }]), false);
  assert.equal(canCustomerCancel(cash("CONFIRMED"), []), false);
  assert.equal(canAskToCancel(cash("NEW"), [{ status: "CONFIRMED" }], false), true);
  assert.equal(canAskToCancel(cash("NEW"), [], false), false);
  assert.equal(canAskToCancel(cash("CONFIRMED"), [], false), true);
  assert.equal(canAskToCancel(cash("CONFIRMED"), [], true), false);
  assert.equal(canAskToCancel(cash("SHIPPED"), [], false), false);
});

test("a transfer that may already be on its way is cancelled only by staff", () => {
  const bank = { status: "NEW", paymentMethod: "BANK_TRANSFER", paymentStatus: "AWAITING_PAYMENT" };
  const card = { status: "NEW", paymentMethod: "CARD_TRANSFER", paymentStatus: "AWAITING_PAYMENT" };
  const payme = { status: "NEW", paymentMethod: "ONLINE_PAYME", paymentStatus: "AWAITING_PAYMENT" };
  assert.equal(canCustomerCancel(bank, []), false);
  assert.equal(canAskToCancel(bank, [], false), true);
  assert.equal(canCustomerCancel(card, []), false);
  assert.equal(canCustomerCancel(payme, []), true);
});

test("a cancel request is news only while the order has not moved on; self-cancel notes are recognised", () => {
  assert.equal(orderNextStep(o("PREPARING", "CASH", "PENDING", true)), "preparing");
  assert.equal(orderNextStep(o("SHIPPED", "CASH", "PENDING", true)), "onTheWay");
  assert.deepEqual(selfCancelReason("Mijoz bekor qildi: передумал"), { self: true, reason: "передумал" });
  assert.deepEqual(selfCancelReason("Mijoz bekor qildi"), { self: true, reason: null });
  assert.deepEqual(selfCancelReason("Omborda yo‘q"), { self: false, reason: "Omborda yo‘q" });
});

test("a row is titled by its first product", () => {
  assert.deepEqual(orderTitle([{ name: "Kamera" }, { name: "Kabel" }, { name: "Disk" }]), { first: "Kamera", more: 2 });
  assert.deepEqual(orderTitle([]), { first: null, more: 0 });
});

test("the progress line uses real dates only and skips notes that repeat a status", () => {
  const track = orderTrack("2026-01-01", [
    { fromStatus: null, toStatus: "NEW", createdAt: "2026-01-01" },
    { fromStatus: "NEW", toStatus: "NEW", createdAt: "2026-01-02" },
    { fromStatus: "NEW", toStatus: "CONFIRMED", createdAt: "2026-01-03" },
    { fromStatus: null, toStatus: "SHIPPED", createdAt: "2026-01-04" }
  ], "CONFIRMED");
  assert.deepEqual(track.dates, ["2026-01-01", "2026-01-03", null, null, null]);
  assert.equal(track.current, 1);
  assert.equal(orderTrack("2026-01-01", [], "CANCELLED").current, -1);
});
