import { z } from "zod";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { escapeTelegramHtml } from "@/lib/telegram";
import { syncShopProducts, shopAppUrl } from "@/lib/marketplace-server";
import { notifyShopOwner } from "@/lib/shop-server";

export const runtime = "nodejs";

const schema = z.object({ action: z.enum(["APPROVE", "REJECT"]), note: z.string().trim().max(500).optional() })
  .refine(value => value.action !== "REJECT" || (value.note?.length ?? 0) >= 3, { path: ["note"], message: "Rad etish sababini yozing." });

/** Staff approve a shop's listing (it goes on sale if the shop has it switched on) or reject it with a reason. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireModuleApi("PRODUCTS");
  if (isResponse(actor)) return actor;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Qaror noto‘g‘ri." }, { status: 400 });
  const product = await prisma.product.findFirst({ where: { id, shopId: { not: null }, status: { not: "ARCHIVED" } }, select: { id: true, name: true, moderation: true, shop: { select: { ownerId: true } } } });
  if (!product?.shop) return Response.json({ error: "Mahsulot topilmadi." }, { status: 404 });
  const approve = parsed.data.action === "APPROVE";
  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: { moderation: approve ? "APPROVED" : "REJECTED", moderationNote: approve ? null : parsed.data.note } });
    await syncShopProducts(tx, { productIds: [id] });
    await tx.auditLog.create({ data: { actorId: actor.id, action: approve ? "SHOP_PRODUCT_APPROVED" : "SHOP_PRODUCT_REJECTED", entity: "Product", entityId: id, metadata: { note: parsed.data.note ?? null } } });
  });
  const open = shopAppUrl(`product:${id}`);
  await notifyShopOwner(product.shop.ownerId, approve
    ? `✅ <b>Mahsulot tasdiqlandi</b>\n${escapeTelegramHtml(product.name)}\nEndi u saytda sotuvda (agar o‘zingiz yashirmagan bo‘lsangiz).`
    : `❌ <b>Mahsulot rad etildi</b>\n${escapeTelegramHtml(product.name)}\nSabab: ${escapeTelegramHtml(parsed.data.note ?? "")}\nTuzatib, qayta saqlang — yana tekshiramiz.`,
    open ? { replyMarkup: { inline_keyboard: [[{ text: "Mahsulotni ochish", web_app: { url: open } }]] } } : {});
  return Response.json({ ok: true });
}
