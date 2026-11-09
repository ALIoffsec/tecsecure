import assert from "node:assert/strict";
import test from "node:test";
import { base32Decode, base32Encode, generateBackupCodes, generateTotpSecret, hashBackupCode, otpauthUri, totpCode, verifyTotp } from "./totp";
import { maskPhone } from "./phone-telegram";

// RFC 6238 appendix B: the ASCII secret "12345678901234567890" with SHA-1 (last six digits of the 8-digit values).
const RFC_SECRET = base32Encode(Buffer.from("12345678901234567890"));

test("codes match the RFC 6238 test vectors", () => {
  assert.equal(RFC_SECRET, "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");
  assert.equal(totpCode(RFC_SECRET, Math.floor(59 / 30)), "287082");
  assert.equal(totpCode(RFC_SECRET, Math.floor(1111111109 / 30)), "081804");
  assert.equal(totpCode(RFC_SECRET, Math.floor(1234567890 / 30)), "005924");
  assert.equal(totpCode(RFC_SECRET, Math.floor(2000000000 / 30)), "279037");
});

test("base32 round-trips and new secrets are 160 bits", () => {
  const bytes = Buffer.from([0, 1, 2, 250, 251, 252, 253, 254, 255]);
  assert.deepEqual(base32Decode(base32Encode(bytes)), bytes);
  assert.equal(base32Decode(generateTotpSecret()).length, 20);
  assert.throws(() => base32Decode("not base32!"));
});

test("a code is accepted within one step of drift, once, and never older than the last one used", () => {
  const now = 1111111109 * 1000;
  assert.equal(verifyTotp(RFC_SECRET, "081804", null, now), Math.floor(1111111109 / 30));
  assert.equal(verifyTotp(RFC_SECRET, "081 804", null, now + 30_000), Math.floor(1111111109 / 30), "previous step still accepted");
  assert.equal(verifyTotp(RFC_SECRET, "081804", null, now + 90_000), null, "too old");
  assert.equal(verifyTotp(RFC_SECRET, "081804", Math.floor(1111111109 / 30), now), null, "replay refused");
  assert.equal(verifyTotp(RFC_SECRET, "12345", null, now), null);
  assert.equal(verifyTotp(RFC_SECRET, "abcdef", null, now), null);
});

test("backup codes are readable, unique and matched however they are typed", () => {
  const codes = generateBackupCodes();
  assert.equal(codes.length, 10);
  assert.equal(new Set(codes).size, 10);
  for (const code of codes) assert.match(code, /^[a-z2-9]{4}-[a-z2-9]{4}$/);
  assert.equal(hashBackupCode(" ABCD-efgh "), hashBackupCode("abcd-efgh"));
});

test("the QR link names the issuer and the account", () => {
  const uri = otpauthUri("ABC", "ali@example.test");
  assert.match(uri, /^otpauth:\/\/totp\/Tecsecure%3Aali%40example\.test\?secret=ABC&issuer=Tecsecure/);
});

test("phone numbers shown in the bot are masked", () => {
  assert.equal(maskPhone("+998901234567"), "+998 ** *** 45 67");
  assert.equal(maskPhone("12"), "***");
});

test("rate limits use the address nginx appended, not one the client wrote", async () => {
  const { clientIp } = await import("./client-ip");
  const request = (headers: Record<string, string>) => new Request("http://localhost/", { headers });
  assert.equal(clientIp(request({ "x-forwarded-for": "1.2.3.4, 203.0.113.9" })), "203.0.113.9");
  assert.equal(clientIp(request({ "x-forwarded-for": "203.0.113.9" })), "203.0.113.9");
  assert.equal(clientIp(request({ "x-real-ip": "198.51.100.4" })), "198.51.100.4");
  assert.equal(clientIp(request({})), "unknown");
});
