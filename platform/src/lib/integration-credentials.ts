import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const oauthProviderIds = ["google", "github", "yandex", "microsoft"] as const;
export type OAuthProviderId = (typeof oauthProviderIds)[number];

export type TelegramCredentials = {
  botToken: string;
  botUsername: string;
  adminChatId: string;
  webhookSecret: string;
};
export type OAuthCredentials = {
  clientId: string;
  clientSecret: string;
  tenantId?: string;
};
export type YandexMapsCredentials = { apiKey: string };

const telegramSchema = z.object({
  botToken: z.string().max(512),
  botUsername: z.string().max(100),
  adminChatId: z.string().max(100),
  webhookSecret: z.string().max(512)
}).strict();
const oauthSchema = z.object({
  clientId: z.string().max(512),
  clientSecret: z.string().max(1024),
  tenantId: z.string().max(128).optional()
}).strict();
const yandexMapsSchema = z.object({ apiKey: z.string().max(512) }).strict();

const credentialStorageKeys = {
  telegram: "integration:telegram",
  yandexMaps: "integration:yandex-maps",
  oauth: (provider: OAuthProviderId) => `integration:oauth:${provider}`
} as const;

function deriveKey(masterSecret: string, storageKey: string): Buffer {
  if (Buffer.byteLength(masterSecret, "utf8") < 32) {
    throw new Error("Set INTEGRATION_CREDENTIALS_KEY or use a NEXTAUTH_SECRET with at least 32 bytes.");
  }
  return Buffer.from(hkdfSync(
    "sha256",
    masterSecret,
    Buffer.from("tecsecure-integration-credentials-v1"),
    Buffer.from(storageKey),
    32
  ));
}

function getMasterSecret(): string {
  const secret = process.env.INTEGRATION_CREDENTIALS_KEY || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Integration credential encryption is not configured.");
  return secret;
}

export function encryptIntegrationCredential(plaintext: string, storageKey: string, masterSecret: string): string {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(masterSecret, storageKey), nonce);
  cipher.setAAD(Buffer.from(storageKey));
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return ["v1", nonce.toString("base64url"), cipher.getAuthTag().toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptIntegrationCredential(encrypted: string, storageKey: string, masterSecret: string): string {
  const [version, nonceValue, tagValue, ciphertextValue, ...extra] = encrypted.split(".");
  if (version !== "v1" || !nonceValue || !tagValue || !ciphertextValue || extra.length > 0) {
    throw new Error("Stored integration credential has an unsupported format.");
  }
  try {
    const decipher = createDecipheriv("aes-256-gcm", deriveKey(masterSecret, storageKey), Buffer.from(nonceValue, "base64url"));
    decipher.setAAD(Buffer.from(storageKey));
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, "base64url")),
      decipher.final()
    ]).toString("utf8");
  } catch {
    throw new Error("Stored integration credential could not be decrypted.");
  }
}

async function readStoredConfig<T>(
  storageKey: string,
  schema: z.ZodType<T>,
  fallback: T
): Promise<T> {
  const record = await prisma.siteSetting.findUnique({
    where: { key: storageKey },
    select: { value: true }
  });
  if (!record) return fallback;
  const plaintext = decryptIntegrationCredential(record.value, storageKey, getMasterSecret());
  let value: unknown;
  try {
    value = JSON.parse(plaintext);
  } catch {
    throw new Error(`Stored ${storageKey} settings are not valid JSON.`);
  }
  return schema.parse(value);
}

export async function getTelegramCredentials(): Promise<TelegramCredentials> {
  return readStoredConfig(
    credentialStorageKeys.telegram,
    telegramSchema,
    {
      botToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
      botUsername: process.env.TELEGRAM_BOT_USERNAME ?? "",
      adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID ?? "",
      webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET ?? ""
    }
  );
}

export async function getOAuthCredentials(provider: OAuthProviderId): Promise<OAuthCredentials> {
  const environmentCredentials: Record<OAuthProviderId, OAuthCredentials> = {
    google: { clientId: process.env.GOOGLE_CLIENT_ID ?? "", clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "" },
    github: { clientId: process.env.GITHUB_CLIENT_ID ?? "", clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "" },
    yandex: { clientId: process.env.YANDEX_CLIENT_ID ?? "", clientSecret: process.env.YANDEX_CLIENT_SECRET ?? "" },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID ?? "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
      tenantId: process.env.MICROSOFT_TENANT_ID ?? "common"
    }
  };
  return readStoredConfig(credentialStorageKeys.oauth(provider), oauthSchema, environmentCredentials[provider]);
}

export async function getYandexMapsCredentials(): Promise<YandexMapsCredentials> {
  return readStoredConfig(
    credentialStorageKeys.yandexMaps,
    yandexMapsSchema,
    { apiKey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? "" }
  );
}

export type IntegrationStatus = {
  telegram: {
    botUsername: string;
    adminChatId: string;
    hasBotToken: boolean;
    hasWebhookSecret: boolean;
  };
  yandexMaps: { configured: boolean };
  oauth: Record<OAuthProviderId, {
    clientId: string;
    tenantId?: string;
    hasClientSecret: boolean;
    configured: boolean;
  }>;
};

export async function getIntegrationStatus(): Promise<IntegrationStatus> {
  const [telegram, yandexMaps, google, github, yandex, microsoft] = await Promise.all([
    getTelegramCredentials(),
    getYandexMapsCredentials(),
    getOAuthCredentials("google"),
    getOAuthCredentials("github"),
    getOAuthCredentials("yandex"),
    getOAuthCredentials("microsoft")
  ]);
  const oauth = { google, github, yandex, microsoft };
  return {
    telegram: {
      botUsername: telegram.botUsername,
      adminChatId: telegram.adminChatId,
      hasBotToken: Boolean(telegram.botToken),
      hasWebhookSecret: Boolean(telegram.webhookSecret)
    },
    yandexMaps: { configured: Boolean(yandexMaps.apiKey) },
    oauth: Object.fromEntries(oauthProviderIds.map((provider) => [
      provider,
      {
        clientId: oauth[provider].clientId,
        ...(provider === "microsoft" ? { tenantId: oauth.microsoft.tenantId ?? "common" } : {}),
        hasClientSecret: Boolean(oauth[provider].clientSecret),
        configured: Boolean(oauth[provider].clientId && oauth[provider].clientSecret)
      }
    ])) as IntegrationStatus["oauth"]
  };
}

export type IntegrationCredentialUpdates = {
  telegram?: TelegramCredentials;
  yandexMaps?: YandexMapsCredentials;
  oauth?: Partial<Record<OAuthProviderId, OAuthCredentials>>;
};

export async function saveIntegrationCredentials(
  updates: IntegrationCredentialUpdates,
  actorId: string
): Promise<void> {
  const records: { key: string; value: string }[] = [];
  if (updates.telegram) {
    const config = telegramSchema.parse(updates.telegram);
    const key = credentialStorageKeys.telegram;
    records.push({ key, value: encryptIntegrationCredential(JSON.stringify(config), key, getMasterSecret()) });
  }
  if (updates.yandexMaps) {
    const config = yandexMapsSchema.parse(updates.yandexMaps);
    const key = credentialStorageKeys.yandexMaps;
    records.push({ key, value: encryptIntegrationCredential(JSON.stringify(config), key, getMasterSecret()) });
  }
  for (const provider of oauthProviderIds) {
    const config = updates.oauth?.[provider];
    if (!config) continue;
    const key = credentialStorageKeys.oauth(provider);
    records.push({
      key,
      value: encryptIntegrationCredential(JSON.stringify(oauthSchema.parse(config)), key, getMasterSecret())
    });
  }
  if (!records.length) throw new Error("No integration credentials were provided.");

  await prisma.$transaction(async (tx) => {
    await Promise.all(records.map(({ key, value }) =>
      tx.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } })
    ));
    await tx.auditLog.create({
      data: { actorId, action: "INTEGRATION_CREDENTIALS_UPDATED", entity: "IntegrationCredential" }
    });
  });
}
