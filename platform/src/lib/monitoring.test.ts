import assert from "node:assert/strict";
import test from "node:test";
import { isPublicAddress, parseMonitoringTarget } from "./monitoring";

test("blocks private, loopback, link-local and metadata addresses", () => {
  for (const address of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:10.0.0.1"]) {
    assert.equal(isPublicAddress(address), false, address);
  }
});

test("allows public addresses", () => {
  for (const address of ["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"]) assert.equal(isPublicAddress(address), true, address);
});

test("parses only tcp targets with a valid port", () => {
  assert.deepEqual(parseMonitoringTarget("tcp:443", "Example.com"), { host: "example.com", port: 443 });
  assert.equal(parseMonitoringTarget("tcp:0", "example.com"), null);
  assert.equal(parseMonitoringTarget("tcp:70000", "example.com"), null);
  assert.equal(parseMonitoringTarget("http:80", "example.com"), null);
  assert.equal(parseMonitoringTarget("tcp:80", "bad host/path"), null);
  assert.equal(parseMonitoringTarget("tcp:80", ""), null);
});
