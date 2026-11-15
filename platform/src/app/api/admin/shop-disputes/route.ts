import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** Buyers' complaints about shop parcels: open ones first to decide, then the latest decided. */
export async function GET(request: Request) {
  const actor = await requireAdminApi();
  if (actor instanceof Response) return actor;
  const open = new URL(request.url).searchParams.get("state") !== "closed";
  const [disputes, openCount] = await Promise.all([
    prisma.shopOrder.findMany({
      where: open ? { disputedAt: { not: null }, disputeResolvedAt: null } : { disputeResolvedAt: { not: null } },
      orderBy: open ? { disputedAt: "asc" } : { disputeResolvedAt: "desc" },
      take: 100,
      select: {
        id: true, status: true, disputedAt: true, disputeNote: true, disputeResolution: true, disputeResolvedAt: true, sellerNote: true,
        itemsTotalMinor: true, deliveryShareMinor: true, payoutMinor: true, shippedAt: true, deliveredAt: true,
        shop: { select: { name: true, slug: true, phone: true, status: true } },
        order: { select: { id: true, reference: true, recipientName: true, phone: true, paymentMethod: true, paymentStatus: true, items: { select: { name: true, quantity: true, shopId: true } } } }
      }
    }),
    prisma.shopOrder.count({ where: { disputedAt: { not: null }, disputeResolvedAt: null } })
  ]);
  return Response.json({ disputes, open: openCount }, { headers: { "Cache-Control": "private, no-store" } });
}
