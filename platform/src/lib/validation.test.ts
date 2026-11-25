import assert from "node:assert/strict";
import test from "node:test";
import { isReservedEmail, productSchema, projectSchema, registerSchema, requestSchema, serviceSchema, standInEmail } from "./validation";
import { translateMessage } from "./server-messages";
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

test("addresses the site gives to phone, Telegram and deleted accounts cannot be typed in", () => {
  for (const email of ["phone-998901234567@accounts.tecsecure.invalid", "TG-1@Accounts.Tecsecure.Invalid", "deleted-x@deleted.invalid", "a@sub.deleted.invalid"]) assert.equal(isReservedEmail(email), true, email);
  for (const email of ["ali@gmail.com", "me@tecsecure.uz", "x@invalid.example.com"]) assert.equal(isReservedEmail(email), false, email);
  assert.equal(registerSchema.safeParse({ name: "Ali", email: "phone-1@accounts.tecsecure.invalid", password: "12345678" }).success, false);
  assert.equal(registerSchema.safeParse({ name: "Ali", email: "ali@example.com", password: "12345678" }).success, true);
});

test("stand-in addresses are random, so a taken one never blocks a new account", () => {
  const first = standInEmail("phone");
  assert.match(first, /^phone-[0-9a-f]{16}@accounts\.tecsecure\.invalid$/);
  assert.match(standInEmail("tg"), /^tg-[0-9a-f]{16}@accounts\.tecsecure\.invalid$/);
  assert.notEqual(first, standInEmail("phone"));
  assert.equal(isReservedEmail(first), true);
});

test("the wait time in a limit message is translated with its number", () => {
  const text = "Urinishlar limiti oshdi. 12 daqiqadan so‘ng qayta urinib ko‘ring.";
  assert.equal(translateMessage(text, "uz"), text);
  assert.equal(translateMessage(text, "ru"), "Слишком много попыток. Повторите через 12 мин.");
  assert.equal(translateMessage(text, "en"), "Too many attempts. Try again in 12 min.");
});
