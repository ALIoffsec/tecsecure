import { isResponse, requireModuleApi } from "@/lib/auth";
import { PARTNER_BRANDS_KEY, parsePartnerBrands, partnerBrandsSchema } from "@/lib/partner-brands";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** The two rows of brand logos on the home page. */
export async function GET() {
  const actor = await requireModuleApi("CONTENT");
  if (isResponse(actor)) return actor;
  const record = await prisma.siteSetting.findUnique({ where: { key: PARTNER_BRANDS_KEY }, select: { value: true } });
  return Response.json({ brands: parsePartnerBrands(record?.value) });
}

export async function PUT(request: Request) {
  const actor = await requireModuleApi("CONTENT");
  if (isResponse(actor)) return actor;
  const parsed = partnerBrandsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Brendlar ro‘yxati noto‘g‘ri: har brendga nom va logo kerak, qatorda 30 tadan ko‘p bo‘lmasin." }, { status: 400 });
  // An uploaded logo must be a public image that exists; a wrong id would show a broken picture.
  const ids = [...new Set(parsed.data.rows.flat().map(item => item.logo).filter(logo => !logo.startsWith("/brands/")))];
  if (ids.length) {
    const found = await prisma.mediaAsset.count({ where: { id: { in: ids }, mimeType: { startsWith: "image/" }, private: false } });
    if (found !== ids.length) return Response.json({ error: "Yuklangan logolardan biri topilmadi. Rasmni qayta yuklang." }, { status: 400 });
  }
  const value = JSON.stringify(parsed.data);
  await prisma.$transaction([
    prisma.siteSetting.upsert({ where: { key: PARTNER_BRANDS_KEY }, create: { key: PARTNER_BRANDS_KEY, value }, update: { value } }),
    prisma.auditLog.create({ data: { actorId: actor.id, action: "PARTNER_BRANDS_UPDATED", entity: "SiteSetting" } })
  ]);
  return Response.json({ brands: parsed.data });
}
