import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const blockSchema = z.object({
  page: z.enum(["all", "home", "about", "services", "products", "learning", "news", "work"]),
  title: z.string().trim().min(2).max(180),
  body: z.string().trim().max(10000),
  media: z.array(z.string().cuid()).max(20).default([]),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(10000).default(0),
  columns: z.number().int().min(1).max(4).default(3),
  animation: z.enum(["none", "fade", "slide", "zoom"]).default("none"),
  animationDurationMs: z.number().int().min(100).max(10000).default(600)
});

export async function GET() {
  const actor = await requireModuleApi("CONTENT");
  if (isResponse(actor)) return actor;
  const blocks = await prisma.siteBlock.findMany({ orderBy: [{ page: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }] });
  return Response.json({ blocks });
}

export async function POST(request: Request) {
  const actor = await requireModuleApi("CONTENT");
  if (isResponse(actor)) return actor;
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = blockSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Sayt bloki ma’lumotlarini tekshiring.", details: parsed.error.flatten() }, { status: 400 });

  const block = await prisma.$transaction(async (tx) => {
    const created = await tx.siteBlock.create({ data: parsed.data });
    await tx.auditLog.create({
      data: { actorId: actor.id, action: "SITE_BLOCK_CREATED", entity: "SiteBlock", entityId: created.id }
    });
    return created;
  });
  return Response.json({ block }, { status: 201 });
}
