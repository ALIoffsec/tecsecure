import assert from "node:assert/strict";
import test from "node:test";
import { canTransition, mergeItems, orderSchema } from "./orders";

test("order status transitions are forward-only", () => {
  assert.equal(canTransition("NEW", "CONFIRMED"), true);
  assert.equal(canTransition("NEW", "DELIVERED"), false);
  assert.equal(canTransition("SHIPPED", "CANCELLED"), false);
  assert.equal(canTransition("DELIVERED", "NEW"), false);
  assert.equal(canTransition("CANCELLED", "NEW"), false);
});

test("order schema rejects out-of-range coordinates and empty carts", () => {
  const base = { paymentMethod: "CASH" as const, recipientName: "Ali", phone: "+998901234567", city: "Toshkent", address: "Amir Temur 1", items: [{ productId: "p1", quantity: 1 }] };
  assert.equal(orderSchema.safeParse(base).success, true);
  assert.equal(orderSchema.safeParse({ ...base, latitude: 10, longitude: 69 }).success, false);
  assert.equal(orderSchema.safeParse({ ...base, items: [] }).success, false);
  assert.equal(orderSchema.safeParse({ ...base, items: [{ productId: "p1", quantity: 0 }] }).success, false);
});

test("order location name is optional when coordinates or location details in note are provided", () => {
  const base = { paymentMethod: "CASH" as const, recipientName: "Ali", phone: "+998901234567", city: "Toshkent", address: "", items: [{ productId: "p1", quantity: 1 }] };
  assert.equal(orderSchema.safeParse({ ...base, latitude: 41.31, longitude: 69.24 }).success, true);
  assert.equal(orderSchema.safeParse({ ...base, note: "Ko‘cha 12, 4-uy, 3-qavat" }).success, true);
  assert.equal(orderSchema.safeParse(base).success, false);
});

test("mergeItems combines duplicate products", () => {
  assert.deepEqual(mergeItems([{ productId: "a", quantity: 2 }, { productId: "a", quantity: 3 }, { productId: "b", quantity: 1 }]), [
    { productId: "a", quantity: 5 },
    { productId: "b", quantity: 1 }
  ]);
});

test("a transfer needs its receipt and an unknown method is refused", () => {
  const order = { recipientName: "Ali Valiyev", phone: "+998901234567", city: "Toshkent", address: "Chilonzor 5", items: [{ productId: "p1", quantity: 1 }] };
  assert.equal(orderSchema.safeParse(order).success, false);
  assert.equal(orderSchema.safeParse({ ...order, paymentMethod: "BITCOIN" }).success, false);
  assert.equal(orderSchema.safeParse({ ...order, paymentMethod: "CARD_TRANSFER" }).success, false);
  assert.equal(orderSchema.safeParse({ ...order, paymentMethod: "CARD_TRANSFER", paymentProofMediaId: "cmw4twpjs000zahbkomt47cah" }).success, true);
  for (const paymentMethod of ["CASH", "CARD_ON_DELIVERY", "WALLET"]) assert.equal(orderSchema.safeParse({ ...order, paymentMethod }).success, true);
});

test("card numbers have nowhere to go: the order accepts no card fields", () => {
  const parsed = orderSchema.safeParse({ recipientName: "Ali Valiyev", phone: "+998901234567", city: "Toshkent", address: "Chilonzor 5", paymentMethod: "CASH", cardNumber: "8600123456789012", items: [{ productId: "p1", quantity: 1 }] });
  assert.equal(parsed.success, true);
  assert.equal("cardNumber" in (parsed.data ?? {}), false);
});
