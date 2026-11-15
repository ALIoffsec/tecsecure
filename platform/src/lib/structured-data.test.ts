import test from "node:test";
import assert from "node:assert/strict";
import { articleLd, courseLd, jsonLd, pageMetadata, siteGraph, snippet, socialUrl, splitPhones } from "./structured-data";

test("each page gets its own title, canonical and a share image", () => {
  const meta = pageMetadata({ path: "/services", title: "IT xizmatlari", description: "Tavsif" });
  assert.equal(meta.title, "IT xizmatlari");
  assert.equal(meta.alternates?.canonical, "/services");
  const og = meta.openGraph as { images: unknown[]; url: string; title: string };
  assert.equal(og.url, "/services");
  assert.equal(og.title, "IT xizmatlari | Tecsecure");
  assert.deepEqual((og.images[0] as { url: string }).url, "/opengraph-image");
  const home = pageMetadata({ path: "/", title: "Bosh | Tecsecure", description: "x", absoluteTitle: true, image: "/api/media/a" });
  assert.deepEqual(home.title, { absolute: "Bosh | Tecsecure" });
  assert.deepEqual((home.openGraph as { images: unknown[] }).images, ["/api/media/a"]);
});

test("snippets stay within the limit and end on a whole word", () => {
  assert.equal(snippet("Qisqa  matn\n"), "Qisqa matn");
  const long = snippet("so‘z ".repeat(80), 60);
  assert.ok(long.length <= 60);
  assert.ok(long.endsWith("…"));
});

test("contact settings become phones and profile links, never invented", () => {
  assert.deepEqual(splitPhones("+998 93 197 00 06\n+998 20 014 14 55, +998 99 078 21 02\n+998 93 197 00 06"), ["+998 93 197 00 06", "+998 20 014 14 55", "+998 99 078 21 02"]);
  assert.deepEqual(splitPhones(null), []);
  assert.equal(socialUrl("telegram", "@tecsecure_uz"), "https://t.me/tecsecure_uz");
  assert.equal(socialUrl("telegram", "t.me/tecsecure_uz"), "https://t.me/tecsecure_uz");
  assert.equal(socialUrl("instagram", "tecsecure.uz"), "https://instagram.com/tecsecure.uz");
  assert.equal(socialUrl("instagram", "https://instagram.com/tecsecure.uz"), "https://instagram.com/tecsecure.uz");
  assert.equal(socialUrl("instagram", ""), null);
  assert.equal(socialUrl("telegram", "bad name!"), null);
});

test("the home graph names the business, its contacts and the site search", () => {
  const graph = siteGraph({ origin: "https://tecsecure.uz", phones: ["+998 93 197 00 06", "+998 20 014 14 55"], email: "tecsecure.uz@gmail.com", sameAs: ["https://t.me/tecsecure_uz"] });
  const [org, business, site] = graph["@graph"] as Record<string, unknown>[];
  assert.equal(org["@type"], "Organization");
  assert.deepEqual(org.telephone, ["+998 93 197 00 06", "+998 20 014 14 55"]);
  assert.equal(business["@type"], "LocalBusiness");
  assert.deepEqual(business.address, { "@type": "PostalAddress", addressLocality: "Toshkent", addressCountry: "UZ" });
  assert.equal(((site.potentialAction as { target: { urlTemplate: string } }).target).urlTemplate, "https://tecsecure.uz/search?q={search_term_string}");
  const bare = siteGraph({ origin: "https://tecsecure.uz", phones: [], sameAs: [] })["@graph"][0] as Record<string, unknown>;
  assert.equal("telephone" in bare || "email" in bare || "sameAs" in bare, false);
});

test("articles and courses carry what rich results need, and the JSON is script-safe", () => {
  const article = articleLd({ origin: "https://tecsecure.uz", path: "/news/a", title: "Sarlavha", description: "Matn", publishedAt: new Date("2026-11-01T00:00:00Z"), updatedAt: new Date("2026-11-02T00:00:00Z") });
  assert.equal(article["@type"], "Article");
  assert.equal(article.datePublished, "2026-11-01T00:00:00.000Z");
  assert.deepEqual(article.image, ["https://tecsecure.uz/opengraph-image"]);
  const course = courseLd({ origin: "https://tecsecure.uz", path: "/learning/linux", name: "Linux", description: "Kurs", free: true });
  assert.equal((course.provider as { name: string }).name, "Tecsecure");
  assert.equal(jsonLd({ a: "</script>" }).includes("</"), false);
});
