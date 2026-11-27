import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, tooManyAttempts } from "@/lib/rate-limit";
import { applyOrderStatus, lockOrder } from "@/lib/order-flow";
import { SELF_CANCEL_NOTE, canCustomerCancel } from "@/lib/customer-orders";
import { escapeTelegramHtml, notifyTelegramAdmins } from "@/lib/telegram";

export const runtime = "nodejs";

const bodySchema = z.object({ reason: z.string().trim().max(300).optional() });

/** The buyer cancels an order nobody has started on yet (the order and every shop part still new). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Hisobga kiring." }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: "Sabab 300 belgidan oshmasin." }, { status: 400 });
  const limit = await rateLimit("order-cancel", user.id, 10, 60 * 60 * 1000);
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSeconds);
  const { id } = await params;
  const reason = parsed.data.reason || null;
  const outcome = await prisma.$transaction(async (tx) => {
    const order = await lockOrder(tx, id);
    if (!order || order.customerId !== user.id) return "MISSING" as const;
    const parts = await tx.shopOrder.findMany({ where: { orderId: id }, select: { status: true } });
    if (!canCustomerCancel(order, parts)) return "LATE" as const;
    const done = await applyOrderStatus(tx, order, "CANCELLED", user.id, reason ? `${SELF_CANCEL_NOTE}: ${reason}` : SELF_CANCEL_NOTE);
    return done ? order : "LATE" as const;
  });
  if (outcome === "MISSING") return Response.json({ error: "Buyurtma topilmadi." }, { status: 404 });
  if (outcome === "LATE") return Response.json({ error: "Buyurtma allaqachon ko‘rib chiqilmoqda. “Bekor qilishni so‘rash” orqali yozing.", code: "TOO_LATE" }, { status: 409 });
  await notifyTelegramAdmins(`<b>❌ Mijoz buyurtmani bekor qildi</b>\nBuyurtma <code>${escapeTelegramHtml(outcome.reference)}</code>${reason ? `\nSabab: ${escapeTelegramHtml(reason)}` : ""}`, outcome.reference);
  return Response.json({ ok: true });
}
