import assert from "node:assert/strict";
import test from "node:test";
import { comparisonIds, coverMedia, detailRows, mediaIds, orderedMedia, priceBound, pricesMatch, specificationFilter } from "./catalog-utils";
import { journeyCopy, inquiryHref } from "./journey-copy";
import { serviceJourneys, serviceGuideCopy } from "./service-journeys";
import { shopCopy } from "./shop-copy";
import { requestSchema } from "./validation";
import { isSiteDesign, siteDesigns } from "./site-designs";
import { featureCopy } from "./feature-copy";
import { runInNewContext } from "node:vm";
import { introBootstrapScript } from "./burning-intro";

const imageId = "cmvlh53hj0004ah44ymdya5v6";
const videoId = "cmvlh53hn0006ah44cfksofgx";
const thirdId = "cmvlh53ho0008ah44xr9ihwqw";
const fourthId = "cmvlh53hq000aah4483y8isn9";

test("adapted interface effects have complete Uzbek, Russian and English copy", () => {
  for (const locale of ["uz", "ru", "en"] as const) {
    assert.deepEqual(Object.keys(featureCopy[locale]).sort(), Object.keys(featureCopy.uz).sort());
    for (const value of Object.values(featureCopy[locale])) assert.ok(value.trim().length > 0);
  }
});

test("cinematic opening replays every document entry, honors reduced motion and cannot trap an unhydrated page", () => {
  for (const [reduced, expected] of [[false, "pending"], [true, undefined], [false, "pending"]] as const) {
    const dataset: Record<string, string> = {};
    let safety: (() => void) | undefined;
    runInNewContext(introBootstrapScript, {
      document: { documentElement: { dataset }, querySelector: () => null, addEventListener: () => {} },
      matchMedia: () => ({ matches: reduced }),
      sessionStorage: { getItem: () => { throw new Error("Intro must not depend on session storage"); } },
      setTimeout: (callback: () => void, delay: number) => { assert.equal(delay, 10000); safety = callback; },
      console
    });
    assert.equal(dataset.tecIntro, expected);
    safety?.();
    assert.equal(dataset.tecIntro, undefined);
  }
});

test("hydrated intro owns its timeout so the bootstrap timer cannot close a later replay", () => {
  let ready: (() => void) | undefined;
  let cleared = false;
  runInNewContext(introBootstrapScript, {
    document: { documentElement: { dataset: {} }, addEventListener: (name: string, callback: () => void) => { assert.equal(name, "tecsecure:intro-ready"); ready = callback; } },
    matchMedia: () => ({ matches: false }),
    setTimeout: () => 42,
    clearTimeout: (id: number) => { assert.equal(id, 42); cleared = true; }
  });
  ready?.();
  assert.equal(cleared, true);
});

test("liquid glass is a valid design without dropping existing appearance profiles", () => {
  assert.equal(isSiteDesign("liquid"), true);
  assert.equal(new Set(siteDesigns).size, siteDesigns.length);
  for (const design of ["midnight", "ocean", "forest", "ember", "violet", "editorial", "terminal"]) assert.equal(isSiteDesign(design), true);
  for (const value of [undefined, null, "", "LIQUID", "../liquid"]) assert.equal(isSiteDesign(value), false);
});

test("product covers prefer actual images over video without changing gallery order", () => {
  const image = { id: imageId, mimeType: "image/png" };
  const video = { id: videoId, mimeType: "video/mp4" };
  const unsupported = { id: thirdId, mimeType: "application/pdf" };
  const assets = orderedMedia([videoId, imageId, imageId, thirdId, fourthId], [image, video, unsupported]);
  assert.deepEqual(assets, [video, image]);
  assert.deepEqual(coverMedia(assets), image);
  assert.deepEqual(coverMedia([video]), video);
  assert.equal(coverMedia([]), undefined);
  assert.deepEqual(mediaIds([null, "../private", 123, imageId, imageId]), [imageId]);
  assert.deepEqual(mediaIds(null), []);
});

test("comparison ids are unique, bounded and reject arbitrary paths", () => {
  assert.deepEqual(comparisonIds(`${imageId},${imageId},${videoId},../bad,${thirdId},${fourthId}`), [imageId, videoId, thirdId]);
  assert.deepEqual(comparisonIds(undefined), []);
});

test("price bounds preserve cents and do not accept negatives, exponents or overflow", () => {
  assert.equal(priceBound("0"), 0);
  assert.equal(priceBound("12.34"), 1234);
  assert.equal(priceBound("20000000"), 2_000_000_000);
  for (const raw of ["", "-1", "NaN", "1e4", "12.345", "20000001", "Infinity"]) assert.equal(priceBound(raw), undefined);
});

test("specification filters preserve boolean and numeric types", () => {
  assert.deepEqual(specificationFilter('["PoE",true]'), { key: "PoE", value: true });
  assert.deepEqual(specificationFilter('["ports",8]'), { key: "ports", value: 8 });
  for (const raw of ["bad", "[]", '["",4]', '["ports",{}]']) assert.equal(specificationFilter(raw), null);
  assert.deepEqual(detailRows({ ports: 8, PoE: false, unsupported: { child: 1 } }), [["ports", "8"], ["PoE", "false"]]);
});

test("checkout detects price, currency, availability and item-set changes", () => {
  const product = { id: imageId, priceMinor: 125000, currency: "UZS", stockStatus: "IN_STOCK" };
  assert.equal(pricesMatch([product], [product]), true);
  for (const changed of [{ ...product, priceMinor: null }, { ...product, priceMinor: 150000 }, { ...product, currency: "USD" }, { ...product, stockStatus: "ON_REQUEST" }, { ...product, id: videoId }]) {
    assert.equal(pricesMatch([product], [changed]), false);
  }
  assert.equal(pricesMatch([product], []), false);
  assert.equal(pricesMatch([product, product], [product, product]), false);
});

test("callback requests require a real phone and consent but not name or description", () => {
  const data = { mode: "callback", phone: "+998 90 123 45 67", consent: true, topic: "Wi-Fi" };
  const parsed = requestSchema.parse(data);
  assert.match(parsed.name, /Ism ko‘rsatilmagan/);
  assert.match(parsed.description, /Qayta qo‘ng‘iroq/);
  assert.match(parsed.description, /Wi-Fi/);
  assert.equal(requestSchema.safeParse({ ...data, consent: false }).success, false);
  assert.equal(requestSchema.safeParse({ ...data, phone: "abcdefghi" }).success, false);
  assert.equal(requestSchema.safeParse({ ...data, phone: "+( 123 )" }).success, false);
  assert.equal(requestSchema.safeParse({ ...data, mode: "detailed" }).success, false);
});

test("detailed requests preserve required information and safe topic context", () => {
  const request = { name: "Test User", phone: "+998901234567", description: "Office network setup", consent: true };
  assert.equal(requestSchema.safeParse(request).success, true);
  assert.equal(requestSchema.safeParse({ ...request, name: "" }).success, false);
  assert.equal(requestSchema.safeParse({ ...request, description: "" }).success, false);
  assert.equal(requestSchema.safeParse({ ...request, topic: "x".repeat(161) }).success, false);
  const link = new URL(inquiryHref("Router & Wi-Fi / yordam?", true), "http://localhost");
  assert.equal(link.pathname, "/contact");
  assert.equal(link.searchParams.get("topic"), "Router & Wi-Fi / yordam?");
  assert.equal(link.searchParams.get("mode"), "callback");
});

test("all three entry journeys and service details have complete locale coverage", () => {
  for (const locale of ["uz", "ru", "en"] as const) {
    assert.deepEqual(Object.keys(journeyCopy[locale]), Object.keys(journeyCopy.uz));
    assert.deepEqual(Object.keys(shopCopy[locale]), Object.keys(shopCopy.uz));
    assert.ok(Object.values(journeyCopy[locale]).every(text => text.length > 0));
    assert.deepEqual(serviceJourneys[locale].map(item => item.id), ["wifi", "office", "cctv", "access", "support", "advice"]);
    assert.ok(serviceJourneys[locale].every(item => item.scope.length > 20 && item.result.length > 20 && item.factors.length > 20 && item.prepare.length > 20));
    assert.equal(serviceGuideCopy[locale].steps.length, 4);
    assert.equal(serviceGuideCopy[locale].faq.length, 3);
  }
});
