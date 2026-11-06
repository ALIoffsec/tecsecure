import assert from "node:assert/strict";
import test from "node:test";
import { completionsFor, editDistance, normalizeSearchText, prepareSearchDocument, scoreSearchDocument, searchTokens } from "./search-text";

const matches = (query: string, title: string, keywords = "", body = "") => scoreSearchDocument(searchTokens(query), prepareSearchDocument({ title, keywords, body })) > 0;

test("the same word typed different ways folds to one spelling", () => {
  const same = (a: string, b: string) => assert.equal(normalizeSearchText(a), normalizeSearchText(b), `${a} / ${b}`);
  same("o‘rnatish", "ornatish");
  same("o'rnatish", "oʻrnatish");
  same("Xizmat", "hizmat");
  same("камера", "kamera");
  same("camera", "kamera");
  same("коммутатор", "komutator");
  same("switch", "свитч");
});

test("suggestions start from the first letters someone types", () => {
  assert.ok(matches("ka", "IP videokamera tanlovi", "kamera"));
  assert.ok(matches("rou", "Router va switch to‘plami"));
  assert.ok(matches("kam", "IP kamera"));
  assert.ok(!matches("zzz", "IP kamera"));
});

test("a typo still finds the product", () => {
  assert.ok(matches("kamra", "IP kamera"));
  assert.ok(matches("ruoter", "Router va switch"));
  assert.ok(matches("firewal", "Firewall va tarmoq himoyasi"));
  assert.ok(matches("xavfsizlk", "Xavfsizlik tizimi"));
  assert.ok(!matches("kitob", "IP kamera"));
});

test("every typed word must match, in any order and any field", () => {
  assert.ok(matches("hikvision kamera", "Dome kamera 4 MP", "Hikvision"));
  assert.ok(matches("kamera hikvision", "Dome kamera 4 MP", "Hikvision"));
  assert.ok(!matches("kamera cisco", "Dome kamera 4 MP", "Hikvision"));
  assert.ok(matches("wifi", "Wi-Fi qamrovi"));
  assert.ok(matches("wi fi", "WiFi qamrovi") || matches("wi", "WiFi qamrovi"));
});

test("a title match outranks the same word further down", () => {
  const score = (title: string, keywords: string, body: string) => scoreSearchDocument(searchTokens("kamera"), prepareSearchDocument({ title, keywords, body }));
  assert.ok(score("IP kamera", "", "") > score("NVR", "kamera", ""));
  assert.ok(score("NVR", "kamera", "") > score("NVR", "", "kamera uchun"));
  assert.ok(score("Kamera tanlash", "", "") > score("IP kamera tanlash", "", ""));
});

test("completions finish the word being typed and keep the words already typed", () => {
  const titles = ["IP kamera tanlovi", "Kamera o‘rnatish", "Kabel 305 m"];
  assert.ok(completionsFor("ka", titles).includes("kamera"));
  assert.ok(completionsFor("ip ka", titles).some(item => item.startsWith("ip kamera")));
  assert.ok(!completionsFor("kamera", ["Kamera"]).includes("kamera"));
  assert.deepEqual(completionsFor("   ", titles), []);
});

test("edit distance counts a swap of neighbours as one mistake and stops at the limit", () => {
  assert.equal(editDistance("ruoter", "router", 2), 1);
  assert.equal(editDistance("kamera", "kamra", 2), 1);
  assert.equal(editDistance("kamera", "router", 1), 2);
});
