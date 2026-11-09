import { z } from "zod";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { deliveryTariffsSchema } from "@/lib/delivery";
import { getCheckoutSettings, TARIFFS_KEY, VAT_KEY } from "@/lib/delivery-server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  tariffs: deliveryTariffsSchema.optional(),
  vat: z.enum(["NONE", "INCLUDED"]).optional()
}).strict().refine(update => update.tariffs !== undefined || update.vat !== undefined);

export async function GET() {
  const actor = await requireModuleApi("COMPANY");
  if (isResponse(actor)) return actor;
  return Response.json(await getCheckoutSettings(), { headers: { "Cache-Control": "private, no-store" } });
}

/** Delivery prices and VAT change what every customer pays, so each save is written to the audit log. */
export async function PATCH(request: Request) {
  const actor = await requireModuleApi("COMPANY");
  if (isResponse(actor)) return actor;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Yetkazish sozlamalari noto‘g‘ri.", details: parsed.error.flatten() }, { status: 400 });
  const writes: { key: string; value: string }[] = [];
  if (parsed.data.tariffs) writes.push({ key: TARIFFS_KEY, value: JSON.stringify(parsed.data.tariffs) });
  if (parsed.data.vat) writes.push({ key: VAT_KEY, value: parsed.data.vat });
  await prisma.$transaction([
    ...writes.map(({ key, value }) => prisma.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } })),
    prisma.auditLog.create({ data: { actorId: actor.id, action: "DELIVERY_SETTINGS_UPDATED", entity: "SiteSetting", metadata: { keys: writes.map(write => write.key) } } })
  ]);
  return Response.json(await getCheckoutSettings());
}
