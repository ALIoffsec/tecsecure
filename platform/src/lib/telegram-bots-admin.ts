import { getTelegramCredentials, type TelegramCredentials } from "./integration-credentials";
import { siteOrigin } from "./site-origin";
import { callTelegramApi } from "./telegram";

export const botNames = ["customer", "staff", "shop"] as const;
export type BotName = (typeof botNames)[number];

const settings: Record<BotName, { param: string; menuPath: string; menuText: string }> = {
  customer: { param: "", menuPath: "/tg", menuText: "Tecsecure" },
  staff: { param: "?bot=staff", menuPath: "/tg/staff", menuText: "Ish oynasi" },
  shop: { param: "?bot=shop", menuPath: "/tg/shop", menuText: "Do‘kon kabineti" }
};

function botKeys(credentials: TelegramCredentials, bot: BotName) {
  return bot === "customer" ? { token: credentials.botToken, secret: credentials.webhookSecret }
    : bot === "staff" ? { token: credentials.staffBotToken, secret: credentials.staffWebhookSecret }
      : { token: credentials.shopBotToken, secret: credentials.shopWebhookSecret };
}

export const expectedWebhookUrl = (bot: BotName) => `${siteOrigin()}/api/telegram/webhook${settings[bot].param}`;

type WebhookInfo = { url?: string; has_custom_certificate?: boolean; pending_update_count?: number; last_error_date?: number; last_error_message?: string; allowed_updates?: string[] };

export type BotStatus = {
  bot: BotName;
  configured: boolean;
  hasSecret: boolean;
  username: string | null;
  expectedUrl: string;
  url: string | null;
  urlMatches: boolean;
  pendingUpdates: number;
  lastErrorAt: string | null;
  lastError: string | null;
  allowedUpdates: string[] | null;
  /** Problems found, in plain words, for the admin to act on. */
  problems: string[];
  error: string | null;
};

/** What Telegram itself says about each bot's webhook, so a silent bot can be diagnosed from the admin panel. */
export async function botStatuses(): Promise<BotStatus[]> {
  const credentials = await getTelegramCredentials();
  return Promise.all(botNames.map(async (bot): Promise<BotStatus> => {
    const { token, secret } = botKeys(credentials, bot);
    const expectedUrl = expectedWebhookUrl(bot);
    const base: BotStatus = { bot, configured: Boolean(token), hasSecret: Boolean(secret), username: null, expectedUrl, url: null, urlMatches: false, pendingUpdates: 0, lastErrorAt: null, lastError: null, allowedUpdates: null, problems: [], error: null };
    if (!token) return { ...base, problems: ["Token kiritilmagan."] };
    try {
      const [me, info] = await Promise.all([
        callTelegramApi<{ username?: string }>(token, "getMe", {}),
        callTelegramApi<WebhookInfo>(token, "getWebhookInfo", {})
      ]);
      const url = info?.url || null;
      const status: BotStatus = {
        ...base,
        username: me?.username ?? null,
        url,
        urlMatches: url === expectedUrl,
        pendingUpdates: info?.pending_update_count ?? 0,
        lastErrorAt: info?.last_error_date ? new Date(info.last_error_date * 1000).toISOString() : null,
        lastError: info?.last_error_message ?? null,
        allowedUpdates: info?.allowed_updates ?? null
      };
      if (!secret) status.problems.push("Webhook kaliti saytda kiritilmagan: Telegram xabarlari qabul qilinmaydi.");
      if (!url) status.problems.push("Telegram’da webhook o‘rnatilmagan: bot xabarlarni saytga yubormaydi.");
      else if (!status.urlMatches) status.problems.push("Webhook boshqa manzilga o‘rnatilgan.");
      if (status.lastError) status.problems.push(`Telegram oxirgi marta xato oldi: ${status.lastError}`);
      if (!expectedUrl.startsWith("https://")) status.problems.push("Sayt manzili (NEXT_PUBLIC_APP_URL) https emas: Telegram faqat https’ga yuboradi.");
      return status;
    } catch (error) {
      return { ...base, error: error instanceof Error ? error.message : "UnknownError", problems: ["Token bilan Telegram’ga ulanib bo‘lmadi (token noto‘g‘ri yoki bekor qilingan)."] };
    }
  }));
}

export class BotSetupError extends Error {}

/** Points one bot's webhook at this site with its saved secret. Pending updates are kept, not dropped. */
export async function resetWebhook(bot: BotName): Promise<BotStatus> {
  const { token, secret } = botKeys(await getTelegramCredentials(), bot);
  if (!token) throw new BotSetupError("Token kiritilmagan.");
  if (!secret) throw new BotSetupError("Avval shu bot uchun webhook kalitini kiriting va saqlang.");
  const url = expectedWebhookUrl(bot);
  if (!url.startsWith("https://")) throw new BotSetupError("Sayt manzili https emas.");
  await callTelegramApi(token, "setWebhook", { url, secret_token: secret, allowed_updates: ["message", "callback_query"], drop_pending_updates: false });
  return (await botStatuses()).find(status => status.bot === bot) as BotStatus;
}

/** The button left of the message field: opens this bot's own Mini App. */
export async function setMenuButton(bot: BotName): Promise<void> {
  const { token } = botKeys(await getTelegramCredentials(), bot);
  if (!token) throw new BotSetupError("Token kiritilmagan.");
  const url = `${siteOrigin()}${settings[bot].menuPath}`;
  if (!url.startsWith("https://")) throw new BotSetupError("Sayt manzili https emas.");
  await callTelegramApi(token, "setChatMenuButton", { menu_button: { type: "web_app", text: settings[bot].menuText, web_app: { url } } });
}
