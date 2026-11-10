import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { getGatewayCredentials } from "./integration-credentials";
import { siteOrigin } from "./site-origin";

/**
 * Telegram Gateway (https://core.telegram.org/gateway/api): verification codes delivered by Telegram itself
 * to the account of a phone number, $0.01 per delivered code, refunded when not delivered within the TTL.
 */
const BASE = "https://gatewayapi.telegram.org";
export const GATEWAY_TTL_SECONDS = 300;
const REPORT_MAX_AGE_SECONDS = 5 * 60;

export class GatewayError extends Error {
  constructor(readonly code: string) {
    super(`Telegram Gateway: ${code}`);
    this.name = "GatewayError";
  }
}

type RequestStatus = { request_id: string; phone_number?: string; delivery_status?: { status: string; updated_at: number }; payload?: string };

export async function gatewayToken(): Promise<string> {
  try {
    return (await getGatewayCredentials()).token;
  } catch (error) {
    console.error("Gateway settings could not be read", error instanceof Error ? error.message : "UnknownError");
    return "";
  }
}

/** One Gateway call. `fetcher` is swappable so the order of calls can be tested without the network. */
export async function callGateway<T>(token: string, method: string, params: Record<string, unknown>, fetcher: typeof fetch = fetch): Promise<T> {
  const response = await fetcher(`${BASE}/${method}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(10000)
  });
  const body = await response.json().catch(() => null) as { ok?: boolean; result?: T; error?: string } | null;
  if (!body?.ok) throw new GatewayError(body?.error ?? `HTTP_${response.status}`);
  return body.result as T;
}

export function isAccountProblem(code: string): boolean {
  return /^(ACCESS_TOKEN|BALANCE|HTTP_)|FLOOD|TIMEOUT|INTERNAL/.test(code);
}

/**
 * Sends our own code to the Telegram account of `phone` (E.164 with +). checkSendAbility first: when the
 * number cannot get it there is no charge and the caller falls back to SMS; when it can, its request_id
 * makes the actual send free, so a delivered code costs once. Returns the request_id, or null if the number
 * is not reachable through Telegram.
 */
export async function sendGatewayCode(token: string, phone: string, code: string, purpose: string, fetcher: typeof fetch = fetch): Promise<string | null> {
  let ability: RequestStatus;
  try {
    ability = await callGateway<RequestStatus>(token, "checkSendAbility", { phone_number: phone }, fetcher);
  } catch (error) {
    // A bad token, an empty balance or Telegram being down is our problem, not the number's: report it.
    if (error instanceof GatewayError && !isAccountProblem(error.code)) {
      console.info("Telegram Gateway cannot reach this number:", error.code);
      return null;
    }
    throw error;
  }
  const origin = siteOrigin();
  const sent = await callGateway<RequestStatus>(token, "sendVerificationMessage", {
    phone_number: phone,
    request_id: ability.request_id,
    code,
    ttl: GATEWAY_TTL_SECONDS,
    payload: purpose.slice(0, 128),
    ...(origin.startsWith("https://") ? { callback_url: `${origin}/api/telegram/gateway/callback` } : {})
  }, fetcher);
  return sent.request_id || ability.request_id;
}

/** After a correct code: tells Gateway, only for its conversion statistics. Never awaited by sign-in. */
export function reportGatewayVerified(requestId: string, code: string): void {
  void gatewayToken().then(token => token ? callGateway(token, "checkVerificationStatus", { request_id: requestId, code }) : null)
    .catch(error => console.info("Gateway verification report failed:", error instanceof Error ? error.message : "UnknownError"));
}

/**
 * A delivery report really came from Telegram: HMAC-SHA256 of "timestamp\nbody" keyed with SHA256(token),
 * hex, compared in constant time, and not older than five minutes.
 */
export function verifyGatewayReport(token: string, timestamp: string | null, rawBody: string, signature: string | null, nowSeconds = Math.floor(Date.now() / 1000)): boolean {
  if (!token || !timestamp || !signature || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs(nowSeconds - Number(timestamp)) > REPORT_MAX_AGE_SECONDS) return false;
  const key = createHash("sha256").update(token).digest();
  const expected = Buffer.from(createHmac("sha256", key).update(`${timestamp}\n${rawBody}`).digest("hex"));
  const given = Buffer.from(signature.trim().toLowerCase());
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export type PhoneDelivery = "gateway" | "sms" | "none";

/**
 * The order for a phone code: Telegram Gateway, then Eskiz SMS. "none" leaves the person the bot-link
 * button on the site. A Gateway failure (other than "not reachable") falls through to SMS rather than
 * stopping the sign-in.
 */
export async function deliverPhoneCode(
  phone: string,
  code: string,
  purpose: string,
  channels: { gateway: ((phone: string, code: string, purpose: string) => Promise<string | null>) | null; sms: ((phone: string) => Promise<void>) | null }
): Promise<{ via: PhoneDelivery; requestId?: string }> {
  if (channels.gateway) {
    try {
      const requestId = await channels.gateway(phone, code, purpose);
      if (requestId) return { via: "gateway", requestId };
    } catch (error) {
      console.error("Telegram Gateway send failed, trying SMS:", error instanceof Error ? error.message : "UnknownError");
    }
  }
  if (channels.sms) {
    await channels.sms(phone);
    return { via: "sms" };
  }
  return { via: "none" };
}
