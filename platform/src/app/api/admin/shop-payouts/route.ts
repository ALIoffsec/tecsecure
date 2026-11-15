import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Payout requests for staff: open ones first by default. */
export async function GET(request: Request) {
  const actor = await requireAdminApi();
  if (actor instanceof Response) return actor;
  const state = new URL(request.url).searchParams.get("status");
  const status = state === "PAID" || state === "REJECTED" ? state : "REQUESTED";
  const payouts = await prisma.shopPayout.findMany({
    where: { status },
    orderBy: { createdAt: status === "REQUESTED" ? "asc" : "desc" },
    take: 100,
    include: { shop: { select: { id: true, name: true, legalName: true, tin: true, balanceMinor: true } } }
  });
  const open = await prisma.shopPayout.count({ where: { status: "REQUESTED" } });
  return Response.json({ payouts, open }, { headers: { "Cache-Control": "private, no-store" } });
}
