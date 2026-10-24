import { Prisma } from "@prisma/client";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, name: true, slug: true, sku: true, brand: true, model: true, description: true, specifications: true, compatibility: true, priceMinor: true, currency: true, stockStatus: true, warrantyDescription: true, media: true },
    orderBy: { createdAt: "desc" }
  });
  return Response.json({ products });
}

export async function POST(request: Request) {
  const actor = await requireModuleApi("PRODUCTS");
  if (isResponse(actor)) return actor;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Mahsulot ma’lumotlari noto‘g‘ri.", details: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.categoryId && !(await prisma.productCategory.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } }))) {
    return Response.json({ error: "Tanlangan kategoriya topilmadi." }, { status: 400 });
  }
  const slug = `${parsed.data.name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${crypto.randomUUID().slice(0, 8)}`;
  try {
    const product = await prisma.$transaction(async (tx) => {
      const { categoryId, specifications, compatibility, ...productData } = parsed.data;
      const created = await tx.product.create({
        data: {
          ...productData,
          sku: productData.sku || null,
          brand: productData.brand || null,
          model: productData.model || null,
          warrantyDescription: productData.warrantyDescription || null,
          ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
          ...(specifications !== undefined ? { specifications: specifications ?? Prisma.DbNull } : {}),
          ...(compatibility !== undefined ? { compatibility: compatibility ?? Prisma.DbNull } : {}),
          slug
        }
      });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "PRODUCT_CREATED", entity: "Product", entityId: created.id } });
      return created;
    });
    return Response.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "SKU allaqachon mavjud." }, { status: 409 });
    }
    console.error("Product creation failed", error);
    return Response.json({ error: "Mahsulotni saqlab bo‘lmadi." }, { status: 500 });
  }
}
