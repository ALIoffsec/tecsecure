import { Prisma } from "@prisma/client";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const actor = await requireModuleApi("PRODUCTS");
  if (isResponse(actor)) return actor;
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) return Response.json({ error: "Mahsulot ma’lumotlari noto‘g‘ri.", details: parsed.error.flatten() }, { status: 400 });
  try {
    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          ...parsed.data,
          ...(parsed.data.sku !== undefined ? { sku: parsed.data.sku || null } : {}),
          ...(parsed.data.brand !== undefined ? { brand: parsed.data.brand || null } : {}),
          ...(parsed.data.model !== undefined ? { model: parsed.data.model || null } : {}),
          ...(parsed.data.warrantyDescription !== undefined ? { warrantyDescription: parsed.data.warrantyDescription || null } : {})
        }
      });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "PRODUCT_UPDATED", entity: "Product", entityId: id } });
      return updated;
    });
    return Response.json({ product });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return Response.json({ error: "Mahsulot topilmadi." }, { status: 404 });
    console.error("Product update failed", error);
    return Response.json({ error: "Mahsulotni yangilab bo‘lmadi." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const actor = await requireModuleApi("PRODUCTS");
  if (isResponse(actor)) return actor;
  const { id } = await context.params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data: { status: "ARCHIVED" } });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "PRODUCT_ARCHIVED", entity: "Product", entityId: id } });
    });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return Response.json({ error: "Mahsulot topilmadi." }, { status: 404 });
    console.error("Product archive failed", error);
    return Response.json({ error: "Mahsulotni arxivlab bo‘lmadi." }, { status: 500 });
  }
}
