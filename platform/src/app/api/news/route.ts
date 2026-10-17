import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { newsSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const articles = await prisma.newsArticle.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" }
  });
  return Response.json({ articles });
}

export async function POST(request: Request) {
  const actor = await requireModuleApi("NEWS");
  if (isResponse(actor)) return actor;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = newsSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Yangilik ma’lumotlari noto‘g‘ri.", details: parsed.error.flatten() }, { status: 400 });
  const slug = `${parsed.data.title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${crypto.randomUUID().slice(0, 8)}`;
  try {
    const article = await prisma.$transaction(async (tx) => {
      const created = await tx.newsArticle.create({
        data: {
          ...parsed.data,
          slug,
          publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null
        }
      });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "NEWS_CREATED", entity: "NewsArticle", entityId: created.id } });
      return created;
    });
    return Response.json({ article }, { status: 201 });
  } catch (error) {
    console.error("News article creation failed", error);
    return Response.json({ error: "Yangilikni saqlab bo‘lmadi." }, { status: 500 });
  }
}
