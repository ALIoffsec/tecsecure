import assert from "node:assert/strict";
import test from "node:test";
import { productKind } from "./product-kind";

test("current catalog items get distinct, fitting illustrations", () => {
  assert.equal(productKind({ name: "IP videokamera tanlovi", slug: "cctv-ip-kamera-tanlovi", categorySlug: "video-kuzatuv" }), "bullet");
  assert.equal(productKind({ name: "NVR va video saqlash tizimi", slug: "cctv-nvr-saqlash", categorySlug: "video-kuzatuv" }), "recorder");
  assert.equal(productKind({ name: "Router va switch to‘plami", slug: "tarmoq-router-switch", categorySlug: "tarmoq-uskunalari" }), "router");
  assert.equal(productKind({ name: "Wi‑Fi qamrov loyihasi", slug: "tarmoq-wifi-qamrov", categorySlug: "tarmoq-uskunalari" }), "wifi");
  assert.equal(productKind({ name: "Firewall va tarmoq himoyasi", slug: "xavfsizlik-firewall", categorySlug: "xavfsizlik" }), "firewall");
  assert.equal(productKind({ name: "Kirishni nazorat qilish tizimi", slug: "xavfsizlik-nazorat-kirish", categorySlug: "xavfsizlik" }), "access");
});

test("specific device words beat broad ones", () => {
  assert.equal(productKind({ name: "Hikvision Dome camera DS-2CD" }), "dome");
  assert.equal(productKind({ name: "UniFi PoE switch 24 port" }), "switch");
  assert.equal(productKind({ name: "Cat6 UTP kabel 305m" }), "cable");
});

test("falls back to the category, then a neutral box", () => {
  assert.equal(productKind({ name: "Model X1", categorySlug: "video-kuzatuv" }), "bullet");
  assert.equal(productKind({ name: "Model X1", categorySlug: "tarmoq-uskunalari" }), "switch");
  assert.equal(productKind({ name: "Model X1" }), "box");
  assert.equal(productKind({}), "box");
});
