import { randomBytes } from "node:crypto";
import { getCurrentUser, isResponse, requireModuleApi } from "@/lib/auth";
import { mergeItems, orderSchema, paymentMethodLabels, prepaidMethods } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { escapeTelegramHtml, notifyTelegramAdmins } from "@/lib/telegram";
import { pricesMatch } from "@/lib/catalog-utils";
import { formatMinor } from "@/lib/format";

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
  if (parsed.data.expectedProducts && !pricesMatch(parsed.data.expectedProducts, products)) {
    return Response.json({ error: "Narx yoki mavjudlik o‘zgargan. Savatni yangilab, qayta tekshiring.", code: "CATALOG_CHANGED" }, { status: 409 });
  }

  // Prices always come from the database, never from the client.
  const lines = merged.map((item) => {
    const product = byId.get(item.productId)!;
    return { product, quantity: item.quantity, unitPriceMinor: product.priceMinor };
  });
  const allPriced = lines.every((line) => line.unitPriceMinor !== null);
  const currencies = new Set(lines.map((line) => line.product.currency));
  const totalMinor = allPriced && currencies.size === 1
    ? lines.reduce((sum, line) => sum + (line.unitPriceMinor as number) * line.quantity, 0)
    : null;

  if (totalMinor !== null && !Number.isSafeInteger(totalMinor)) {
    return Response.json({ error: "Buyurtma summasi juda katta. Biz bilan bog‘laning." }, { status: 400 });
  }

  const { paymentMethod } = parsed.data;
  if (prepaidMethods.includes(paymentMethod) && totalMinor === null) {
    return Response.json({ error: "Narxi kelishiladigan mahsulot uchun to‘lovni qabul qilganda amalga oshiring.", code: "PREPAID_NEEDS_PRICE" }, { status: 400 });
  }
  if (paymentMethod === "WALLET" && [...currencies][0] !== "UZS") {
    return Response.json({ error: "Hamyondan faqat so‘mdagi buyurtmani to‘lash mumkin.", code: "WALLET_CURRENCY" }, { status: 400 });
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
          paymentStatus: paymentMethod === "WALLET" ? "PAID" : paymentMethod === "CARD_TRANSFER" ? "AWAITING_CONFIRMATION" : "PENDING",
          paymentReference: parsed.data.paymentReference || null,
          paymentProofMediaId: parsed.data.paymentProofMediaId ?? null,
          totalMinor,
          currency: totalMinor === null ? "UZS" : [...currencies][0],
          items: {
            create: lines.map((line) => ({
              productId: line.product.id,
              name: line.product.name,
              sku: line.product.sku,
              quantity: line.quantity,
              unitPriceMinor: line.unitPriceMinor
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
                `Yetkazish: ${parsed.data.city}${parsed.data.address ? `, ${parsed.data.address}` : ""}`,
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
      `Manzil: ${escapeTelegramHtml(`${parsed.data.city}, ${parsed.data.address}`)}`,
      `Mahsulotlar: ${escapeTelegramHtml(lines.map((line) => `${line.product.name} × ${line.quantity}`).join(", "))}`,
      totalMinor !== null ? `Jami: <b>${formatMinor(totalMinor, [...currencies][0])}</b>` : "Jami: kelishiladi",
      `To‘lov: ${escapeTelegramHtml(paymentMethodLabels[paymentMethod])}${paymentMethod === "CARD_TRANSFER" ? " — chekni admin panelda tekshiring" : ""}`,
      "",
      `Javob: <code>/reply ${escapeTelegramHtml(order.reference)} matn</code>`
    ].join("\n");
    await notifyTelegramAdmins(telegramBody, order.reference);
    return Response.json({ order }, { status: 201 });
  } catch (error) {
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
