import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { noStore, requireSellingShop } from "@/lib/shop-products-server";

export const runtime = "nodejs";

/** Shop preferences: whether order and stock news come to Telegram. */
export async function PATCH(request: Request) {
  const seller = await requireSellingShop();
  if (seller instanceof Response) return seller;
  const parsed = z.object({ notifyOrders: z.boolean() }).strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Sozlama noto‘g‘ri." }, { status: 400 });
  await prisma.shop.update({ where: { id: seller.shop.id }, data: parsed.data });
  return Response.json({ ok: true, ...parsed.data }, { headers: noStore });
}
