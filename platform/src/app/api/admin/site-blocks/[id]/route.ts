import { Prisma } from "@prisma/client";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  page: z.enum(["all", "home", "about", "services", "products", "learning", "news", "work"]).optional(),
  title: z.string().trim().min(2).max(180).optional(),
  body: z.string().trim().max(10000).optional(),
  media: z.array(z.string().cuid()).max(20).optional(),
  enabled: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(10000).optional(),
  columns: z.number().int().min(1).max(4).optional(),
  animation: z.enum(["none", "fade", "slide", "zoom"]).optional(),
  animationDurationMs: z.number().int().min(100).max(10000).optional()
}).refine((value) => Object.keys(value).length > 0);

export async function PATCH(request: Request, context: Context) {
  const actor = await requireModuleApi("CONTENT");
  if (isResponse(actor)) return actor;
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Sayt bloki ma’lumotlarini tekshiring.", details: parsed.error.flatten() }, { status: 400 });
  const { id } = await context.params;
  try {
    const block = await prisma.$transaction(async (tx) => {
      const updated = await tx.siteBlock.update({ where: { id }, data: parsed.data });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "SITE_BLOCK_UPDATED", entity: "SiteBlock", entityId: id } });
      return updated;
    });
    return Response.json({ block });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return Response.json({ error: "Sayt bloki topilmadi." }, { status: 404 });
    }
    console.error("Site block update failed", error);
    return Response.json({ error: "Sayt blokini yangilab bo‘lmadi." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const actor = await requireModuleApi("CONTENT");
  if (isResponse(actor)) return actor;
  const { id } = await context.params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.siteBlock.delete({ where: { id } });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "SITE_BLOCK_DELETED", entity: "SiteBlock", entityId: id } });
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return Response.json({ error: "Sayt bloki topilmadi." }, { status: 404 });
    }
    console.error("Site block deletion failed", error);
    return Response.json({ error: "Sayt blokini o‘chirib bo‘lmadi." }, { status: 500 });
  }
}
