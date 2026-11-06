import { createHmac, timingSafeEqual } from "node:crypto";

export type TelegramWebAppUser = { id: number; first_name?: string; last_name?: string; username?: string };

const MAX_AGE_SECONDS = 24 * 60 * 60;

/**
 * Proves that Mini App launch data really came from Telegram for this bot, following Telegram's
 * published check. Without this anyone could claim to be any Telegram user.
 */
export function verifyTelegramInitData(initData: string, botToken: string, nowSeconds = Math.floor(Date.now() / 1000)): TelegramWebAppUser | null {
  if (!initData || !botToken) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");
  const dataCheck = [...params.entries()].map(([key, value]) => `${key}=${value}`).sort().join("\n");
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expected = Buffer.from(createHmac("sha256", secret).update(dataCheck).digest("hex"));
  const given = Buffer.from(hash);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate) || nowSeconds - authDate > MAX_AGE_SECONDS) return null;
  try {
    const user = JSON.parse(params.get("user") ?? "null") as TelegramWebAppUser | null;
    return user && typeof user.id === "number" ? user : null;
  } catch {
    return null;
  }
}
