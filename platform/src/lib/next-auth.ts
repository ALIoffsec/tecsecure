import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import AzureAD from "next-auth/providers/azure-ad";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Yandex from "next-auth/providers/yandex";
import type { NextAuthOptions } from "next-auth";
import { createSession } from "@/lib/auth";
import { getOAuthCredentials } from "@/lib/integration-credentials";
import { prisma } from "@/lib/prisma";

function normalizedEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length > 0 && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : null;
}

export async function getAuthOptions(): Promise<NextAuthOptions> {
  const [googleCredentials, githubCredentials, yandexCredentials, microsoftCredentials] = await Promise.all([
    getOAuthCredentials("google"),
    getOAuthCredentials("github"),
    getOAuthCredentials("yandex"),
    getOAuthCredentials("microsoft")
  ]);
  const hasAuthSecret = Boolean(process.env.NEXTAUTH_SECRET);
  const providers: NextAuthOptions["providers"] = [
    ...(hasAuthSecret && googleCredentials.clientId && googleCredentials.clientSecret
      ? [Google({ clientId: googleCredentials.clientId, clientSecret: googleCredentials.clientSecret })]
      : []),
    ...(hasAuthSecret && githubCredentials.clientId && githubCredentials.clientSecret
      ? [GitHub({ clientId: githubCredentials.clientId, clientSecret: githubCredentials.clientSecret })]
      : []),
    ...(hasAuthSecret && yandexCredentials.clientId && yandexCredentials.clientSecret
      ? [Yandex({ clientId: yandexCredentials.clientId, clientSecret: yandexCredentials.clientSecret })]
      : []),
    ...(hasAuthSecret && microsoftCredentials.clientId && microsoftCredentials.clientSecret
      ? [AzureAD({
          clientId: microsoftCredentials.clientId,
          clientSecret: microsoftCredentials.clientSecret,
          id: "microsoft",
          name: "Microsoft",
          tenantId: microsoftCredentials.tenantId ?? "common"
        })]
      : [])
  ];

  return {
    providers,
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt", maxAge: 14 * 24 * 60 * 60 },
    pages: { signIn: "/login" },
    callbacks: {
      async signIn({ account, profile, user }) {
        if (!account || account.type !== "oauth") return false;
        if (!["google", "github", "yandex", "microsoft"].includes(account.provider)) return false;

        const identity = await prisma.oAuthAccount.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId
            }
          },
          select: { user: { select: { id: true, role: true, active: true } } }
        });
        if (identity) {
          if (!identity.user.active || identity.user.role !== "CUSTOMER") return false;
          await createSession(identity.user.id);
          return true;
        }

        const claims = profile && typeof profile === "object" ? profile as Record<string, unknown> : {};
        const email = normalizedEmail(
          user.email ?? claims.email ?? claims.default_email ?? claims.preferred_username
        );
        if (!email) throw new Error("OAuth provider did not return a usable email address.");

        const existingEmail = await prisma.user.findUnique({ where: { email }, select: { id: true } });
        if (existingEmail) {
          throw new Error("This email already has an account. Sign in with that account before linking OAuth.");
        }

        const nameValue = user.name ?? claims.name ?? claims.real_name ?? claims.display_name ?? claims.login;
        const name = typeof nameValue === "string" && nameValue.trim()
          ? nameValue.trim().slice(0, 100)
          : email;
        const passwordHash = await hash(randomBytes(32).toString("base64url"), 12);
        const created = await prisma.user.create({
          data: {
            name,
            email,
            passwordHash,
            role: "CUSTOMER",
            oauthAccounts: {
              create: {
                provider: account.provider,
                providerAccountId: account.providerAccountId
              }
            }
          },
          select: { id: true }
        });
        await createSession(created.id);
        return true;
      }
    }
  };
}
