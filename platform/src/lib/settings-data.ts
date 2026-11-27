import { prisma } from "./prisma";
import { isReservedEmail } from "./validation";
import type { SettingsState } from "@/components/cabinet/settings-views";

/** What the settings pages show about the account: no secrets, only states. */
export async function settingsState(userId: string): Promise<SettingsState> {
  const account = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, email: true, phone: true, phoneVerifiedAt: true, role: true, twoFactorEnabledAt: true, telegramChatId: true, oauthAccounts: { select: { provider: true } } }
  });
  return {
    name: account.name,
    email: isReservedEmail(account.email) ? null : account.email,
    storedEmail: account.email,
    phone: account.phone, phoneVerified: Boolean(account.phoneVerifiedAt),
    staff: account.role !== "CUSTOMER",
    twoFactor: Boolean(account.twoFactorEnabledAt), telegram: Boolean(account.telegramChatId),
    providers: [...new Set(account.oauthAccounts.map(item => item.provider.charAt(0).toUpperCase() + item.provider.slice(1)))]
  };
}
