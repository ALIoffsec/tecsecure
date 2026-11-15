import assert from "node:assert/strict";
import test from "node:test";
import { canCredit, canDispute, commissionFor, creditDueAt, isDisputeOpen, editNeedsReview, parsePayoutHold, parsePromotion, payoutDetailsSchema, promotionCost, promotionEnd, sellerProductSchema, shopOrderMoney, shopProductIsPublic, splitDelivery, stockStatusFor } from "./marketplace";

test("a shop's listing is public only when approved, not hidden by the shop, and the shop is active", () => {
  assert.equal(shopProductIsPublic("APPROVED", false, "ACTIVE"), true);
  assert.equal(shopProductIsPublic("PENDING", false, "ACTIVE"), false);
  assert.equal(shopProductIsPublic("REJECTED", false, "ACTIVE"), false);
  assert.equal(shopProductIsPublic("APPROVED", true, "ACTIVE"), false);
  assert.equal(shopProductIsPublic("APPROVED", false, "SUSPENDED"), false);
});

const base = { name: "IP kamera 4MP", description: "Tungi ko‘rish 30 m, PoE, H.265 siqish", categoryId: "c1", brand: "Hikvision", model: "DS-2CD1043", warrantyDescription: "12 oy", specifications: { Ruxsat: "4 MP" }, media: ["m1"], translations: undefined };

test("text, photos and details go back to review; price and stock do not", () => {
  assert.equal(editNeedsReview(base, { ...base }), false);
  assert.equal(editNeedsReview(base, { ...base, name: "IP kamera 8MP" }), true);
  assert.equal(editNeedsReview(base, { ...base, media: ["m1", "m2"] }), true);
  assert.equal(editNeedsReview(base, { ...base, specifications: { Ruxsat: "8 MP" } }), true);
  assert.equal(editNeedsReview({ ...base, brand: undefined }, { ...base, brand: "" }), false);
});

test("a product form needs at least one photo, a real description and a category", () => {
  const ok = { name: "IP kamera", description: "Yigirma belgidan uzun tavsif matni", categoryId: "cm1abcdefghijklmnopqrstu", priceMinor: 100000, currency: "UZS", stockQuantity: 5, media: ["cm2abcdefghijklmnopqrstu"] };
  assert.equal(sellerProductSchema.safeParse(ok).success, true);
  assert.equal(sellerProductSchema.safeParse({ ...ok, media: [] }).success, false);
  assert.equal(sellerProductSchema.safeParse({ ...ok, description: "qisqa" }).success, false);
  assert.equal(sellerProductSchema.safeParse({ ...ok, currency: "EUR" }).success, false);
  assert.equal(sellerProductSchema.safeParse({ ...ok, priceMinor: 0 }).success, false);
  assert.equal(sellerProductSchema.safeParse({ ...ok, shopId: "x" }).success, false);
});

test("a counted stock decides in or out of stock", () => {
  assert.equal(stockStatusFor(3, "UNKNOWN"), "IN_STOCK");
  assert.equal(stockStatusFor(0, "IN_STOCK"), "OUT_OF_STOCK");
  assert.equal(stockStatusFor(null, "ON_REQUEST"), "ON_REQUEST");
});

test("one delivery fee is shared by goods value, in whole so'm, and always adds up", () => {
  const shares = splitDelivery(30_000_00, [{ key: "tec", itemsMinor: 100_000_00 }, { key: "a", itemsMinor: 200_000_00 }]);
  assert.equal(shares.get("tec"), 10_000_00);
  assert.equal(shares.get("a"), 20_000_00);
  const odd = splitDelivery(10_000_00, [{ key: "a", itemsMinor: 1 }, { key: "b", itemsMinor: 1 }, { key: "c", itemsMinor: 1 }]);
  assert.equal([...odd.values()].reduce((s, v) => s + v, 0), 10_000_00);
  assert.equal([...odd.values()].every(v => v % 100 === 0), true);
  assert.equal(splitDelivery(null, [{ key: "a", itemsMinor: 1 }]).size, 0);
  assert.equal(splitDelivery(5_000_00, [{ key: "a", itemsMinor: 0 }]).get("a"), 5_000_00);
});

test("a shop earns goods less commission plus its delivery share", () => {
  assert.deepEqual(shopOrderMoney(1_000_000_00, 15, 20_000_00), { commissionMinor: 150_000_00, payoutMinor: 870_000_00 });
  assert.deepEqual(shopOrderMoney(null, 15, null), { commissionMinor: null, payoutMinor: null });
  const shop = { id: "s1", commissionPercent: 15, referralCommissionPercent: 10 };
  assert.equal(commissionFor(shop, "s1"), 10);
  assert.equal(commissionFor(shop, "s2"), 15);
  assert.equal(commissionFor(shop, null), 15);
});

test("earnings are credited once, only when delivered and paid", () => {
  assert.equal(canCredit({ status: "DELIVERED", creditedAt: null, payoutMinor: 100 }, "PAID"), true);
  assert.equal(canCredit({ status: "DELIVERED", creditedAt: new Date(), payoutMinor: 100 }, "PAID"), false);
  assert.equal(canCredit({ status: "SHIPPED", creditedAt: null, payoutMinor: 100 }, "PAID"), false);
  assert.equal(canCredit({ status: "DELIVERED", creditedAt: null, payoutMinor: 100 }, "PENDING"), false);
  assert.equal(canCredit({ status: "DELIVERED", creditedAt: null, payoutMinor: null }, "PAID"), false);
});

test("a buyer's open complaint keeps the money back until staff decide; one complaint per part", () => {
  const part = { status: "DELIVERED", creditedAt: null, payoutMinor: 100, deliveredAt: new Date("2026-11-01T00:00:00Z") };
  const disputedAt = new Date("2026-11-02T00:00:00Z");
  assert.equal(canCredit({ ...part, disputedAt }, "PAID"), false);
  assert.equal(canCredit({ ...part, disputedAt, disputeResolvedAt: new Date() }, "PAID"), true);
  assert.equal(isDisputeOpen({ disputedAt: null }), false);
  assert.equal(isDisputeOpen({ disputedAt }), true);
  assert.equal(canDispute({ status: "DELIVERED", creditedAt: null, disputedAt: null }), true);
  assert.equal(canDispute({ status: "SHIPPED" }), true);
  assert.equal(canDispute({ status: "CONFIRMED" }), false);
  assert.equal(canDispute({ status: "DELIVERED", creditedAt: new Date() }), false);
  assert.equal(canDispute({ status: "DELIVERED", disputedAt }), false);
});

test("a hold set by staff keeps delivered money back until it passes; no hold pays on delivery", () => {
  assert.deepEqual(parsePayoutHold(null), { days: null });
  assert.deepEqual(parsePayoutHold("{\"days\":0}"), { days: null });
  assert.deepEqual(parsePayoutHold("{\"days\":3}"), { days: 3 });
  const deliveredAt = new Date("2026-11-10T12:00:00Z");
  const part = { status: "DELIVERED", creditedAt: null, payoutMinor: 100, deliveredAt };
  assert.equal(creditDueAt(deliveredAt, null), null);
  assert.equal(creditDueAt(deliveredAt, 3)?.toISOString(), "2026-11-13T12:00:00.000Z");
  assert.equal(canCredit(part, "PAID", null, new Date("2026-11-10T12:00:01Z")), true);
  assert.equal(canCredit(part, "PAID", 3, new Date("2026-11-13T11:59:59Z")), false);
  assert.equal(canCredit(part, "PAID", 3, new Date("2026-11-13T12:00:00Z")), true);
  assert.equal(canCredit(part, "PENDING", 3, new Date("2026-12-01T00:00:00Z")), false);
});

test("paid placement costs nothing until staff set a price, and stays within the day limit", () => {
  const off = parsePromotion(null);
  assert.equal(promotionCost(off, 3), null);
  const on = parsePromotion(JSON.stringify({ pricePerDayMinor: 5_000_00, maxDays: 14 }));
  assert.equal(promotionCost(on, 3), 15_000_00);
  assert.equal(promotionCost(on, 15), null);
  assert.equal(promotionCost(on, 0), null);
  const now = new Date("2026-11-15T00:00:00Z");
  assert.equal(promotionEnd(null, 2, now).toISOString(), "2026-11-17T00:00:00.000Z");
  assert.equal(promotionEnd(new Date("2026-11-20T00:00:00Z"), 1, now).toISOString(), "2026-11-21T00:00:00.000Z");
});

test("payouts go to a business bank account, never a card", () => {
  const ok = { payoutBankName: "Kapitalbank", payoutAccount: "2020 8000 1234 5678 9012", payoutMfo: "01088", payoutRecipient: "Kamera Markazi MChJ" };
  const parsed = payoutDetailsSchema.safeParse(ok);
  assert.equal(parsed.success && parsed.data.payoutAccount, "20208000123456789012");
  assert.equal(payoutDetailsSchema.safeParse({ ...ok, payoutAccount: "8600123412341234" }).success, false);
  assert.equal(payoutDetailsSchema.safeParse({ ...ok, payoutMfo: "1088" }).success, false);
});
