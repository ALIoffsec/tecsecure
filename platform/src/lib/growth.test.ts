import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { paymeAuthorized, paymeCheckoutUrl } from "./payme";
import { normalizeIdentifier, normalizePhone } from "./otp";
import { verifyTelegramInitData } from "./telegram-webapp";
import { buildNetworkEstimate } from "./network-estimate";
import { scoreSecurityCheck, securityQuestions } from "./security-check";

test("the Payme link carries the order and the amount in tiyin, in Payme's documented format", () => {
  const url = paymeCheckoutUrl({ merchantId: "587f72c72cac0d162c722ae2", reference: "ORD-2026-AB12", amountMinor: 750000000, locale: "ru", returnUrl: "https://x.uz/portal/orders", host: "https://checkout.paycom.uz" });
  const decoded = Buffer.from(url.replace("https://checkout.paycom.uz/", ""), "base64").toString();
  assert.equal(decoded, "m=587f72c72cac0d162c722ae2;ac.order_id=ORD-2026-AB12;a=750000000;l=ru;c=https://x.uz/portal/orders");
});

test("only Payme's exact credentials pass", () => {
  const good = `Basic ${Buffer.from("Paycom:secret-key").toString("base64")}`;
  assert.equal(paymeAuthorized(good, "secret-key"), true);
  assert.equal(paymeAuthorized(good, "other-key"), false);
  assert.equal(paymeAuthorized(`Basic ${Buffer.from("Paycom:wrong").toString("base64")}`, "secret-key"), false);
  assert.equal(paymeAuthorized(null, "secret-key"), false);
  assert.equal(paymeAuthorized(good, undefined), false, "no key configured means nobody passes");
  assert.equal(paymeAuthorized(good, ""), false);
});

test("a Uzbek phone number has one spelling however it is typed", () => {
  for (const typed of ["+998 90 123 45 67", "998901234567", "90 123-45-67", "(90) 1234567"]) assert.equal(normalizePhone(typed), "+998901234567", typed);
  assert.equal(normalizePhone("12345"), null);
  assert.equal(normalizePhone("+1 202 555 0100"), null);
  assert.deepEqual(normalizeIdentifier("Ali@Mail.UZ"), { kind: "email", value: "ali@mail.uz" });
  assert.deepEqual(normalizeIdentifier("901234567"), { kind: "phone", value: "+998901234567" });
  assert.equal(normalizeIdentifier("not an address"), null);
});

function signed(token: string, fields: Record<string, string>) {
  const check = Object.entries(fields).map(([k, v]) => `${k}=${v}`).sort().join("\n");
  const secret = createHmac("sha256", "WebAppData").update(token).digest();
  return new URLSearchParams({ ...fields, hash: createHmac("sha256", secret).update(check).digest("hex") }).toString();
}

test("Mini App sign-in trusts only data signed for this bot and still fresh", () => {
  const now = 1_800_000_000;
  const fields = { auth_date: String(now - 60), user: JSON.stringify({ id: 42, first_name: "Ali" }), query_id: "AAE" };
  assert.equal(verifyTelegramInitData(signed("111:token", fields), "111:token", now)?.id, 42);
  assert.equal(verifyTelegramInitData(signed("111:token", fields), "222:other", now), null, "another bot's signature");
  assert.equal(verifyTelegramInitData(signed("111:token", fields).replace("Ali", "Vali"), "111:token", now), null, "edited after signing");
  assert.equal(verifyTelegramInitData(signed("111:token", { ...fields, auth_date: String(now - 90000) }), "111:token", now), null, "too old");
  assert.equal(verifyTelegramInitData("user=%7B%22id%22%3A1%7D", "111:token", now), null, "no signature");
  assert.equal(verifyTelegramInitData(signed("111:token", fields), "", now), null, "bot not configured");
});

test("the network estimate scales with the site and never suggests too little", () => {
  const small = buildNetworkEstimate({ workplaces: 10, floors: 1, areaM2: 150, wifiUsers: 15, server: false, cameras: 0 });
  assert.equal(small.preliminary, true);
  assert.equal(small.accessPoints, 2);
  assert.equal(small.ports, 12 + small.accessPoints);
  assert.ok(small.switchPorts >= small.ports);
  assert.equal(small.rackUnits > 0, true);
  const big = buildNetworkEstimate({ workplaces: 120, floors: 4, areaM2: 3000, wifiUsers: 300, server: true, cameras: 40 });
  assert.ok(big.switchPorts >= big.ports);
  assert.ok(big.accessPoints >= 25);
  assert.ok(big.cableBoxes > small.cableBoxes);
  assert.ok(big.poeWatts > small.poeWatts);
  assert.equal(big.ups, 2);
  assert.ok(big.switches.every(item => item.count > 0));
});

test("the security check scores answers and gives advice only for weak ones", () => {
  const best = Object.fromEntries(securityQuestions.map(q => [q.id, 2]));
  const worst = Object.fromEntries(securityQuestions.map(q => [q.id, 0]));
  assert.equal(securityQuestions.length, 10);
  assert.equal(scoreSecurityCheck(best).percent, 100);
  assert.equal(scoreSecurityCheck(best).level, "good");
  assert.equal(scoreSecurityCheck(best).weak.length, 0);
  assert.equal(scoreSecurityCheck(worst).percent, 0);
  assert.equal(scoreSecurityCheck(worst).level, "risk");
  assert.equal(scoreSecurityCheck(worst).weak.length, 10);
  assert.equal(scoreSecurityCheck({}).percent, 0, "unanswered questions count as no protection");
});
