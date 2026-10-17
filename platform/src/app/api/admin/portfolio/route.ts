import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const postSchema = z.object({
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().min(5).max(10000),
  media: z.array(z.string().cuid()).max(20).default([]),
  published: z.boolean().default(false)
});

function createSlug(title: string) {
  return `${title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${randomUUID().slice(0, 8)}`;
}

export async function GET() {
  const actor = await requireModuleApi("PORTFOLIO");
  if (isResponse(actor)) return actor;
  const posts = await prisma.portfolioPost.findMany({ orderBy: { updatedAt: "desc" } });
  return Response.json({ posts });
}

export async function POST(request: Request) {
  const actor = await requireModuleApi("PORTFOLIO");
  if (isResponse(actor)) return actor;
  let input: unknown;
  try { input = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Loyiha lavhasi ma’lumotlari noto‘g‘ri.", details: parsed.error.flatten() }, { status: 400 });
  const post = await prisma.$transaction(async (tx) => {
    const created = await tx.portfolioPost.create({
      data: { ...parsed.data, slug: createSlug(parsed.data.title) }
    });
    await tx.auditLog.create({ data: { actorId: actor.id, action: "PORTFOLIO_POST_CREATED", entity: "PortfolioPost", entityId: created.id } });
    return created;
  });
  return Response.json({ post }, { status: 201 });
}
