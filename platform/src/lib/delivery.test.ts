import assert from "node:assert/strict";
import test from "node:test";
import { deliveryOptions, deliveryTime, emptyTariffs, parseTariffs, tariffsConfigured, vatPart, type DeliveryTariffs } from "./delivery";
import { toUzsMinor } from "./currency";
import { orderSchema } from "./orders";

const tariffs: DeliveryTariffs = {
  regions: {
    TASHKENT_CITY: { express: 25_000, expressDays: [0, 1], courier: null, courierDays: [1, 3] },
    SAMARKAND: { express: null, expressDays: [0, 1], courier: 40_000, courierDays: [2, 3] }
  },
  pickup: { enabled: true, address: "Chilonzor 1" },
  freeFrom: 5_000_000
};

test("a region gets only the methods priced for it, in tiyin, plus pickup", () => {
  assert.deepEqual(deliveryOptions(tariffs, "TASHKENT_CITY", 100_000_00).map(o => [o.method, o.feeMinor]), [["EXPRESS", 2_500_000], ["PICKUP", 0]]);
  assert.deepEqual(deliveryOptions(tariffs, "SAMARKAND", 100_000_00).map(o => [o.method, o.feeMinor]), [["COURIER", 4_000_000], ["PICKUP", 0]]);
  assert.deepEqual(deliveryOptions(tariffs, "NAVOI", 100_000_00).map(o => o.method), ["PICKUP"]);
  assert.deepEqual(deliveryOptions(emptyTariffs, "NAVOI", 100_000_00), []);
});

test("couriers become free from the threshold, and an unknown goods total never earns it", () => {
  const free = deliveryOptions(tariffs, "SAMARKAND", 5_000_000_00);
  assert.equal(free[0].feeMinor, 0);
  assert.equal(free[0].free, true);
  assert.equal(deliveryOptions(tariffs, "SAMARKAND", 4_999_999_00)[0].feeMinor, 4_000_000);
  assert.equal(deliveryOptions(tariffs, "SAMARKAND", null)[0].feeMinor, 4_000_000);
});

test("saved tariffs that are broken or missing fall back to nothing configured", () => {
  assert.deepEqual(parseTariffs(null), emptyTariffs);
  assert.deepEqual(parseTariffs("{not json"), emptyTariffs);
  assert.deepEqual(parseTariffs(JSON.stringify({ regions: { TASHKENT_CITY: { express: -5 } } })), emptyTariffs);
  assert.equal(tariffsConfigured(emptyTariffs), false);
  assert.equal(tariffsConfigured(tariffs), true);
  assert.equal(parseTariffs(JSON.stringify(tariffs)).regions.SAMARKAND?.courier, 40_000);
});

test("delivery time reads naturally in each language", () => {
  assert.equal(deliveryTime([0, 1], "uz"), "bugun yoki ertaga");
  assert.equal(deliveryTime([2, 3], "ru"), "2–3 дн.");
  assert.equal(deliveryTime([1, 1], "en"), "tomorrow");
  assert.equal(deliveryTime([3, 3], "uz"), "3 kun");
});

test("dollar prices become whole so'm at the given rate; unknown currencies and missing rates give null", () => {
  const rates = { rates: { UZS: 1, USD: 12_850.5, RUB: 140.2 }, date: "09.11.2026" };
  assert.equal(toUzsMinor(4230_00, "USD", rates), 54_357_615_00);
  assert.equal(toUzsMinor(1_250_000_50, "UZS", null), 1_250_001_00);
  assert.equal(toUzsMinor(100_00, "USD", null), null);
  assert.equal(toUzsMinor(100_00, "EUR", rates), null);
});

test("VAT already inside a price is 12/112 of it, in whole so'm", () => {
  assert.equal(vatPart(112_000_00), 12_000_00);
  assert.equal(vatPart(1_000_00), 107_00);
});

test("pickup orders need no address; delivered ones still do", () => {
  const order = { recipientName: "Ali", phone: "+998901234567", city: "Toshkent", paymentMethod: "CASH", items: [{ productId: "p1", quantity: 1 }] };
  assert.equal(orderSchema.safeParse({ ...order, region: "TASHKENT_CITY", deliveryMethod: "PICKUP" }).success, true);
  assert.equal(orderSchema.safeParse({ ...order, region: "TASHKENT_CITY", deliveryMethod: "EXPRESS" }).success, false);
  assert.equal(orderSchema.safeParse({ ...order, region: "MARS", deliveryMethod: "EXPRESS", address: "Ko'cha 12" }).success, false);
});
