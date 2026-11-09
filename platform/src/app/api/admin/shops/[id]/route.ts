import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nextShopStatus, shopReviewSchema } from "@/lib/shops";
import { notifyShopOwner } from "@/lib/shop-server";
import { escapeTelegramHtml } from "@/lib/telegram";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

const ownerMessages: Record<string, (note: string | null) => string> = {
  APPROVE: () => "✅ <b>Do‘koningiz tasdiqlandi.</b>\nEndi kabinetda mahsulot va narx qo‘sha olasiz.",
  REJECT: note => `❌ <b>Do‘kon arizasi rad etildi.</b>${note ? `\nSabab: ${escapeTelegramHtml(note)}` : ""}\nMa’lumotlarni tuzatib, kabinetdan qayta yuborishingiz mumkin.`,
  SUSPEND: note => `⏸ <b>Do‘koningiz vaqtincha to‘xtatildi.</b>${note ? `\nSabab: ${escapeTelegramHtml(note)}` : ""}\nMahsulotlaringiz saytda ko‘rinmaydi.`,
  REACTIVATE: () => "▶️ <b>Do‘koningiz qayta ishga tushirildi.</b>"
};

/** Staff decide on a shop: approve, reject with a reason, suspend, bring back, or change its commission. */
export async function PATCH(request: Request, context: Context) {
  const actor = await requireAdminApi();
  if (actor instanceof Response) return actor;
  const { id } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = shopReviewSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Qaror ma’lumotlari noto‘g‘ri.", details: parsed.error.flatten() }, { status: 400 });
  const shop = await prisma.shop.findUnique({ where: { id }, select: { id: true, status: true, ownerId: true } });
  if (!shop) return Response.json({ error: "Do‘kon topilmadi." }, { status: 404 });
  const { action, note, commissionPercent, referralCommissionPercent } = parsed.data;
  const status = nextShopStatus(shop.status, action);
  if (!status) return Response.json({ error: "Bu holatdagi do‘konga bu amalni qo‘llab bo‘lmaydi.", code: "BAD_TRANSITION" }, { status: 409 });
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.shop.update({
      where: { id },
      data: {
        status,
        ...(action === "APPROVE" ? { approvedAt: new Date(), reviewNote: null } : {}),
        ...(action === "REJECT" || action === "SUSPEND" ? { reviewNote: note ?? null } : {}),
        ...(commissionPercent !== undefined ? { commissionPercent } : {}),
        ...(referralCommissionPercent !== undefined ? { referralCommissionPercent } : {})
      }
    });
    await tx.auditLog.create({
      data: { actorId: actor.id, action: `SHOP_${action}`, entity: "Shop", entityId: id, metadata: { from: shop.status, to: status, commissionPercent, referralCommissionPercent, note: note ?? null } }
    });
    if (action !== "UPDATE") {
      await tx.notification.create({ data: { userId: shop.ownerId, channel: "IN_APP", event: `SHOP_${action}`, status: "DELIVERED", payload: { shopId: id, note: note ?? null } } });
    }
    return result;
  });
  if (action !== "UPDATE") await notifyShopOwner(shop.ownerId, ownerMessages[action](note ?? null));
  return Response.json({ shop: updated });
}
