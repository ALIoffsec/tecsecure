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
  if (parsed.data.categoryId && !(await prisma.productCategory.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } }))) {
    return Response.json({ error: "Tanlangan kategoriya topilmadi." }, { status: 400 });
  }
  try {
    const product = await prisma.$transaction(async (tx) => {
      const { categoryId, specifications, compatibility, ...productData } = parsed.data;
      const updated = await tx.product.update({
        where: { id },
        data: {
          ...productData,
          ...(productData.sku !== undefined ? { sku: productData.sku || null } : {}),
          ...(productData.brand !== undefined ? { brand: productData.brand || null } : {}),
          ...(productData.model !== undefined ? { model: productData.model || null } : {}),
          ...(productData.warrantyDescription !== undefined ? { warrantyDescription: productData.warrantyDescription || null } : {}),
          ...(categoryId !== undefined ? { category: categoryId ? { connect: { id: categoryId } } : { disconnect: true } } : {}),
          ...(specifications !== undefined ? { specifications: specifications ?? Prisma.DbNull } : {}),
          ...(compatibility !== undefined ? { compatibility: compatibility ?? Prisma.DbNull } : {})
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
