import { getCurrentUser, type AuthUser } from "./auth";
import { getTelegramCredentials } from "./integration-credentials";
import { prisma } from "./prisma";
import { sendTelegramMessage, withTelegramBot } from "./telegram";
import { shopSlug } from "./shops";

/** A slug no other shop has: the name's own, or with -2, -3… added. */
export async function freeShopSlug(name: string): Promise<string> {
  const base = shopSlug(name);
  for (let n = 1; n < 200; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    if (!(await prisma.shop.findUnique({ where: { slug: candidate }, select: { id: true } }))) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** The signed-in person's shop, whatever its status. A Response when they may not have one. */
export async function currentShopOwner(): Promise<{ user: AuthUser; shop: Awaited<ReturnType<typeof loadShop>> } | Response> {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") return Response.json({ error: "Xodim hisobi do‘kon ocha olmaydi. Mijoz hisobi bilan kiring.", code: "STAFF_ACCOUNT" }, { status: 403 });
  return { user, shop: await loadShop(user.id) };
}

export async function loadShop(ownerId: string) {
  return prisma.shop.findUnique({ where: { ownerId } });
}

/**
 * Tells a shop owner something in Telegram: through the shop bot when it is set up, otherwise the
 * customer bot. Silent when they never connected Telegram; the cabinet shows the same news.
 */
export async function notifyShopOwner(ownerId: string, text: string): Promise<boolean> {
  try {
    const owner = await prisma.user.findUnique({ where: { id: ownerId }, select: { telegramChatId: true } });
    if (!owner?.telegramChatId) return false;
    const credentials = await getTelegramCredentials();
    const bot = credentials.shopBotToken ? "shop" : "customer";
    await withTelegramBot(bot, () => sendTelegramMessage(owner.telegramChatId as string, text));
    return true;
  } catch (error) {
    console.error("Shop owner notification failed", error instanceof Error ? error.message : "UnknownError");
    return false;
  }
}

/** A plain note to the staff chat (no reply buttons: shop events are handled in the admin panel). */
export async function notifyStaffPlain(text: string): Promise<boolean> {
  try {
    const { adminChatId } = await getTelegramCredentials();
    if (!adminChatId) return false;
    await withTelegramBot("staff", () => sendTelegramMessage(adminChatId, text));
    return true;
  } catch (error) {
    console.error("Staff notification failed", error instanceof Error ? error.message : "UnknownError");
    return false;
  }
}
