import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PROMOTION_KEY, parsePromotion, promotionSettingsSchema } from "@/lib/marketplace";

export const runtime = "nodejs";

/** The price per day of a paid placement; with no price, shops cannot buy one. */
export async function GET() {
  const actor = await requireAdminApi();
  if (actor instanceof Response) return actor;
  const record = await prisma.siteSetting.findUnique({ where: { key: PROMOTION_KEY }, select: { value: true } });
  return Response.json({ promotion: parsePromotion(record?.value) });
}

export async function PUT(request: Request) {
  const actor = await requireAdminApi();
  if (actor instanceof Response) return actor;
  const parsed = promotionSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Narx musbat butun son, kunlar 1–90 bo‘lsin." }, { status: 400 });
  const value = JSON.stringify(parsed.data);
  await prisma.$transaction([
    prisma.siteSetting.upsert({ where: { key: PROMOTION_KEY }, create: { key: PROMOTION_KEY, value }, update: { value } }),
    prisma.auditLog.create({ data: { actorId: actor.id, action: "SHOP_PROMOTION_SETTINGS_UPDATED", entity: "SiteSetting" } })
  ]);
  return Response.json({ promotion: parsed.data });
}
