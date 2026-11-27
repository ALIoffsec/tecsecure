import assert from "node:assert/strict";
import test from "node:test";
import { cabinetParent, cabinetSectionOf, legacyPortalPath } from "./cabinet-routes";

test("every old section address moves to its new page", () => {
  const table: [string | null, string][] = [
    ["overview", "/portal"], ["profile", "/portal/settings"], ["requests", "/portal/requests"], ["projects", "/portal/requests"],
    ["invoices", "/portal/requests"], ["orders", "/portal/orders"], ["wallet", "/portal/wallet"], ["monitoring", "/portal/devices"],
    ["subscriptions", "/portal/devices"], ["messages", "/portal/messages"], ["learning", "/portal/learning"], ["store", "/store"],
    ["nonsense", "/portal"], [null, "/portal"]
  ];
  for (const [section, path] of table) assert.equal(legacyPortalPath(section), path, String(section));
});

test("inner pages belong to their section", () => {
  assert.equal(cabinetSectionOf("/portal"), "home");
  assert.equal(cabinetSectionOf("/portal/orders"), "orders");
  assert.equal(cabinetSectionOf("/portal/orders/abc"), "orders");
  assert.equal(cabinetSectionOf("/portal/settings/security"), "settings");
  assert.equal(cabinetSectionOf("/portal/ordersx"), null);
});

test("back goes one level up, never by browser history", () => {
  assert.equal(cabinetParent("/portal"), null);
  assert.deepEqual(cabinetParent("/portal/orders"), { href: "/portal", section: "home" });
  assert.deepEqual(cabinetParent("/portal/orders/abc"), { href: "/portal/orders", section: "orders" });
  assert.deepEqual(cabinetParent("/portal/orders/abc/invoice"), { href: "/portal/orders/abc", section: "orders" });
  assert.deepEqual(cabinetParent("/portal/settings/security"), { href: "/portal/settings", section: "settings" });
  assert.deepEqual(cabinetParent("/portal/notifications"), { href: "/portal", section: "home" });
  assert.deepEqual(cabinetParent("/portal/invoices/inv1"), { href: "/portal/requests", section: "requests" });
  assert.deepEqual(cabinetParent("/portal/requests/r1"), { href: "/portal/requests", section: "requests" });
  assert.equal(cabinetParent("/products"), null);
});
