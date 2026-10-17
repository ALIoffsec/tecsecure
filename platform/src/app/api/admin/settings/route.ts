import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteDesigns } from "@/lib/site-designs";
import { z } from "zod";

export const runtime = "nodejs";

const allowed = ["companyName", "phone", "email", "telegram", "instagram", "address", "siteDesign"] as const;
const settingsSchema = z.object({
  companyName: z.string().trim().min(1).max(120).optional(),
  phone: z.string().trim().max(120).optional(),
  email: z.string().trim().email().max(254).or(z.literal("")).optional(),
  telegram: z.string().trim().max(80).optional(),
  instagram: z.string().trim().max(80).optional(),
  address: z.string().trim().max(300).optional(),
  siteDesign: z.enum(siteDesigns).optional()
}).strict().refine((settings) => Object.keys(settings).length > 0);

export async function GET() {
  const actor = await requireModuleApi("COMPANY");
  if (isResponse(actor)) return actor;
  const records = await prisma.siteSetting.findMany({ where: { key: { in: [...allowed] } } });
  return Response.json({ settings: Object.fromEntries(records.map((item) => [item.key, item.value])) });
}

export async function PATCH(request: Request) {
  const actor = await requireModuleApi("COMPANY");
  if (isResponse(actor)) return actor;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Sayt sozlamalari noto‘g‘ri.", details: parsed.error.flatten() }, { status: 400 });
  try {
    const settings = await prisma.$transaction(async (tx) => {
      await Promise.all(Object.entries(parsed.data).map(([key, value]) =>
        tx.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } })
      ));
      await tx.auditLog.create({
        data: { actorId: actor.id, action: "SITE_SETTINGS_UPDATED", entity: "SiteSetting" }
      });
      return tx.siteSetting.findMany({ where: { key: { in: [...allowed] } } });
    });
    return Response.json({ settings: Object.fromEntries(settings.map((item) => [item.key, item.value])) });
  } catch (error) {
    console.error("Site settings update failed", error);
    return Response.json({ error: "Sayt sozlamalarini saqlab bo‘lmadi." }, { status: 500 });
  }
}
