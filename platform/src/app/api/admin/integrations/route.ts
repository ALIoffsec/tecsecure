import { requireAdminApi } from "@/lib/auth";
import {
  getIntegrationStatus,
  getMailCredentials,
  getOAuthCredentials,
  getSmsCredentials,
  getTelegramCredentials,
  getYandexMapsCredentials,
  oauthProviderIds,
  saveIntegrationCredentials,
  type IntegrationCredentialUpdates,
  type OAuthCredentials,
  type OAuthProviderId
} from "@/lib/integration-credentials";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const telegramUpdateSchema = z.object({
  botToken: z.string().max(512).optional(),
  botUsername: z.string().max(100).optional(),
  adminChatId: z.string().max(100).optional(),
  webhookSecret: z.string().max(512).optional(),
  staffBotToken: z.string().max(512).optional(),
  staffBotUsername: z.string().max(100).optional(),
  staffWebhookSecret: z.string().max(512).optional(),
  clearStaffBotToken: z.boolean().optional(),
  clearStaffBotUsername: z.boolean().optional(),
  clearStaffWebhookSecret: z.boolean().optional(),
  shopBotToken: z.string().max(512).optional(),
  shopBotUsername: z.string().max(100).optional(),
  shopWebhookSecret: z.string().max(512).optional(),
  clearShopBotToken: z.boolean().optional(),
  clearShopBotUsername: z.boolean().optional(),
  clearShopWebhookSecret: z.boolean().optional(),
  clearBotToken: z.boolean().optional(),
  clearBotUsername: z.boolean().optional(),
  clearAdminChatId: z.boolean().optional(),
  clearWebhookSecret: z.boolean().optional()
}).strict();
const oauthUpdateSchema = z.object({
  clientId: z.string().max(512).optional(),
  clientSecret: z.string().max(1024).optional(),
  tenantId: z.string().max(128).optional(),
  clearClientId: z.boolean().optional(),
  clearClientSecret: z.boolean().optional(),
  clearTenantId: z.boolean().optional()
}).strict();
const integrationsUpdateSchema = z.object({
  mail: z.object({
    address: z.string().trim().email().max(254).or(z.literal("")).optional(),
    password: z.string().max(512).optional(),
    host: z.string().trim().max(200).optional(),
    port: z.number().int().min(1).max(65535).optional(),
    senderName: z.string().trim().max(80).optional(),
    clearPassword: z.boolean().optional()
  }).strict().optional(),
  sms: z.object({
    eskizEmail: z.string().max(254).optional(),
    eskizPassword: z.string().max(512).optional(),
    eskizFrom: z.string().max(32).optional(),
    clearEskizEmail: z.boolean().optional(),
    clearEskizPassword: z.boolean().optional()
  }).strict().optional(),
  telegram: telegramUpdateSchema.optional(),
  yandexMaps: z.object({
    apiKey: z.string().max(512).optional(),
    clearApiKey: z.boolean().optional()
  }).strict().optional(),
  oauth: z.object({
    google: oauthUpdateSchema.optional(),
    github: oauthUpdateSchema.optional(),
    yandex: oauthUpdateSchema.optional(),
    microsoft: oauthUpdateSchema.optional()
  }).strict().optional()
}).strict().refine((update) =>
  Object.values(update).some((group) => group && Object.keys(group).length > 0)
);

function updateValue(input: string | undefined, clear: boolean | undefined, current: string): string {
  if (clear) return "";
  const normalized = input?.trim();
  return normalized ? normalized : current;
}

export async function GET() {
  const actor = await requireAdminApi();
  if (actor instanceof Response) return actor;
  try {
    return Response.json({ integrations: await getIntegrationStatus() }, {
      headers: { "Cache-Control": "private, no-store" }
    });
  } catch (error) {
    console.error("Admin integration status read failed", error instanceof Error ? error.name : "UnknownError");
    return Response.json({ error: "Integratsiya holatini xavfsiz o‘qib bo‘lmadi." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const actor = await requireAdminApi();
  if (actor instanceof Response) return actor;
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16 * 1024) {
    return Response.json({ error: "So‘rov juda katta." }, { status: 413 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }

  const parsed = integrationsUpdateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Integratsiya sozlamalari noto‘g‘ri." }, { status: 400 });

  try {
    const updates: IntegrationCredentialUpdates = {};
    const requested = parsed.data;
    if (requested.mail) {
      const current = await getMailCredentials();
      updates.mail = {
        address: updateValue(requested.mail.address?.toLowerCase(), false, current.address),
        // Google shows app passwords in groups of four; the spaces are not part of it.
        password: updateValue(requested.mail.password?.replace(/\s+/g, ""), requested.mail.clearPassword, current.password),
        host: updateValue(requested.mail.host, false, current.host) || "smtp.gmail.com",
        port: requested.mail.port ?? current.port,
        senderName: updateValue(requested.mail.senderName, false, current.senderName) || "Tecsecure"
      };
    }
    if (requested.sms) {
      const current = await getSmsCredentials();
      updates.sms = {
        eskizEmail: updateValue(requested.sms.eskizEmail, requested.sms.clearEskizEmail, current.eskizEmail),
        eskizPassword: updateValue(requested.sms.eskizPassword, requested.sms.clearEskizPassword, current.eskizPassword),
        eskizFrom: updateValue(requested.sms.eskizFrom, false, current.eskizFrom) || "4546"
      };
    }
    if (requested.telegram) {
      const current = await getTelegramCredentials();
      updates.telegram = {
        botToken: updateValue(requested.telegram.botToken, requested.telegram.clearBotToken, current.botToken),
        botUsername: updateValue(requested.telegram.botUsername, requested.telegram.clearBotUsername, current.botUsername),
        adminChatId: updateValue(requested.telegram.adminChatId, requested.telegram.clearAdminChatId, current.adminChatId),
        webhookSecret: updateValue(requested.telegram.webhookSecret, requested.telegram.clearWebhookSecret, current.webhookSecret),
        staffBotToken: updateValue(requested.telegram.staffBotToken, requested.telegram.clearStaffBotToken, current.staffBotToken),
        staffBotUsername: updateValue(requested.telegram.staffBotUsername, requested.telegram.clearStaffBotUsername, current.staffBotUsername),
        staffWebhookSecret: updateValue(requested.telegram.staffWebhookSecret, requested.telegram.clearStaffWebhookSecret, current.staffWebhookSecret),
        shopBotToken: updateValue(requested.telegram.shopBotToken, requested.telegram.clearShopBotToken, current.shopBotToken),
        shopBotUsername: updateValue(requested.telegram.shopBotUsername, requested.telegram.clearShopBotUsername, current.shopBotUsername),
        shopWebhookSecret: updateValue(requested.telegram.shopWebhookSecret, requested.telegram.clearShopWebhookSecret, current.shopWebhookSecret)
      };
    }
    if (requested.yandexMaps) {
      const current = await getYandexMapsCredentials();
      updates.yandexMaps = {
        apiKey: updateValue(requested.yandexMaps.apiKey, requested.yandexMaps.clearApiKey, current.apiKey)
      };
    }
    if (requested.oauth) {
      const oauth: Partial<Record<OAuthProviderId, OAuthCredentials>> = {};
      await Promise.all(oauthProviderIds.map(async (provider) => {
        const requestedProvider = requested.oauth?.[provider];
        if (!requestedProvider) return;
        const current = await getOAuthCredentials(provider);
        oauth[provider] = {
          clientId: updateValue(requestedProvider.clientId, requestedProvider.clearClientId, current.clientId),
          clientSecret: updateValue(requestedProvider.clientSecret, requestedProvider.clearClientSecret, current.clientSecret),
          ...(provider === "microsoft" ? {
            tenantId: updateValue(requestedProvider.tenantId, requestedProvider.clearTenantId, current.tenantId ?? "common")
          } : {})
        };
      }));
      if (Object.keys(oauth).length) updates.oauth = oauth;
    }
    await saveIntegrationCredentials(updates, actor.id);
    return Response.json({ integrations: await getIntegrationStatus() }, {
      headers: { "Cache-Control": "private, no-store" }
    });
  } catch (error) {
    console.error("Admin integration credential update failed", error instanceof Error ? error.name : "UnknownError");
    return Response.json({
      error: "Sozlamalarni shifrlab saqlab bo‘lmadi. Serverdagi INTEGRATION_CREDENTIALS_KEY yoki NEXTAUTH_SECRET sozlamasini tekshiring."
    }, { status: 500 });
  }
}
