import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import test from "node:test";
import { deliverPhoneCode, GatewayError, sendGatewayCode, verifyGatewayReport } from "./telegram-gateway";

const token = "gateway-test-token";
const now = 1_800_000_000;

function sign(timestamp: string, body: string, key = token) {
  return createHmac("sha256", createHash("sha256").update(key).digest()).update(`${timestamp}\n${body}`).digest("hex");
}

test("a delivery report signed with our token and fresh is accepted", () => {
  const body = JSON.stringify({ request_id: "r1", delivery_status: { status: "delivered" } });
  const ts = String(now - 10);
  assert.equal(verifyGatewayReport(token, ts, body, sign(ts, body), now), true);
  assert.equal(verifyGatewayReport(token, ts, body, sign(ts, body).toUpperCase(), now), true);
});

test("a tampered, foreign or stale delivery report is refused", () => {
  const body = JSON.stringify({ request_id: "r1", delivery_status: { status: "delivered" } });
  const ts = String(now);
  const good = sign(ts, body);
  assert.equal(verifyGatewayReport(token, ts, body.replace("delivered", "read"), good, now), false);
  assert.equal(verifyGatewayReport(token, ts, body, sign(ts, body, "other-token"), now), false);
  assert.equal(verifyGatewayReport(token, String(now + 1), body, good, now), false);
  const old = String(now - 6 * 60);
  assert.equal(verifyGatewayReport(token, old, body, sign(old, body), now), false);
  assert.equal(verifyGatewayReport("", ts, body, good, now), false);
  assert.equal(verifyGatewayReport(token, null, body, good, now), false);
  assert.equal(verifyGatewayReport(token, ts, body, null, now), false);
  assert.equal(verifyGatewayReport(token, "12a", body, good, now), false);
  assert.equal(verifyGatewayReport(token, ts, body, good.slice(0, 10), now), false);
});

type Call = { url: string; body: Record<string, unknown>; auth: string | null };

function fakeFetch(answers: Record<string, unknown>, calls: Call[]): typeof fetch {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const method = url.split("/").pop() ?? "";
    calls.push({ url, body: JSON.parse(String(init?.body)), auth: new Headers(init?.headers).get("authorization") });
    return new Response(JSON.stringify(answers[method] ?? { ok: false, error: "UNKNOWN_METHOD" }), { status: 200 });
  }) as typeof fetch;
}

test("a Gateway code checks the number first and reuses its request id, so it is paid once", async () => {
  const calls: Call[] = [];
  const fetcher = fakeFetch({
    checkSendAbility: { ok: true, result: { request_id: "req-1" } },
    sendVerificationMessage: { ok: true, result: { request_id: "req-1" } }
  }, calls);
  const id = await sendGatewayCode(token, "+998901234567", "654321", "LOGIN", fetcher);
  assert.equal(id, "req-1");
  assert.deepEqual(calls.map(call => call.url.split("/").pop()), ["checkSendAbility", "sendVerificationMessage"]);
  assert.equal(calls[0].auth, `Bearer ${token}`);
  assert.equal(calls[1].body.request_id, "req-1");
  assert.equal(calls[1].body.code, "654321");
  assert.equal(calls[1].body.phone_number, "+998901234567");
});

test("a number Telegram cannot reach is not sent to and costs nothing", async () => {
  const calls: Call[] = [];
  const fetcher = fakeFetch({ checkSendAbility: { ok: false, error: "PHONE_NUMBER_NOT_AVAILABLE" } }, calls);
  assert.equal(await sendGatewayCode(token, "+998901234567", "654321", "LOGIN", fetcher), null);
  assert.equal(calls.length, 1);
});

test("a bad token or empty balance is an error, not an unreachable number", async () => {
  for (const code of ["ACCESS_TOKEN_INVALID", "BALANCE_NOT_ENOUGH"]) {
    const calls: Call[] = [];
    const fetcher = fakeFetch({ checkSendAbility: { ok: false, error: code } }, calls);
    await assert.rejects(sendGatewayCode(token, "+998901234567", "654321", "LOGIN", fetcher), (error: unknown) => error instanceof GatewayError && error.code === code);
    assert.equal(calls.length, 1);
  }
});

test("a failed send after a good check is reported as an error", async () => {
  const fetcher = fakeFetch({
    checkSendAbility: { ok: true, result: { request_id: "req-2" } },
    sendVerificationMessage: { ok: false, error: "BALANCE_NOT_ENOUGH" }
  }, []);
  await assert.rejects(sendGatewayCode(token, "+998901234567", "654321", "LOGIN", fetcher), (error: unknown) => error instanceof GatewayError && error.code === "BALANCE_NOT_ENOUGH");
});

test("phone codes go by Gateway first, then SMS, and never both", async () => {
  const sent: string[] = [];
  const sms = async () => { sent.push("sms"); };

  assert.deepEqual(await deliverPhoneCode("+998901234567", "1", "LOGIN", { gateway: async () => { sent.push("gateway"); return "req"; }, sms }), { via: "gateway", requestId: "req" });
  assert.deepEqual(sent, ["gateway"]);

  sent.length = 0;
  assert.deepEqual(await deliverPhoneCode("+998901234567", "1", "LOGIN", { gateway: async () => { sent.push("gateway"); return null; }, sms }), { via: "sms" });
  assert.deepEqual(sent, ["gateway", "sms"]);

  sent.length = 0;
  const original = console.error;
  console.error = () => undefined;
  try {
    assert.deepEqual(await deliverPhoneCode("+998901234567", "1", "LOGIN", { gateway: async () => { throw new GatewayError("BALANCE_NOT_ENOUGH"); }, sms }), { via: "sms" });
  } finally {
    console.error = original;
  }
  assert.deepEqual(sent, ["sms"]);

  assert.deepEqual(await deliverPhoneCode("+998901234567", "1", "LOGIN", { gateway: null, sms: null }), { via: "none" });
  assert.deepEqual(await deliverPhoneCode("+998901234567", "1", "LOGIN", { gateway: async () => null, sms: null }), { via: "none" });
});
