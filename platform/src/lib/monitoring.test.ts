import assert from "node:assert/strict";
import test from "node:test";
import { isPublicAddress, parseMonitoringTarget, resolvePublicAddresses } from "./monitoring";

test("blocks private, loopback, link-local and metadata addresses", () => {
  for (const address of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:10.0.0.1"]) {
    assert.equal(isPublicAddress(address), false, address);
  }
});

test("allows public addresses", () => {
  for (const address of ["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111", "2a00:1450:4001:80b::200e"]) assert.equal(isPublicAddress(address), true, address);
});

test("blocks every spelling of loopback and the special IPv6 ranges", () => {
  for (const address of [
    "0:0:0:0:0:0:0:1", "::127.0.0.1", "::ffff:7f00:1", "::ffff:127.0.0.1", "::ffff:8.8.8.8", "64:ff9b::7f00:1", "64:ff9b::808:808",
    "2002:7f00:1::", "2001:db8::1", "2001:0:4136:e378::1", "fec0::1", "ff02::1", "::", "fc00::1", "100::1",
    "198.51.100.7", "203.0.113.9", "192.0.2.1", "255.255.255.255", "240.0.0.1", "not-an-ip", "2130706433"
  ]) assert.equal(isPublicAddress(address), false, address);
});

test("judges a host name by what it resolves to", async () => {
  const fake = (answers: Record<string, string[]>) => async (host: string) => {
    if (!answers[host]) throw new Error("ENOTFOUND");
    return answers[host];
  };
  const resolve = fake({ "2130706433": ["127.0.0.1"], "mixed.example": ["8.8.8.8", "10.0.0.5"], "good.example": ["8.8.8.8", "2606:4700:4700::1111"], "empty.example": [] });
  assert.deepEqual(await resolvePublicAddresses("2130706433", resolve), { ok: false, reason: "private" });
  assert.deepEqual(await resolvePublicAddresses("mixed.example", resolve), { ok: false, reason: "private" });
  assert.deepEqual(await resolvePublicAddresses("missing.example", resolve), { ok: false, reason: "dns" });
  assert.deepEqual(await resolvePublicAddresses("empty.example", resolve), { ok: false, reason: "dns" });
  assert.deepEqual(await resolvePublicAddresses("good.example", resolve), { ok: true, addresses: ["8.8.8.8", "2606:4700:4700::1111"] });
  assert.deepEqual(await resolvePublicAddresses("::1", resolve), { ok: false, reason: "private" });
});

test("parses only tcp targets with a valid port", () => {
  assert.deepEqual(parseMonitoringTarget("tcp:443", "Example.com"), { host: "example.com", port: 443 });
  assert.equal(parseMonitoringTarget("tcp:0", "example.com"), null);
  assert.equal(parseMonitoringTarget("tcp:70000", "example.com"), null);
  assert.equal(parseMonitoringTarget("http:80", "example.com"), null);
  assert.equal(parseMonitoringTarget("tcp:80", "bad host/path"), null);
  assert.equal(parseMonitoringTarget("tcp:80", ""), null);
});
