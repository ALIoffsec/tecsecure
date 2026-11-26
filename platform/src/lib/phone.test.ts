import assert from "node:assert/strict";
import test from "node:test";
import { decidePhoneSignIn, normalizePhone, phoneOwner, type PhoneHolder } from "./phone";

const P = "+998901234567";
let next = 0;
const account = (over: Partial<PhoneHolder> = {}): PhoneHolder => ({
  id: `u${++next}`, role: "CUSTOMER", active: true, deletedAt: null, phone: P, phoneVerifiedAt: new Date("2026-01-01"), telegramChatId: null, ...over
});
const unproved = (over: Partial<PhoneHolder> = {}) => account({ phoneVerifiedAt: null, ...over });

test("normalizes the ways a Uzbek number is typed", () => {
  for (const typed of ["+998901234567", "998901234567", "90 123 45 67", "+998 (90) 123-45-67", "901234567"]) assert.equal(normalizePhone(typed), P, typed);
  for (const typed of ["12345", "+7 912 345 67 89", "", "abc"]) assert.equal(normalizePhone(typed), null, typed);
});

test("one proved account signs in", () => {
  const owner = account();
  assert.deepEqual(decidePhoneSignIn([owner], P), { kind: "signIn", userId: owner.id });
});

test("one proved and one only typed: the proved one, the other is ignored", () => {
  const owner = account();
  assert.deepEqual(decidePhoneSignIn([unproved(), owner], P), { kind: "signIn", userId: owner.id });
});

test("a blocked proved account goes to review, not to a new account", () => {
  assert.deepEqual(decidePhoneSignIn([account({ active: false })], P), { kind: "review" });
  assert.deepEqual(decidePhoneSignIn([account({ active: false }), unproved()], P), { kind: "review" });
});

test("two proved accounts go to review", () => {
  assert.deepEqual(decidePhoneSignIn([account(), account()], P), { kind: "review" });
});

test("nobody holds the number: a new account", () => {
  assert.deepEqual(decidePhoneSignIn([], P), { kind: "create" });
});

test("only typed, never proved: the person chooses, nothing opens by itself", () => {
  assert.deepEqual(decidePhoneSignIn([unproved()], P), { kind: "choose" });
  assert.deepEqual(decidePhoneSignIn([unproved(), unproved()], P), { kind: "choose" });
});

test("other numbers, staff, deleted accounts and spellings are compared properly", () => {
  assert.deepEqual(decidePhoneSignIn([account({ phone: "+998901234568" })], P), { kind: "create" });
  assert.deepEqual(decidePhoneSignIn([account({ role: "STAFF" })], P), { kind: "create" });
  assert.deepEqual(decidePhoneSignIn([account({ deletedAt: new Date() })], P), { kind: "create" });
  const typedWithSpaces = account({ phone: "90 123 45 67" });
  assert.deepEqual(decidePhoneSignIn([typedWithSpaces], P), { kind: "signIn", userId: typedWithSpaces.id });
});

test("an account is never proved by its email address", () => {
  const squatter = unproved() as PhoneHolder & { email: string };
  squatter.email = "phone-998901234567@accounts.tecsecure.invalid";
  assert.deepEqual(decidePhoneSignIn([squatter], P), { kind: "choose" });
});

test("codes reach a Telegram only through the one active proved account", () => {
  assert.equal(phoneOwner([unproved({ telegramChatId: "111" })], P), null);
  assert.equal(phoneOwner([account(), account()], P), null);
  assert.equal(phoneOwner([account({ active: false, telegramChatId: "111" })], P), null);
  const owner = account({ telegramChatId: "222" });
  assert.equal(phoneOwner([unproved({ telegramChatId: "111" }), owner], P), owner);
});
