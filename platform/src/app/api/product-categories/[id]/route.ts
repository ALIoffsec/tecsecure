import { Prisma } from "@prisma/client";
import { z } from "zod";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

const schema = z.object({ name: z.string().trim().min(2).max(80) });

// The slug stays stable on rename so existing catalog links keep working.
export async function PATCH(request: Request, context: Context) {
  const actor = await requireModuleApi("PRODUCTS");
  if (isResponse(actor)) return actor;
  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Kategoriya nomini kiriting (2–80 belgi)." }, { status: 400 });
  try {
    const category = await prisma.$transaction(async (tx) => {
      const updated = await tx.productCategory.update({ where: { id }, data: { name: parsed.data.name } });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "PRODUCT_CATEGORY_UPDATED", entity: "ProductCategory", entityId: id } });
      return updated;
    });
    return Response.json({ category });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return Response.json({ error: "Bu nomdagi kategoriya mavjud." }, { status: 409 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return Response.json({ error: "Kategoriya topilmadi." }, { status: 404 });
    console.error("Product category update failed", error);
    return Response.json({ error: "Kategoriyani saqlab bo‘lmadi." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const actor = await requireModuleApi("PRODUCTS");
  if (isResponse(actor)) return actor;
  const { id } = await context.params;
  try {
    const inUse = await prisma.product.count({ where: { categoryId: id } });
    if (inUse > 0) return Response.json({ error: `Bu kategoriyada ${inUse} ta mahsulot bor. Avval ularni boshqa kategoriyaga o‘tkazing.` }, { status: 409 });
    await prisma.$transaction(async (tx) => {
      await tx.productCategory.delete({ where: { id } });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "PRODUCT_CATEGORY_DELETED", entity: "ProductCategory", entityId: id } });
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return Response.json({ error: "Kategoriya topilmadi." }, { status: 404 });
    console.error("Product category delete failed", error);
    return Response.json({ error: "Kategoriyani o‘chirib bo‘lmadi." }, { status: 500 });
  }
}
