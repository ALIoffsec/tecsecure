import assert from "node:assert/strict";
import test from "node:test";
import { emptyHomeFacts, homeFactsSchema, parseHomeFacts } from "./home-facts";

test("missing or broken stored figures count as empty, so nothing invented reaches the page", () => {
  assert.deepEqual(parseHomeFacts(null), emptyHomeFacts);
  assert.deepEqual(parseHomeFacts("{not json"), emptyHomeFacts);
  assert.deepEqual(parseHomeFacts(JSON.stringify({ trust: { projects: "x".repeat(41) } })), emptyHomeFacts);
  assert.equal(Object.values(emptyHomeFacts.trust).every(value => value === ""), true);
});

test("partly filled figures keep what was entered and leave the rest empty", () => {
  const facts = parseHomeFacts(JSON.stringify({ trust: { projects: " 40+ " }, services: { cctv: { from: "1 000 000 so‘m" } } }));
  assert.equal(facts.trust.projects, "40+");
  assert.equal(facts.trust.years, "");
  assert.equal(facts.services.cctv.from, "1 000 000 so‘m");
  assert.equal(facts.services.audit.duration, "");
});

test("the admin form cannot store unknown keys or long values", () => {
  const services = { cctv: { from: "", duration: "", warranty: "" }, network: { from: "", duration: "", warranty: "" }, audit: { from: "", duration: "", warranty: "" }, support: { from: "", duration: "", warranty: "" } };
  assert.equal(homeFactsSchema.safeParse({ trust: { projects: "", years: "", clients: "", warranty: "", rating: "5" }, services }).success, false);
  assert.equal(homeFactsSchema.safeParse({ trust: { projects: "y".repeat(41), years: "", clients: "", warranty: "" }, services }).success, false);
  assert.equal(homeFactsSchema.safeParse({ trust: { projects: "", years: "", clients: "", warranty: "" }, services }).success, true);
});
