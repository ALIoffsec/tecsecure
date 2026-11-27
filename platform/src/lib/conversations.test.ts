import assert from "node:assert/strict";
import test from "node:test";
import { afterMessage, unreadForCustomer, unreadForStaff } from "./conversations";

const messages = [
  { sender: "CUSTOMER", createdAt: "2026-01-01T10:00:00Z" },
  { sender: "ADMIN", createdAt: "2026-01-01T11:00:00Z" },
  { sender: "CUSTOMER", createdAt: "2026-01-01T12:00:00Z" }
];

test("each side sees as unread only the other side's newer messages", () => {
  assert.equal(unreadForCustomer(messages, null), 1);
  assert.equal(unreadForCustomer(messages, "2026-01-01T11:30:00Z"), 0);
  assert.equal(unreadForStaff(messages, null), 2);
  assert.equal(unreadForStaff(messages, "2026-01-01T11:00:00Z"), 1);
});

test("a customer message reopens the conversation; a staff reply marks staff as having read it", () => {
  const now = new Date("2026-02-01T00:00:00Z");
  assert.deepEqual(afterMessage("CUSTOMER", now), { lastMessageAt: now, status: "OPEN", customerReadAt: now });
  assert.deepEqual(afterMessage("ADMIN", now), { lastMessageAt: now, staffReadAt: now });
});
