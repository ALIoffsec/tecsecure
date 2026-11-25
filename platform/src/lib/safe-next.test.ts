import assert from "node:assert/strict";
import test from "node:test";
import { landingFor, loginPath, safeNext, safeNextPath } from "./safe-next";

test("refuses addresses that leave the site or reach private areas", () => {
  for (const value of [
    "//e.com", "/\\e.com", "\\\\e.com", "/%5Ce.com", "/%5ce.com", "/%2F%2Fe.com", "/portal%00", "/\te.com", "/portal\n", " /portal",
    "/.//e.com", "/portal/../..//e.com", "https:e.com", "https://e.com", "javascript:alert(1)", "e.com", "",
    "/api/orders/1/payme", "/admin", "/admin/orders", "/staff/login", "/login", "/login/2fa?ticket=x", "/register", "/tg/staff",
    "/portalx", "/%70ortal", "/" + "a".repeat(600)
  ]) assert.equal(safeNextPath(value), null, JSON.stringify(value));
  for (const value of [["/portal"], 42, null, undefined, { toString: () => "/portal" }]) assert.equal(safeNextPath(value), null);
});

test("keeps customer pages with their query and drops the hash", () => {
  assert.equal(safeNextPath("/portal?section=wallet"), "/portal?section=wallet");
  assert.equal(safeNextPath("/products/kamera-1"), "/products/kamera-1");
  assert.equal(safeNextPath("/shop"), "/shop");
  assert.equal(safeNextPath("/cart"), "/cart");
  assert.equal(safeNextPath("/learning/practice/labs"), "/learning/practice/labs");
  assert.equal(safeNextPath("/s/my-shop?tab=new#top"), "/s/my-shop?tab=new");
  assert.equal(safeNextPath("/"), "/");
  assert.equal(safeNextPath("/portal/./orders"), "/portal/orders");
});

test("falls back to the role's own page", () => {
  assert.equal(safeNext("//e.com", "/portal"), "/portal");
  assert.equal(landingFor("CUSTOMER", "/cart"), "/cart");
  assert.equal(landingFor("CUSTOMER", "/admin"), "/portal");
  assert.equal(landingFor("CUSTOMER", undefined), "/portal");
  for (const role of ["STAFF", "ADMIN", "FOUNDER"]) assert.equal(landingFor(role, "/cart"), "/admin");
});

test("builds sign-in links that come back to the page", () => {
  assert.equal(loginPath("/products/kamera-1"), "/login?next=%2Fproducts%2Fkamera-1");
  assert.equal(loginPath("/portal?section=wallet", "/login/code"), "/login/code?next=%2Fportal%3Fsection%3Dwallet");
  assert.equal(loginPath("//e.com"), "/login");
  assert.equal(loginPath(undefined, "/register"), "/register");
});
