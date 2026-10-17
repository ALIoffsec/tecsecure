import { Prisma } from "@prisma/client";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serviceSchema } from "@/lib/validation";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const actor = await requireModuleApi("SERVICES");
  if (isResponse(actor)) return actor;
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = serviceSchema.partial().safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Xizmat ma’lumotlari noto‘g‘ri.", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const service = await prisma.$transaction(async (tx) => {
      const updated = await tx.service.update({ where: { id }, data: parsed.data });
      await tx.auditLog.create({
        data: { actorId: actor.id, action: "SERVICE_UPDATED", entity: "Service", entityId: id }
      });
      return updated;
    });
    return Response.json({ service });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return Response.json({ error: "Xizmat topilmadi." }, { status: 404 });
    }
    console.error("Service update failed", error);
    return Response.json({ error: "Xizmatni yangilab bo‘lmadi." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const actor = await requireModuleApi("SERVICES");
  if (isResponse(actor)) return actor;
  const { id } = await context.params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.service.update({ where: { id }, data: { status: "ARCHIVED", availability: false } });
      await tx.auditLog.create({
        data: { actorId: actor.id, action: "SERVICE_ARCHIVED", entity: "Service", entityId: id }
      });
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return Response.json({ error: "Xizmat topilmadi." }, { status: 404 });
    }
    console.error("Service archive failed", error);
    return Response.json({ error: "Xizmatni arxivlab bo‘lmadi." }, { status: 500 });
  }
}
