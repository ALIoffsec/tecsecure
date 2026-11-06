import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({ name: z.string().trim().min(2).max(80) });

export async function POST(request: Request) {
  const actor = await requireModuleApi("PRODUCTS");
  if (isResponse(actor)) return actor;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Kategoriya nomini kiriting (2–80 belgi)." }, { status: 400 });
  const base = parsed.data.name.toLowerCase().normalize("NFKD").replace(/[̀-ͯ‘’ʻʼ']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  try {
    const category = await prisma.$transaction(async (tx) => {
      const slug = base && !(await tx.productCategory.findUnique({ where: { slug: base }, select: { id: true } })) ? base : `${base || "kategoriya"}-${randomUUID().slice(0, 6)}`;
      const created = await tx.productCategory.create({ data: { name: parsed.data.name, slug } });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "PRODUCT_CATEGORY_CREATED", entity: "ProductCategory", entityId: created.id } });
      return created;
    });
    return Response.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return Response.json({ error: "Bu nomdagi kategoriya mavjud." }, { status: 409 });
    console.error("Product category creation failed", error);
    return Response.json({ error: "Kategoriyani saqlab bo‘lmadi." }, { status: 500 });
  }
}
