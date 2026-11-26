import { randomBytes } from "node:crypto";
import { getCurrentUser, isResponse, requireModuleApi } from "@/lib/auth";
import { deliveryMethodLabels, mergeItems, orderSchema, paymentMethodLabels, prepaidMethods } from "@/lib/orders";
import { deliveryOptions, regionNames, vatPart } from "@/lib/delivery";
import { getCheckoutSettings } from "@/lib/delivery-server";
import { getExchangeRates, toUzsMinor } from "@/lib/exchange";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { escapeTelegramHtml, notifyTelegramAdmins } from "@/lib/telegram";
import { pricesMatch } from "@/lib/catalog-utils";
import { formatMinor } from "@/lib/format";
import { paymeConfigured } from "@/lib/payme";
import { getCompanyRequisites } from "@/lib/payment-card";
import { cookies } from "next/headers";
import { commissionFor, LOW_STOCK, shopOrderMoney, splitDelivery } from "@/lib/marketplace";
import { shopAppUrl } from "@/lib/marketplace-server";
import { notifyShopOwner } from "@/lib/shop-server";
import { REFERRAL_COOKIE } from "@/lib/referral";
import { lockProof, proofInUse, proofUsedMessage } from "@/lib/payment-proof";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Buyurtma berish uchun hisobga kiring." }, { status: 401 });
  if (user.role !== "CUSTOMER") {
    return Response.json({ error: "Xodim hisobi bilan mijoz buyurtmasi berib bo‘lmaydi." }, { status: 403 });
  }
  if (!(await checkRateLimit("order-create", user.id, 10, 60 * 60 * 1000))) {
    return Response.json({ error: "Buyurtma limiti oshdi. Keyinroq urinib ko‘ring." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Buyurtma ma’lumotlarini tekshiring.", details: parsed.error.flatten() }, { status: 400 });
  }
  const { latitude, longitude } = parsed.data;
  if ((latitude == null) !== (longitude == null)) {
    return Response.json({ error: "Koordinatalar to‘liq emas." }, { status: 400 });
  }

  const merged = mergeItems(parsed.data.items);
  const products = await prisma.product.findMany({
    where: { id: { in: merged.map((item) => item.productId) }, status: "PUBLISHED" }
  });
  if (products.length !== merged.length) {
    return Response.json({ error: "Savatdagi ba’zi mahsulotlar endi mavjud emas." }, { status: 400 });
  }
  const byId = new Map(products.map((product) => [product.id, product]));
  if (merged.some((item) => byId.get(item.productId)?.stockStatus === "OUT_OF_STOCK")) {
    return Response.json({ error: "Savatdagi ba’zi mahsulotlar omborda yo‘q." }, { status: 400 });
  }
  // A counted stock is a hard limit: nobody can order more units than the seller has.
  const short = merged.find((item) => { const left = byId.get(item.productId)?.stockQuantity; return left !== null && left !== undefined && item.quantity > left; });
  if (short) {
    const product = byId.get(short.productId)!;
    return Response.json({ error: `“${product.name}” omborda faqat ${product.stockQuantity} dona qoldi.`, code: "STOCK_LIMIT", productId: product.id, available: product.stockQuantity }, { status: 409 });
  }
  // Shops ship their own goods, and the buyer's money must reach Tecsecure first, so their goods are paid in advance.
  const shopIds = [...new Set(products.map((product) => product.shopId).filter((id): id is string => Boolean(id)))];
  const shops = shopIds.length ? await prisma.shop.findMany({ where: { id: { in: shopIds }, status: "ACTIVE" }, select: { id: true, name: true, ownerId: true, commissionPercent: true, referralCommissionPercent: true } }) : [];
  if (shops.length !== shopIds.length) return Response.json({ error: "Savatdagi ba’zi do‘konlar hozir sotmayapti. Savatni yangilang.", code: "CATALOG_CHANGED" }, { status: 409 });
  if (shopIds.length > 0 && !prepaidMethods.includes(parsed.data.paymentMethod)) {
    return Response.json({ error: "Do‘konlar mahsulotini oldindan to‘lash kerak: kartaga o‘tkazma, hamyon, bank yoki Payme.", code: "SHOP_NEEDS_PREPAY" }, { status: 400 });
  }
  const referralId = (await cookies()).get(REFERRAL_COOKIE)?.value ?? null;
  const referralShopId = referralId && (await prisma.shop.findFirst({ where: { id: referralId, status: "ACTIVE" }, select: { id: true } }))?.id || null;
  if (parsed.data.expectedProducts && !pricesMatch(parsed.data.expectedProducts, products)) {
    return Response.json({ error: "Narx yoki mavjudlik o‘zgargan. Savatni yangilab, qayta tekshiring.", code: "CATALOG_CHANGED" }, { status: 409 });
  }

  // Prices always come from the database, never from the client. Every order is settled in so'm:
  // a price listed in dollars or roubles is converted at today's Central Bank rate, which the order keeps.
  const settings = await getCheckoutSettings();
  const rates = products.some((product) => product.currency !== "UZS") ? await getExchangeRates() : null;
  const lines = merged.map((item) => {
    const product = byId.get(item.productId)!;
    const unitPriceMinor = product.priceMinor === null ? null : toUzsMinor(product.priceMinor, product.currency, rates);
    return { product, quantity: item.quantity, unitPriceMinor };
  });
  const itemsTotalMinor = lines.every((line) => line.unitPriceMinor !== null)
    ? lines.reduce((sum, line) => sum + (line.unitPriceMinor as number) * line.quantity, 0)
    : null;

  // Delivery is priced here from the saved tariffs; where none covers the region it is agreed by phone.
  const region = parsed.data.region ?? null;
  let deliveryMethod = "AGREED";
  let deliveryFeeMinor: number | null = null;
  if (region) {
    const options = deliveryOptions(settings.tariffs, region, itemsTotalMinor);
    if (options.length > 0) {
      const option = options.find((item) => item.method === parsed.data.deliveryMethod);
      if (!option) return Response.json({ error: "Bu manzilga tanlangan yetkazish usuli mavjud emas.", code: "DELIVERY_UNAVAILABLE" }, { status: 400 });
      deliveryMethod = option.method;
      deliveryFeeMinor = option.feeMinor;
    }
  }
  const totalMinor = itemsTotalMinor === null ? null : itemsTotalMinor + (deliveryFeeMinor ?? 0);
  if ((parsed.data.expectedDeliveryFeeMinor !== undefined && parsed.data.expectedDeliveryFeeMinor !== deliveryFeeMinor)
    || (parsed.data.expectedTotalMinor !== undefined && parsed.data.expectedTotalMinor !== totalMinor)) {
    return Response.json({ error: "Yetkazish narxi yoki valyuta kursi yangilandi. Yangi summani tekshiring.", code: "TOTAL_CHANGED" }, { status: 409 });
  }
  if (totalMinor !== null && !Number.isSafeInteger(totalMinor)) {
    return Response.json({ error: "Buyurtma summasi juda katta. Biz bilan bog‘laning." }, { status: 400 });
  }
  const vatMinor = settings.vat === "INCLUDED" && totalMinor !== null ? vatPart(totalMinor) : null;

  // Each shop's part of the order: its goods, commission, its share of the delivery fee and what it earns.
  const groupTotal = (shopId: string | null) => lines.every((line) => line.unitPriceMinor !== null)
    ? lines.filter((line) => line.product.shopId === shopId).reduce((sum, line) => sum + (line.unitPriceMinor as number) * line.quantity, 0)
    : null;
  const hasOwnGoods = lines.some((line) => !line.product.shopId);
  const deliveryShares = splitDelivery(deliveryFeeMinor, [
    ...(hasOwnGoods ? [{ key: "tecsecure", itemsMinor: groupTotal(null) ?? 0 }] : []),
    ...shops.map((shop) => ({ key: shop.id, itemsMinor: groupTotal(shop.id) ?? 0 }))
  ]);
  const shipments = shops.map((shop) => {
    const itemsMinor = groupTotal(shop.id);
    const commissionPercent = commissionFor(shop, referralShopId);
    const deliveryShareMinor = deliveryShares.get(shop.id) ?? null;
    return { shop, itemsMinor, commissionPercent, deliveryShareMinor, ...shopOrderMoney(itemsMinor, commissionPercent, deliveryShareMinor) };
  });

  const { paymentMethod } = parsed.data;
  if (prepaidMethods.includes(paymentMethod) && totalMinor === null) {
    return Response.json({ error: "Narxi kelishiladigan mahsulot uchun to‘lovni qabul qilganda amalga oshiring.", code: "PREPAID_NEEDS_PRICE" }, { status: 400 });
  }
  if (paymentMethod === "ONLINE_PAYME" && !paymeConfigured()) {
    return Response.json({ error: "Onlayn to‘lov hozircha mavjud emas.", code: "ONLINE_UNAVAILABLE" }, { status: 400 });
  }
  if (paymentMethod === "BANK_TRANSFER" && !(await getCompanyRequisites())) {
    return Response.json({ error: "Bank o‘tkazmasi hozircha mavjud emas.", code: "BANK_UNAVAILABLE" }, { status: 400 });
  }
  if (parsed.data.paymentProofMediaId) {
    const proof = await prisma.mediaAsset.findUnique({ where: { id: parsed.data.paymentProofMediaId }, select: { ownerId: true, mimeType: true } });
    if (!proof || proof.ownerId !== user.id || !proof.mimeType.startsWith("image/")) {
      return Response.json({ error: "To‘lov chekini rasm ko‘rinishida yuklang." }, { status: 400 });
    }
  }

  try {
    const reference = `ORD-${new Date().getUTCFullYear()}-${randomBytes(5).toString("hex").toUpperCase()}`;
    const order = await prisma.$transaction(async (tx) => {
      // One receipt backs one payment: not another order, not a wallet top-up.
      if (parsed.data.paymentProofMediaId) {
        await lockProof(tx, parsed.data.paymentProofMediaId);
        if (await proofInUse(tx, parsed.data.paymentProofMediaId)) throw new Error("PROOF_USED");
      }
      // Counted stock is taken inside the transaction; a parallel order that took the last unit wins.
      for (const line of lines) {
        if (line.product.stockQuantity === null) continue;
        const taken = await tx.product.updateMany({ where: { id: line.product.id, stockQuantity: { gte: line.quantity } }, data: { stockQuantity: { decrement: line.quantity } } });
        if (taken.count === 0) throw new Error("STOCK_LIMIT");
        await tx.product.updateMany({ where: { id: line.product.id, stockQuantity: 0 }, data: { stockStatus: "OUT_OF_STOCK" } });
      }
      if (paymentMethod === "WALLET") {
        // The conditional update is the balance check: two parallel orders cannot both spend the same money.
        const charged = await tx.user.updateMany({
          where: { id: user.id, walletBalanceMinor: { gte: totalMinor as number } },
          data: { walletBalanceMinor: { decrement: totalMinor as number } }
        });
        if (charged.count === 0) throw new Error("WALLET_BALANCE_TOO_LOW");
        await tx.walletTransaction.create({
          data: { userId: user.id, kind: "ORDER_PAYMENT", status: "APPROVED", amountMinor: totalMinor as number, reference, reviewedAt: new Date() }
        });
      }
      const created = await tx.order.create({
        data: {
          reference,
          customerId: user.id,
          recipientName: parsed.data.recipientName,
          phone: parsed.data.phone,
          city: parsed.data.city,
          address: parsed.data.address,
          latitude: latitude ?? null,
          longitude: longitude ?? null,
          note: parsed.data.note || null,
          paymentMethod,
          paymentStatus: paymentMethod === "WALLET" ? "PAID" : paymentMethod === "CARD_TRANSFER" ? "AWAITING_CONFIRMATION" : paymentMethod === "BANK_TRANSFER" || paymentMethod === "ONLINE_PAYME" ? "AWAITING_PAYMENT" : "PENDING",
          customerType: parsed.data.customerType,
          companyName: parsed.data.customerType === "COMPANY" ? parsed.data.companyName : null,
          companyTin: parsed.data.customerType === "COMPANY" ? parsed.data.companyTin : null,
          paymentReference: parsed.data.paymentReference || null,
          paymentProofMediaId: parsed.data.paymentProofMediaId ?? null,
          totalMinor,
          currency: "UZS",
          region,
          deliveryMethod,
          deliveryFeeMinor,
          itemsTotalMinor,
          vatMinor,
          ...(rates ? { exchangeRates: { USD: rates.rates.USD, RUB: rates.rates.RUB, date: rates.date } } : {}),
          items: {
            create: lines.map((line) => ({
              productId: line.product.id,
              name: line.product.name,
              sku: line.product.sku,
              quantity: line.quantity,
              unitPriceMinor: line.unitPriceMinor,
              shopId: line.product.shopId,
              ...(line.product.currency !== "UZS" ? { listPriceMinor: line.product.priceMinor, listCurrency: line.product.currency } : {})
            }))
          },
          referralShopId,
          shipments: {
            create: shipments.map((part) => ({
              shopId: part.shop.id,
              itemsTotalMinor: part.itemsMinor,
              commissionPercent: part.commissionPercent,
              commissionMinor: part.commissionMinor,
              deliveryShareMinor: part.deliveryShareMinor,
              payoutMinor: part.payoutMinor
            }))
          },
          history: { create: { toStatus: "NEW", actorId: user.id } }
        },
        select: { id: true, reference: true, status: true, totalMinor: true }
      });
      await tx.portalConversation.create({
        data: {
          reference: created.reference,
          category: "ORDER",
          sourceType: "ORDER",
          sourceId: created.id,
          subject: "Yangi buyurtma",
          customerName: parsed.data.recipientName,
          customerPhone: parsed.data.phone,
          customerId: user.id,
          messages: {
            create: {
              sender: "CUSTOMER",
              body: [
                `Mahsulotlar: ${lines.map((line) => `${line.product.name} × ${line.quantity}`).join(", ")}`,
                `Yetkazish: ${deliveryMethodLabels[deliveryMethod]}${deliveryFeeMinor !== null ? ` (${formatMinor(deliveryFeeMinor, "UZS")})` : ""}`,
                `Manzil: ${[region ? regionNames.uz[region] : "", parsed.data.city, parsed.data.address].filter(Boolean).join(", ")}`,
                `To‘lov: ${paymentMethodLabels[paymentMethod]}`,
                parsed.data.note ? `Izoh: ${parsed.data.note}` : ""
              ].filter(Boolean).join("\n")
            }
          }
        }
      });
      const staff = await tx.user.findMany({
        where: { role: { in: ["FOUNDER", "ADMIN", "STAFF"] }, active: true },
        select: { id: true }
      });
      if (staff.length > 0) {
        await tx.notification.createMany({
          data: staff.map((member) => ({
            userId: member.id,
            channel: "IN_APP",
            event: "ORDER_RECEIVED",
            status: "DELIVERED",
            payload: { reference: created.reference, orderId: created.id }
          }))
        });
      }
      return created;
    });
    const telegramBody = [
      "<b>Yangi buyurtma</b>",
      `Raqam: <code>${escapeTelegramHtml(order.reference)}</code>`,
      `Qabul qiluvchi: ${escapeTelegramHtml(parsed.data.recipientName)}`,
      `Telefon: ${escapeTelegramHtml(parsed.data.phone)}`,
      `Manzil: ${escapeTelegramHtml([region ? regionNames.uz[region] : "", parsed.data.city, parsed.data.address].filter(Boolean).join(", "))}`,
      `Mahsulotlar: ${escapeTelegramHtml(lines.map((line) => `${line.product.name} × ${line.quantity}`).join(", "))}`,
      `Yetkazish: ${escapeTelegramHtml(deliveryMethodLabels[deliveryMethod])}${deliveryFeeMinor !== null ? ` — ${formatMinor(deliveryFeeMinor, "UZS")}` : ""}`,
      totalMinor !== null ? `Jami: <b>${formatMinor(totalMinor, "UZS")}</b>` : "Jami: kelishiladi",
      `To‘lov: ${escapeTelegramHtml(paymentMethodLabels[paymentMethod])}${paymentMethod === "CARD_TRANSFER" ? " — chekni admin panelda tekshiring" : ""}`,
      parsed.data.customerType === "COMPANY" ? `Kompaniya: ${escapeTelegramHtml(parsed.data.companyName ?? "")} (STIR ${escapeTelegramHtml(parsed.data.companyTin ?? "")})` : "",
      "",
      `Javob: <code>/reply ${escapeTelegramHtml(order.reference)} matn</code>`
    ].filter((line, index, lines) => line !== "" || index === lines.length - 2).join("\n");
    await notifyTelegramAdmins(telegramBody, order.reference);
    await notifyShopsOfOrder(order, shipments, lines, { recipientName: parsed.data.recipientName, address: [region ? regionNames.uz[region] : "", parsed.data.city, parsed.data.address].filter(Boolean).join(", "), deliveryMethod });
    return Response.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "PROOF_USED") {
      return Response.json({ error: proofUsedMessage, code: "PROOF_USED" }, { status: 409 });
    }
    if (error instanceof Error && error.message === "STOCK_LIMIT") {
      return Response.json({ error: "Kimdir hozirgina oxirgi donalarni sotib oldi. Savatni yangilang.", code: "STOCK_LIMIT" }, { status: 409 });
    }
    if (error instanceof Error && error.message === "WALLET_BALANCE_TOO_LOW") {
      return Response.json({ error: "Hamyonda mablag‘ yetarli emas. Boshqa to‘lov usulini tanlang yoki hisobni to‘ldiring.", code: "WALLET_BALANCE_TOO_LOW" }, { status: 409 });
    }
    console.error("Order creation failed", error);
    return Response.json({ error: "Buyurtmani saqlab bo‘lmadi. Qayta urinib ko‘ring." }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  const include = { items: true, history: { orderBy: { createdAt: "asc" as const } } };
  if (user.role === "CUSTOMER") {
    const orders = await prisma.order.findMany({ where: { customerId: user.id }, include, orderBy: { createdAt: "desc" }, take: 100 });
    return Response.json({ orders });
  }
  const authorized = await requireModuleApi("PRODUCTS");
  if (isResponse(authorized)) return authorized;
  const orders = await prisma.order.findMany({ include, orderBy: { createdAt: "desc" }, take: 200 });
  return Response.json({ orders });
}

type ShipmentPart = { shop: { id: string; name: string; ownerId: string }; payoutMinor: number | null };
type Line = { product: { id: string; name: string; shopId: string | null; stockQuantity: number | null }; quantity: number; unitPriceMinor: number | null };

/** Each shop hears about its own part only, with a button that opens the order in its app; low stock follows. */
async function notifyShopsOfOrder(order: { id: string; reference: string }, shipments: ShipmentPart[], lines: Line[], details: { recipientName: string; address: string; deliveryMethod: string }) {
  for (const part of shipments) {
    const own = lines.filter((line) => line.product.shopId === part.shop.id);
    const open = shopAppUrl(`order:${order.id}`);
    await notifyShopOwner(part.shop.ownerId, [
      "🛒 <b>Yangi buyurtma</b>",
      `Raqam: <code>${escapeTelegramHtml(order.reference)}</code>`,
      ...own.map((line) => `• ${escapeTelegramHtml(line.product.name)} × ${line.quantity}${line.unitPriceMinor !== null ? ` — ${escapeTelegramHtml(formatMinor(line.unitPriceMinor * line.quantity, "UZS"))}` : ""}`),
      `Qabul qiluvchi: ${escapeTelegramHtml(details.recipientName)}`,
      `Manzil: ${escapeTelegramHtml(details.address)}`,
      `Yetkazish: ${escapeTelegramHtml(deliveryMethodLabels[details.deliveryMethod] ?? details.deliveryMethod)}`,
      part.payoutMinor !== null ? `Sizga tushadi: <b>${escapeTelegramHtml(formatMinor(part.payoutMinor, "UZS"))}</b> (to‘lov tasdiqlangach va yetkazilgach)` : "",
      "",
      "To‘lov tasdiqlanganini kabinetda ko‘ring, keyin qabul qilib jo‘nating."
    ].filter((line, index, all) => line !== "" || index === all.length - 2).join("\n"), {
      orderNews: true,
      replyMarkup: { inline_keyboard: [[{ text: "✅ Qabul qildim", callback_data: `so:confirm:${order.id}` }], ...(open ? [[{ text: "Buyurtmani ochish", web_app: { url: open } }]] : [])] }
    });
    const low = own.filter((line) => line.product.stockQuantity !== null && line.product.stockQuantity - line.quantity <= LOW_STOCK);
    if (low.length) {
      await notifyShopOwner(part.shop.ownerId, `📦 <b>Qoldiq kam qoldi</b>\n${low.map((line) => `• ${escapeTelegramHtml(line.product.name)}: ${(line.product.stockQuantity as number) - line.quantity} dona`).join("\n")}\nKabinetda qoldiqni yangilang.`, { orderNews: true });
    }
  }
}
