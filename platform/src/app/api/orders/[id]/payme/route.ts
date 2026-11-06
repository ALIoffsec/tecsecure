import { getCurrentUser } from "@/lib/auth";
import { paymeCheckoutUrl, paymeConfigured } from "@/lib/payme";
import { prisma } from "@/lib/prisma";
import { siteOrigin } from "@/lib/site-origin";

export const runtime = "nodejs";

/** Sends the order's owner to Payme. Built here so the amount always comes from the stored order. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const origin = siteOrigin();
  const user = await getCurrentUser();
  if (!user) return Response.redirect(`${origin}/login`, 303);
  const { id } = await context.params;
  const order = await prisma.order.findUnique({ where: { id }, select: { customerId: true, reference: true, status: true, paymentMethod: true, paymentStatus: true, totalMinor: true } });
  if (!order || order.customerId !== user.id) return Response.json({ error: "Buyurtma topilmadi." }, { status: 404 });
  const payable = order.paymentMethod === "ONLINE_PAYME" && order.paymentStatus === "AWAITING_PAYMENT" && order.status !== "CANCELLED" && order.totalMinor !== null;
  if (!payable || !paymeConfigured()) return Response.redirect(`${origin}/portal/orders`, 303);
  return Response.redirect(paymeCheckoutUrl({
    merchantId: process.env.PAYME_MERCHANT_ID as string,
    reference: order.reference,
    amountMinor: order.totalMinor as number,
    locale: new URL(request.url).searchParams.get("l") ?? "uz",
    returnUrl: `${origin}/portal/orders`
  }), 303);
}
