import { z } from "zod";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { changeShopBalance } from "@/lib/marketplace-server";
import { notifyShopOwner } from "@/lib/shop-server";
import { escapeTelegramHtml } from "@/lib/telegram";
import { formatMinor } from "@/lib/format";

export const runtime = "nodejs";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("PAID"), reference: z.string().trim().min(1).max(120) }),
  z.object({ action: z.literal("REJECT"), note: z.string().trim().min(3).max(500) })
]);

/**
 * Staff mark a payout paid (with the bank payment number) after sending the money, or reject it with a
 * reason, which returns the held amount to the shop's balance.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdminApi();
  if (actor instanceof Response) return actor;
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "To‘lov raqamini yoki rad etish sababini yozing." }, { status: 400 });
  const payout = await prisma.shopPayout.findUnique({ where: { id }, select: { id: true, shopId: true, amountMinor: true, status: true, shop: { select: { ownerId: true } } } });
  if (!payout) return Response.json({ error: "So‘rov topilmadi." }, { status: 404 });
  const done = await prisma.$transaction(async (tx) => {
    const claim = await tx.shopPayout.updateMany({
      where: { id, status: "REQUESTED" },
      data: parsed.data.action === "PAID"
        ? { status: "PAID", paymentReference: parsed.data.reference, reviewedById: actor.id, reviewedAt: new Date() }
        : { status: "REJECTED", reviewNote: parsed.data.note, reviewedById: actor.id, reviewedAt: new Date() }
    });
    if (claim.count === 0) return false;
    if (parsed.data.action === "REJECT") {
      await changeShopBalance(tx, payout.shopId, payout.amountMinor, { kind: "PAYOUT_RETURNED", payoutId: id, note: parsed.data.note, actorId: actor.id });
    }
    await tx.auditLog.create({ data: { actorId: actor.id, action: parsed.data.action === "PAID" ? "SHOP_PAYOUT_PAID" : "SHOP_PAYOUT_REJECTED", entity: "ShopPayout", entityId: id } });
    return true;
  });
  if (!done) return Response.json({ error: "Bu so‘rov allaqachon ko‘rib chiqilgan." }, { status: 409 });
  const amount = escapeTelegramHtml(formatMinor(payout.amountMinor, "UZS"));
  await notifyShopOwner(payout.shop.ownerId, parsed.data.action === "PAID"
    ? `✅ <b>Pul o‘tkazildi: ${amount}</b>\nTo‘lov raqami: <code>${escapeTelegramHtml(parsed.data.reference)}</code>`
    : `↩️ <b>Pul yechish so‘rovi qaytarildi</b>\n${amount} balansingizga qaytdi.\nSabab: ${escapeTelegramHtml(parsed.data.note)}`);
  return Response.json({ ok: true });
}
