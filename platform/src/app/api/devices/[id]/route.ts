import { isResponse, requireAdminApi } from "@/lib/auth";
import { parseMonitoringTarget, isPublicAddress } from "@/lib/monitoring";
import { prisma } from "@/lib/prisma";
import { isIP } from "node:net";
import { z } from "zod";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
const schema = z.object({
  monitored: z.boolean(),
  monitoringMethod: z.string().trim().max(20).optional()
});

export async function PATCH(request: Request, context: Context) {
  const actor = await requireAdminApi();
  if (isResponse(actor)) return actor;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Monitoring sozlamasi noto‘g‘ri." }, { status: 400 });
  const { id } = await context.params;
  const device = await prisma.device.findUnique({ where: { id }, select: { id: true, hostname: true, monitoringMethod: true } });
  if (!device) return Response.json({ error: "Qurilma topilmadi." }, { status: 404 });

  const method = parsed.data.monitoringMethod ?? device.monitoringMethod;
  if (parsed.data.monitored) {
    const target = parseMonitoringTarget(method, device.hostname);
    if (!target) return Response.json({ error: "Monitoring uchun hostname va 'tcp:PORT' usuli kerak." }, { status: 400 });
    if (isIP(target.host) && !isPublicAddress(target.host)) {
      return Response.json({ error: "Faqat ommaviy manzillar tekshiriladi." }, { status: 400 });
    }
  }
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.device.update({
      where: { id },
      data: {
        monitored: parsed.data.monitored,
        monitoringMethod: method,
        ...(parsed.data.monitored ? {} : { status: "UNKNOWN" as const })
      },
      select: { id: true, monitored: true, monitoringMethod: true, status: true }
    });
    await tx.auditLog.create({
      data: { actorId: actor.id, action: parsed.data.monitored ? "DEVICE_MONITORING_ENABLED" : "DEVICE_MONITORING_DISABLED", entity: "Device", entityId: id }
    });
    return result;
  });
  return Response.json({ device: updated });
}
