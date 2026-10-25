import { requireAdminApi } from "@/lib/auth";
import {
  getIntegrationStatus,
  getOAuthCredentials,
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
    if (requested.telegram) {
      const current = await getTelegramCredentials();
      updates.telegram = {
        botToken: updateValue(requested.telegram.botToken, requested.telegram.clearBotToken, current.botToken),
        botUsername: updateValue(requested.telegram.botUsername, requested.telegram.clearBotUsername, current.botUsername),
        adminChatId: updateValue(requested.telegram.adminChatId, requested.telegram.clearAdminChatId, current.adminChatId),
        webhookSecret: updateValue(requested.telegram.webhookSecret, requested.telegram.clearWebhookSecret, current.webhookSecret)
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
