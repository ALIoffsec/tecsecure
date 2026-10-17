import { Prisma } from "@prisma/client";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { newsSchema } from "@/lib/validation";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const actor = await requireModuleApi("NEWS");
  if (isResponse(actor)) return actor;
  const { id } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = newsSchema.partial().safeParse(body);
  if (!parsed.success) return Response.json({ error: "Yangilik ma’lumotlari noto‘g‘ri.", details: parsed.error.flatten() }, { status: 400 });
  try {
    const article = await prisma.$transaction(async (tx) => {
      const data = {
        ...parsed.data,
        ...(parsed.data.status === "PUBLISHED" ? { publishedAt: new Date() } : {})
      };
      const updated = await tx.newsArticle.update({ where: { id }, data });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "NEWS_UPDATED", entity: "NewsArticle", entityId: id } });
      return updated;
    });
    return Response.json({ article });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return Response.json({ error: "Yangilik topilmadi." }, { status: 404 });
    console.error("News article update failed", error);
    return Response.json({ error: "Yangilikni yangilab bo‘lmadi." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const actor = await requireModuleApi("NEWS");
  if (isResponse(actor)) return actor;
  const { id } = await context.params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.newsArticle.update({ where: { id }, data: { status: "ARCHIVED" } });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "NEWS_ARCHIVED", entity: "NewsArticle", entityId: id } });
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return Response.json({ error: "Yangilik topilmadi." }, { status: 404 });
    console.error("News article archive failed", error);
    return Response.json({ error: "Yangilikni arxivlab bo‘lmadi." }, { status: 500 });
  }
}
