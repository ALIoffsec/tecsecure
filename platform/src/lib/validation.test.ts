import assert from "node:assert/strict";
import test from "node:test";
import { productSchema, projectSchema, requestSchema, serviceSchema } from "./validation";
import { convertMinorAmount, parseCbuRates } from "./currency";
import { formatProductDetails, parseProductDetails } from "./product-details";

const validCuid = "c12345678901234567890123";

test("service media validation accepts its limit and rejects one extra item", () => {
  const service = {
    name: "Network security",
    description: "A complete network security service description.",
    media: Array.from({ length: 20 }, () => validCuid)
  };

  assert.equal(serviceSchema.safeParse(service).success, true);
  assert.equal(serviceSchema.safeParse({ ...service, media: [...service.media, validCuid] }).success, false);
});

test("project validation accepts its item limit and rejects one extra item", () => {
  const project = {
    name: "Office network",
    items: Array.from({ length: 100 }, () => ({ productId: validCuid, quantity: 1 }))
  };

  assert.equal(projectSchema.safeParse(project).success, true);
  assert.equal(projectSchema.safeParse({ ...project, items: [...project.items, project.items[0]] }).success, false);
});

test("guest quote request can be submitted with phone, project description, and consent only", () => {
  assert.equal(requestSchema.safeParse({
    name: "Guest customer",
    phone: "+998901234567",
    description: "Need a quote for a small office network installation.",
    consent: true
  }).success, true);
});

test("product supports category, specs, compatibility, and image/video media ids", () => {
  const product = {
    name: "Managed network switch",
    description: "A managed switch for a small business network.",
    categoryId: validCuid,
    specifications: { ports: 24, poe: true, speed: "1 Gbit/s" },
    compatibility: ["Windows", "Linux"],
    media: Array.from({ length: 20 }, () => validCuid),
    status: "PUBLISHED"
  };

  assert.equal(productSchema.safeParse(product).success, true);
  assert.equal(productSchema.safeParse({ ...product, categoryId: "invalid" }).success, false);
  assert.equal(productSchema.safeParse({ ...product, specifications: ["not", "an", "object"] }).success, false);
  assert.equal(productSchema.safeParse({ ...product, compatibility: [42] }).success, false);
});

test("product details accept readable text and preserve JSON input", () => {
  assert.deepEqual(parseProductDetails("Portlar: 8\nTezlik: 1 Gbit/s\nPoE: true", "specifications"), {
    Portlar: 8,
    Tezlik: "1 Gbit/s",
    PoE: true
  });
  assert.deepEqual(parseProductDetails("Windows\nLinux\nAndroid", "compatibility"), ["Windows", "Linux", "Android"]);
  assert.deepEqual(parseProductDetails('{"ports": 8}', "specifications"), { ports: 8 });
  assert.deepEqual(parseProductDetails('["Windows", "Linux"]', "compatibility"), ["Windows", "Linux"]);
  assert.equal(formatProductDetails({ ports: 8, poe: true }), "ports: 8\npoe: true");
  assert.throws(() => parseProductDetails("Ports: 8\nPorts: 16", "specifications"), /takrorlangan/);
  assert.throws(() => parseProductDetails("{invalid}", "specifications"), /JSON formati noto‘g‘ri/);
});

test("currency conversion normalizes CBU rates by nominal", () => {
  const rates = parseCbuRates([
    { Ccy: "USD", Nominal: "1", Rate: "10000", Date: "24.10.2026" },
    { Ccy: "RUB", Nominal: "10", Rate: "1000", Date: "24.10.2026" }
  ]);
  assert.deepEqual(rates, { rates: { UZS: 1, RUB: 100, USD: 10000 }, date: "24.10.2026" });
  assert.equal(convertMinorAmount(1_200_000, "UZS", "USD", rates.rates), 1.2);
  assert.equal(convertMinorAmount(10_000, "USD", "RUB", rates.rates), 10_000);
  assert.equal(convertMinorAmount(10_000, "EUR", "UZS", rates.rates), null);
});
