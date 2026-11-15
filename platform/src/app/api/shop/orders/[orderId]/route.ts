import { z } from "zod";
import { orderStatuses } from "@/lib/orders";
import { checkRateLimit } from "@/lib/rate-limit";
import { moveShopPart } from "@/lib/shop-orders-server";
import { noStore, requireSellingShop } from "@/lib/shop-products-server";

export const runtime = "nodejs";

const schema = z.object({ status: z.enum(orderStatuses), note: z.string().trim().max(500).optional() }).strict();

/** The shop accepts, prepares, ships, delivers or cancels its part of an order. */
export async function PATCH(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const seller = await requireSellingShop();
  if (seller instanceof Response) return seller;
  if (!(await checkRateLimit("shop-order-move", seller.shop.id, 300, 60 * 60 * 1000))) return Response.json({ error: "Juda ko‘p so‘rov. Birozdan keyin urinib ko‘ring." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Holat noto‘g‘ri." }, { status: 400 });
  const result = await moveShopPart(seller.shop.id, (await params).orderId, parsed.data.status, parsed.data.note || null, seller.user.id);
  if (!result.ok) return Response.json({ error: result.error, code: result.code }, { status: result.status });
  return Response.json({ ok: true, status: result.status }, { headers: noStore });
}
