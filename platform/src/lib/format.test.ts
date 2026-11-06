import assert from "node:assert/strict";
import test from "node:test";
import { formatDate, formatDateTime, formatMinor, formatNumber, minorToMajorInput, parseMajorPrice } from "./format";

test("numbers use stable grouping independent of runtime locale", () => {
  assert.equal(formatNumber(7500000), "7 500 000");
  assert.equal(formatNumber(1234.5), "1 234.5");
  assert.equal(formatNumber(-1000), "-1 000");
});

test("money shows localized currency and no tiyin for UZS", () => {
  assert.equal(formatMinor(750000000, "UZS", "uz"), "7 500 000 so‘m");
  assert.equal(formatMinor(750000000, "UZS", "en"), "7 500 000 UZS");
  assert.equal(formatMinor(1999, "USD", "en"), "19.99 USD");
});

test("dates are rendered in Tashkent time regardless of server zone", () => {
  assert.equal(formatDate("2026-11-05T20:00:00Z"), "06.11.2026");
  assert.equal(formatDateTime("2026-11-05T20:30:00Z"), "06.11.2026, 01:30");
});

test("staff prices are typed in major units", () => {
  assert.equal(parseMajorPrice("1 250 000"), 125000000);
  assert.equal(parseMajorPrice("19,99"), 1999);
  assert.equal(parseMajorPrice(""), null);
  assert.ok(Number.isNaN(parseMajorPrice("abc")));
  assert.ok(Number.isNaN(parseMajorPrice("1.234")));
  assert.equal(minorToMajorInput(125000000), "1250000");
  assert.equal(minorToMajorInput(1999), "19.99");
  assert.equal(minorToMajorInput(null), "");
});
