import { noStore, requireSellingShop } from "@/lib/shop-products-server";
import { shopOrdersFor } from "@/lib/shop-orders-server";
import { loadPayoutHold } from "@/lib/marketplace-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The shop's parts of customer orders, newest first, with only its own lines. */
export async function GET() {
  const seller = await requireSellingShop();
  if (seller instanceof Response) return seller;
  const [orders, payoutHoldDays] = await Promise.all([shopOrdersFor(seller.shop.id), loadPayoutHold()]);
  return Response.json({ orders, payoutHoldDays }, { headers: noStore });
}
