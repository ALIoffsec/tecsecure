import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PAYOUT_HOLD_KEY, parsePayoutHold, payoutHoldSchema } from "@/lib/marketplace";

export const runtime = "nodejs";

/** How many days delivered money waits before reaching a shop's balance; null pays out on delivery. */
export async function GET() {
  const actor = await requireAdminApi();
  if (actor instanceof Response) return actor;
  const record = await prisma.siteSetting.findUnique({ where: { key: PAYOUT_HOLD_KEY }, select: { value: true } });
  return Response.json({ hold: parsePayoutHold(record?.value) });
}

export async function PUT(request: Request) {
  const actor = await requireAdminApi();
  if (actor instanceof Response) return actor;
  const parsed = payoutHoldSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Kunlar 1–60 oralig‘ida bo‘lsin yoki bo‘sh qoldiring." }, { status: 400 });
  const value = JSON.stringify(parsed.data);
  await prisma.$transaction([
    prisma.siteSetting.upsert({ where: { key: PAYOUT_HOLD_KEY }, create: { key: PAYOUT_HOLD_KEY, value }, update: { value } }),
    prisma.auditLog.create({ data: { actorId: actor.id, action: "SHOP_PAYOUT_HOLD_UPDATED", entity: "SiteSetting" } })
  ]);
  return Response.json({ hold: parsed.data });
}
