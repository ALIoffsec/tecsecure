import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { changeShopBalance } from "@/lib/marketplace-server";
import { notifyStaffPlain } from "@/lib/shop-server";
import { escapeTelegramHtml } from "@/lib/telegram";
import { formatMinor } from "@/lib/format";
import { noStore, requireSellingShop } from "@/lib/shop-products-server";

export const runtime = "nodejs";

/**
 * The shop asks for money from its balance. The amount is held at once (it leaves the balance), so it
 * cannot be asked twice or spent on advertising meanwhile; one request is open at a time.
 */
export async function POST(request: Request) {
  const seller = await requireSellingShop();
  if (seller instanceof Response) return seller;
  if (!(await checkRateLimit("shop-payout", seller.shop.id, 10, 24 * 60 * 60 * 1000))) return Response.json({ error: "Bugun boshqa so‘rov yuborib bo‘lmaydi." }, { status: 429 });
  const parsed = z.object({ amountMinor: z.number().int().positive() }).strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Summani kiriting." }, { status: 400 });
  const { payoutBankName, payoutAccount, payoutMfo, payoutRecipient } = seller.shop;
  if (!payoutBankName || !payoutAccount || !payoutMfo || !payoutRecipient) return Response.json({ error: "Avval bank rekvizitlarini kiriting.", code: "NO_DETAILS" }, { status: 409 });
  if (await prisma.shopPayout.count({ where: { shopId: seller.shop.id, status: "REQUESTED" } })) {
    return Response.json({ error: "Oldingi so‘rov hali ko‘rib chiqilmoqda.", code: "PAYOUT_OPEN" }, { status: 409 });
  }
  const amount = parsed.data.amountMinor;
  const payout = await prisma.$transaction(async (tx) => {
    const created = await tx.shopPayout.create({ data: { shopId: seller.shop.id, amountMinor: amount, bankName: payoutBankName, account: payoutAccount, mfo: payoutMfo, recipient: payoutRecipient } });
    const balance = await changeShopBalance(tx, seller.shop.id, -amount, { kind: "PAYOUT", payoutId: created.id, note: "Pul yechish so‘rovi", actorId: seller.user.id });
    if (balance === null) throw new Error("BALANCE_TOO_LOW");
    await tx.auditLog.create({ data: { actorId: seller.user.id, action: "SHOP_PAYOUT_REQUESTED", entity: "ShopPayout", entityId: created.id, metadata: { amount } } });
    return created;
  }).catch(error => { if (error instanceof Error && error.message === "BALANCE_TOO_LOW") return null; throw error; });
  if (!payout) return Response.json({ error: "Balansda bu summa yo‘q.", code: "BALANCE_TOO_LOW" }, { status: 409 });
  await notifyStaffPlain(`<b>💸 Pul yechish so‘rovi</b>\nDo‘kon: ${escapeTelegramHtml(seller.shop.name)}\nSumma: <b>${escapeTelegramHtml(formatMinor(amount, "UZS"))}</b>\nBank: ${escapeTelegramHtml(payoutBankName)}, MFO ${escapeTelegramHtml(payoutMfo)}\n\nAdmin panel → Do‘konlar → To‘lovlar.`);
  return Response.json({ payout }, { status: 201, headers: noStore });
}
