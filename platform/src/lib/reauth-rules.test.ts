import assert from "node:assert/strict";
import test from "node:test";
import { couldHaveOtherSignIn, hasOtherSignIn, reauthMethods, reauthTarget, RECENT_SIGN_IN_MS, type ReauthSubject } from "./reauth-rules";

const base: ReauthSubject = { staff: false, twoFactor: false, telegramLinked: false, phoneVerified: false, gateway: false, realEmail: false, mailConfigured: false, sessionAgeMs: 60 * 60 * 1000 };

test("a customer with a password account can always try the password", () => {
  assert.deepEqual(reauthMethods({ ...base, realEmail: true }), { methods: ["password"], withTotp: false });
});

test("an OAuth-only customer has the recent sign-in, or must sign in again", () => {
  assert.deepEqual(reauthMethods({ ...base, sessionAgeMs: 5 * 60 * 1000 }).methods, ["recent", "password"]);
  assert.equal(reauthMethods({ ...base, sessionAgeMs: RECENT_SIGN_IN_MS + 1000 }).methods.includes("recent"), false);
});

test("Telegram-only and phone-only customers get a code where they can receive one", () => {
  assert.deepEqual(reauthMethods({ ...base, telegramLinked: true }).methods, ["password", "telegram"]);
  assert.deepEqual(reauthMethods({ ...base, phoneVerified: true, gateway: true }).methods, ["password", "phone"]);
  // No Gateway: the approved SMS texts are only for sign-in and reset, so no phone code here.
  assert.deepEqual(reauthMethods({ ...base, phoneVerified: true, gateway: false }).methods, ["password"]);
  assert.deepEqual(reauthMethods({ ...base, realEmail: true, mailConfigured: true }).methods, ["password", "email"]);
});

test("with two-factor on, the password is not enough", () => {
  assert.deepEqual(reauthMethods({ ...base, twoFactor: true, telegramLinked: true, sessionAgeMs: 0 }), { methods: ["totp"], withTotp: false });
});

test("staff give the password, plus the code with two-factor; a fresh session is not enough", () => {
  assert.deepEqual(reauthMethods({ ...base, staff: true, sessionAgeMs: 0, telegramLinked: true }), { methods: ["password"], withTotp: false });
  assert.deepEqual(reauthMethods({ ...base, staff: true, twoFactor: true }), { methods: ["password"], withTotp: true });
});

test("a proof is bound to the person, the session and the action", () => {
  assert.notEqual(reauthTarget("u1", "s1", "DELETE"), reauthTarget("u1", "s2", "DELETE"));
  assert.notEqual(reauthTarget("u1", "s1", "DELETE"), reauthTarget("u1", "s1", "EMAIL"));
  assert.notEqual(reauthTarget("u1", "s1", "DELETE"), reauthTarget("u2", "s1", "DELETE"));
});

test("Telegram can be unlinked only while another way in remains", () => {
  const none = { realEmail: false, confirmedWithPassword: false, oauth: false, phoneVerified: false, phoneCodes: false, mailConfigured: false };
  assert.equal(hasOtherSignIn(none), false);
  assert.equal(hasOtherSignIn({ ...none, realEmail: true }), false, "a stored password proves nothing");
  assert.equal(hasOtherSignIn({ ...none, realEmail: true, confirmedWithPassword: true }), true);
  assert.equal(hasOtherSignIn({ ...none, oauth: true }), true);
  assert.equal(hasOtherSignIn({ ...none, phoneVerified: true }), false, "no channel for codes");
  assert.equal(hasOtherSignIn({ ...none, phoneVerified: true, phoneCodes: true }), true);
  assert.equal(hasOtherSignIn({ ...none, realEmail: true, mailConfigured: true }), true);
  assert.equal(couldHaveOtherSignIn({ realEmail: true, oauth: false, phoneVerified: false, phoneCodes: false, mailConfigured: false }), true);
  assert.equal(couldHaveOtherSignIn({ realEmail: false, oauth: false, phoneVerified: true, phoneCodes: false, mailConfigured: true }), false);
});
