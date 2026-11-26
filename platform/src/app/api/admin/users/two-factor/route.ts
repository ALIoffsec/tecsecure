import { z } from "zod";
import { isResponse, requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireReauth } from "@/lib/reauth";
import { notifyTelegramUser } from "@/lib/telegram";
import { resetTwoFactor } from "@/lib/two-factor";

export const runtime = "nodejs";

const schema = z.object({ id: z.string().cuid(), reason: z.string().trim().min(3).max(300) });

/**
 * Turns two-factor off for someone who lost the authenticator and the backup codes. The admin confirms with
 * their own password (and code); an admin account can be reset only by the founder, the founder only by the
 * server script, and nobody resets their own here.
 */
export async function POST(request: Request) {
  const actor = await requireAdminApi();
  if (isResponse(actor)) return actor;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Sababni yozing (3–300 belgi)." }, { status: 400 });
  if (parsed.data.id === actor.id) return Response.json({ error: "O‘z hisobingizning 2FA’sini bu yerdan tiklab bo‘lmaydi." }, { status: 400 });
  const target = await prisma.user.findUnique({ where: { id: parsed.data.id }, select: { id: true, role: true, deletedAt: true, twoFactorEnabledAt: true } });
  if (!target || target.deletedAt) return Response.json({ error: "Foydalanuvchi topilmadi." }, { status: 404 });
  if (target.role === "FOUNDER") return Response.json({ error: "Asoschi 2FA’si faqat serverdagi buyruq bilan tiklanadi." }, { status: 403 });
  if (target.role === "ADMIN" && actor.role !== "FOUNDER") return Response.json({ error: "Faqat asoschi administrator akkauntlarini boshqara oladi." }, { status: 403 });
  if (!target.twoFactorEnabledAt) return Response.json({ error: "Bu hisobda ikki bosqichli himoya yoqilmagan." }, { status: 409 });
  const confirmed = await requireReauth(actor, "ADMIN_RESET_2FA");
  if (confirmed instanceof Response) return confirmed;
  await resetTwoFactor(target.id, actor.id, parsed.data.reason, "admin");
  await notifyTelegramUser(target.id, "🔐 <b>Tecsecure</b>\nHisobingizdagi ikki bosqichli himoya administrator tomonidan o‘chirildi va barcha qurilmalardan chiqarildingiz. Kirgach, uni qayta yoqing. Buni siz so‘ramagan bo‘lsangiz, darhol biz bilan bog‘laning.");
  return Response.json({ ok: true });
}
