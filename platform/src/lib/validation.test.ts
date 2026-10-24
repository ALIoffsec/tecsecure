import assert from "node:assert/strict";
import test from "node:test";
import { productSchema, projectSchema, requestSchema, serviceSchema } from "./validation";

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
