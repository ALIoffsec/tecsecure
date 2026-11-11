import assert from "node:assert/strict";
import test from "node:test";
import { pickShowcase } from "./home-showcase";

const item = (id: string, name: string, category: string) => ({ id, name, category: { name: category, slug: category.toLowerCase() } });

test("the home showcase takes one product per category, cameras and switches first, not a row of cabinets", () => {
  const products = [
    item("r1", "Шкаф 42U", "Telekommunikatsiya shkaflari"), item("r2", "Шкаф 9U", "Telekommunikatsiya shkaflari"), item("r3", "Шкаф 32U", "Telekommunikatsiya shkaflari"),
    item("c1", "Hikvision 4 MP IP kamera", "Kameralar"), item("s1", "TP-Link 16 portli PoE kommutator", "Kommutatorlar"), item("n1", "MikroTik router", "Tarmoq uskunalari")
  ];
  assert.deepEqual(pickShowcase(products, 4).map(product => product.id), ["c1", "s1", "n1", "r1"]);
  assert.deepEqual(pickShowcase(products, 3).map(product => product.id), ["c1", "s1", "n1"]);
});

test("with fewer categories than places the showcase still fills up without repeats", () => {
  const products = [item("a", "Kamera A", "Kameralar"), item("b", "Kamera B", "Kameralar"), item("c", "Kamera C", "Kameralar")];
  const picked = pickShowcase(products, 2).map(product => product.id);
  assert.equal(picked.length, 2);
  assert.equal(new Set(picked).size, 2);
});
