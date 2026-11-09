import { clientIp } from "@/lib/client-ip";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { getTelegramCredentials } from "@/lib/integration-credentials";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyTelegramInitData } from "@/lib/telegram-webapp";

export const runtime = "nodejs";

const schema = z.object({ initData: z.string().min(10).max(4096), app: z.enum(["customer", "staff", "shop"]), create: z.boolean().optional() });

/** Signs a Mini App user in. Staff must have linked their Telegram first; customers may create an account here. */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!(await checkRateLimit("telegram-webapp", ip, 60, 60 * 60 * 1000))) return Response.json({ error: "Urinishlar limiti oshdi. Keyinroq urinib ko‘ring." }, { status: 429 });
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "So‘rov noto‘g‘ri." }, { status: 400 });

  const credentials = await getTelegramCredentials();
  const token = parsed.data.app === "staff" ? credentials.staffBotToken || credentials.botToken
    : parsed.data.app === "shop" ? credentials.shopBotToken || credentials.botToken
    : credentials.botToken;
  const telegramUser = verifyTelegramInitData(parsed.data.initData, token);
  if (!telegramUser) return Response.json({ error: "Telegram ma’lumotini tasdiqlab bo‘lmadi." }, { status: 401 });

  const chatId = String(telegramUser.id);
  const user = await prisma.user.findUnique({ where: { telegramChatId: chatId }, select: { id: true, role: true, active: true, deletedAt: true } });
  const isStaff = user?.role === "ADMIN" || user?.role === "STAFF" || user?.role === "FOUNDER";
  if (user && (!user.active || user.deletedAt)) return Response.json({ error: "Bu hisob faol emas." }, { status: 403 });

  if (parsed.data.app === "staff") {
    if (!user || !isStaff) return Response.json({ error: "Avval admin paneldan Telegram'ni xodim hisobingizga ulang.", code: "NOT_LINKED" }, { status: 403 });
    await createSession(user.id, true);
    return Response.json({ ok: true, next: "/admin/app" });
  }

  if (isStaff) return Response.json({ error: "Xodim hisobi uchun xodimlar botini oching.", code: "USE_STAFF_BOT" }, { status: 403 });
  // The shop app lands in the shop cabinet, where a new seller fills in the application.
  const next = parsed.data.app === "shop" ? "/shop" : "/products";
  if (user) {
    await createSession(user.id);
    return Response.json({ ok: true, next });
  }
  if (!parsed.data.create) return Response.json({ ok: false, needsAccount: true, name: telegramUser.first_name ?? "" });
  const name = [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" ").trim().slice(0, 100);
  const created = await prisma.user.create({
    data: {
      name: name.length >= 2 ? name : `Mijoz ${chatId.slice(-4)}`,
      email: `tg-${chatId}@accounts.tecsecure.invalid`,
      telegramChatId: chatId,
      passwordHash: await bcrypt.hash(randomBytes(32).toString("base64url"), 12)
    },
    select: { id: true }
  });
  await createSession(created.id);
  return Response.json({ ok: true, next });
}
