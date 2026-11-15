import assert from "node:assert/strict";
import test from "node:test";
import { brandLogoSrc, defaultPartnerBrands, parsePartnerBrands, partnerBrandsSchema } from "./partner-brands";

const text = { uz: "", ru: "", en: "" };

test("with nothing saved the home page shows the bundled brand logos in two rows", () => {
  const brands = parsePartnerBrands(null);
  assert.equal(brands.rows[0].length + brands.rows[1].length, 13);
  assert.deepEqual(parsePartnerBrands("{broken"), defaultPartnerBrands);
});

test("logos are bundled files or uploaded media ids, never arbitrary URLs", () => {
  const ok = (logo: string) => partnerBrandsSchema.safeParse({ title: text, note: text, rows: [[{ name: "X", logo }], []] }).success;
  assert.equal(ok("/brands/cisco.svg"), true);
  assert.equal(ok("cmabcdefghijklmnopqrstuv"), true);
  assert.equal(ok("https://evil.example/logo.png"), false);
  assert.equal(ok("javascript:alert(1)"), false);
  assert.equal(ok("/brands/../secret.png"), false);
  assert.equal(brandLogoSrc("/brands/cisco.svg"), "/brands/cisco.svg");
  assert.equal(brandLogoSrc("cmabcdefghijklmnopqrstuv"), "/api/media/cmabcdefghijklmnopqrstuv");
});

test("each brand needs a name, and a row holds at most 30", () => {
  assert.equal(partnerBrandsSchema.safeParse({ title: text, note: text, rows: [[{ name: " ", logo: "/brands/cisco.svg" }], []] }).success, false);
  const many = Array.from({ length: 31 }, (_, i) => ({ name: `B${i}`, logo: "/brands/cisco.svg" }));
  assert.equal(partnerBrandsSchema.safeParse({ title: text, note: text, rows: [many, []] }).success, false);
});
