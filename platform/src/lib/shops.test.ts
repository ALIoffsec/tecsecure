import assert from "node:assert/strict";
import test from "node:test";
import { nextShopStatus, shopProfileSchema, shopReviewSchema, shopShare, shopSlug } from "./shops";

test("shop links are short Latin words, whatever script the name is in", () => {
  assert.equal(shopSlug("Kamera Markazi"), "kamera-markazi");
  assert.equal(shopSlug("Камера Центр"), "kamera-tsentr");
  assert.equal(shopSlug("Qo‘riqchi Servis!!"), "qoriqchi-servis");
  assert.equal(shopSlug("ЎзТехно"), "oztexno");
  assert.equal(shopSlug("★★★"), "dokon");
  assert.ok(shopSlug("a".repeat(80)).length <= 40);
});

test("staff actions move a shop only along the allowed paths", () => {
  assert.equal(nextShopStatus("PENDING", "APPROVE"), "ACTIVE");
  assert.equal(nextShopStatus("PENDING", "REJECT"), "REJECTED");
  assert.equal(nextShopStatus("REJECTED", "APPROVE"), "ACTIVE");
  assert.equal(nextShopStatus("ACTIVE", "SUSPEND"), "SUSPENDED");
  assert.equal(nextShopStatus("SUSPENDED", "REACTIVATE"), "ACTIVE");
  assert.equal(nextShopStatus("ACTIVE", "REJECT"), null);
  assert.equal(nextShopStatus("ACTIVE", "APPROVE"), null);
  assert.equal(nextShopStatus("PENDING", "SUSPEND"), null);
  assert.equal(nextShopStatus("SUSPENDED", "UPDATE"), "SUSPENDED");
});

test("commission is taken in whole so'm and the rest belongs to the shop", () => {
  assert.deepEqual(shopShare(1_000_000_00, 15), { commissionMinor: 150_000_00, payoutMinor: 850_000_00 });
  assert.deepEqual(shopShare(1_000_000_00, 10), { commissionMinor: 100_000_00, payoutMinor: 900_000_00 });
  const odd = shopShare(333_333_00, 15);
  assert.equal(odd.commissionMinor % 100, 0);
  assert.equal(odd.commissionMinor + odd.payoutMinor, 333_333_00);
});

test("an application needs real contact, address and tax details", () => {
  const good = { name: "Kamera Markazi", phone: "+998 90 123 45 67", region: "SAMARKAND", city: "Samarqand", address: "Registon ko'chasi 5", legalName: "Kamera Markazi MCHJ", tin: "123456789" };
  assert.equal(shopProfileSchema.safeParse(good).success, true);
  assert.equal(shopProfileSchema.safeParse({ ...good, tin: "12345" }).success, false);
  assert.equal(shopProfileSchema.safeParse({ ...good, tin: "12345678901234" }).success, true);
  assert.equal(shopProfileSchema.safeParse({ ...good, region: "MOON" }).success, false);
  assert.equal(shopProfileSchema.safeParse({ ...good, instagram: "bad handle!" }).success, false);
});

test("rejecting a shop always says why", () => {
  assert.equal(shopReviewSchema.safeParse({ action: "REJECT" }).success, false);
  assert.equal(shopReviewSchema.safeParse({ action: "REJECT", note: "STIR noto'g'ri" }).success, true);
  assert.equal(shopReviewSchema.safeParse({ action: "APPROVE", commissionPercent: 60 }).success, false);
});
