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
  const base = { recipientName: "Ali", phone: "+998901234567", city: "Toshkent", address: "Amir Temur 1", items: [{ productId: "p1", quantity: 1 }] };
  assert.equal(orderSchema.safeParse(base).success, true);
  assert.equal(orderSchema.safeParse({ ...base, latitude: 10, longitude: 69 }).success, false);
  assert.equal(orderSchema.safeParse({ ...base, items: [] }).success, false);
  assert.equal(orderSchema.safeParse({ ...base, items: [{ productId: "p1", quantity: 0 }] }).success, false);
});

test("mergeItems combines duplicate products", () => {
  assert.deepEqual(mergeItems([{ productId: "a", quantity: 2 }, { productId: "a", quantity: 3 }, { productId: "b", quantity: 1 }]), [
    { productId: "a", quantity: 5 },
    { productId: "b", quantity: 1 }
  ]);
});
