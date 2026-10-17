import { Prisma } from "@prisma/client";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  title: z.string().trim().min(2).max(180).optional(),
  description: z.string().trim().min(5).max(10000).optional(),
  media: z.array(z.string().cuid()).max(20).optional(),
  published: z.boolean().optional()
}).refine((data) => Object.keys(data).length > 0);

export async function PATCH(request: Request, context: Context) {
  const actor = await requireModuleApi("PORTFOLIO");
  if (isResponse(actor)) return actor;
  let input: unknown;
  try { input = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Loyiha lavhasi ma’lumotlari noto‘g‘ri." }, { status: 400 });
  const { id } = await context.params;
  try {
    const post = await prisma.$transaction(async (tx) => {
      const updated = await tx.portfolioPost.update({ where: { id }, data: parsed.data });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "PORTFOLIO_POST_UPDATED", entity: "PortfolioPost", entityId: id } });
      return updated;
    });
    return Response.json({ post });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return Response.json({ error: "Loyiha lavhasi topilmadi." }, { status: 404 });
    }
    console.error("Portfolio post update failed", error);
    return Response.json({ error: "Loyiha lavhasini yangilab bo‘lmadi." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const actor = await requireModuleApi("PORTFOLIO");
  if (isResponse(actor)) return actor;
  const { id } = await context.params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.portfolioPost.delete({ where: { id } });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "PORTFOLIO_POST_DELETED", entity: "PortfolioPost", entityId: id } });
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return Response.json({ error: "Loyiha lavhasi topilmadi." }, { status: 404 });
    }
    console.error("Portfolio post deletion failed", error);
    return Response.json({ error: "Loyiha lavhasini o‘chirib bo‘lmadi." }, { status: 500 });
  }
}
