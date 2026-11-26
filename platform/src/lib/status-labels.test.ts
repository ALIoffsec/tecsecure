import assert from "node:assert/strict";
import test from "node:test";
import { statusCodes, statusLabel, type StatusKind } from "./status-labels";
import { notificationText, notificationView, unreadBadge } from "./notifications";

test("every status of every kind has words in all three languages", () => {
  for (const kind of ["order", "payment", "request", "project", "quote", "invoice", "invoicePayment", "subscription", "device", "wallet"] as StatusKind[]) {
    for (const code of statusCodes(kind)) {
      for (const locale of ["uz", "ru", "en"] as const) {
        const label = statusLabel(kind, code, locale);
        assert.ok(label.text && label.text !== "—" && label.text !== code, `${kind} ${code} ${locale}`);
      }
    }
  }
});

test("an unknown status is a neutral dash, never a guess or a raw code", () => {
  const original = console.warn;
  console.warn = () => {};
  try {
    assert.deepEqual(statusLabel("order", "TELEPORTED"), { text: "—", tone: "neutral" });
    assert.deepEqual(statusLabel("order", null), { text: "—", tone: "neutral" });
  } finally {
    console.warn = original;
  }
});

test("only customer news leaves the server, without raw payload fields", () => {
  const row = { id: "n1", event: "ORDER_STATUS_CHANGED", status: "UNREAD", createdAt: new Date("2026-01-02T03:04:05Z"), payload: { reference: "ORD-1", status: "SHIPPED", orderId: "x", url: "https://evil.example", lastError: "boom" } };
  const view = notificationView(row);
  assert.deepEqual(view, { id: "n1", event: "ORDER_STATUS_CHANGED", unread: true, createdAt: "2026-01-02T03:04:05.000Z", href: "/portal/orders", params: { reference: "ORD-1", status: "SHIPPED" } });
  assert.equal(notificationText(view!, "uz"), "Buyurtma ORD-1: Yo‘lda");
  assert.equal(notificationView({ ...row, event: "WALLET_DEPOSIT_REQUESTED" }), null);
  assert.equal(notificationView({ ...row, event: "ORDER_RECEIVED" }), null);
  assert.equal(notificationView({ ...row, status: "DELIVERED" })?.unread, false);
});

test("the bell shows 1 to 9, then 9+, and nothing at zero", () => {
  assert.equal(unreadBadge(0), null);
  assert.equal(unreadBadge(3), "3");
  assert.equal(unreadBadge(9), "9");
  assert.equal(unreadBadge(10), "9+");
});
