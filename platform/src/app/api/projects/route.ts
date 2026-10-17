import { getCurrentUser, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") {
    const authorized = await requireModuleApi("PROJECTS");
    if (authorized instanceof Response) return authorized;
  }
  const where = user.role === "CUSTOMER" ? { customerId: user.id } : {};
  const projects = await prisma.project.findMany({
    where,
    include: {
      items: { include: { product: { select: { name: true, priceMinor: true } }, service: { select: { name: true, startingPriceMinor: true } } } },
      quotations: { include: { items: true }, orderBy: { version: "desc" } }
    },
    orderBy: { updatedAt: "desc" }
  });
  return Response.json({ projects });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Loyiha yaratish uchun kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") return Response.json({ error: "Xodimlar mijoz nomidan loyiha yubora olmaydi." }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Loyiha ma’lumotlari noto‘g‘ri.", details: parsed.error.flatten() }, { status: 400 });

  try {
    const project = await prisma.$transaction(async (tx) => {
      for (const item of parsed.data.items) {
        if (item.productId) {
          const product = await tx.product.findFirst({ where: { id: item.productId, status: "PUBLISHED" }, select: { id: true } });
          if (!product) throw new Error("PUBLISHED_PRODUCT_NOT_FOUND");
        } else if (item.serviceId) {
          const service = await tx.service.findFirst({ where: { id: item.serviceId, status: "PUBLISHED", availability: true }, select: { id: true } });
          if (!service) throw new Error("PUBLISHED_SERVICE_NOT_FOUND");
        }
      }
      const created = await tx.project.create({
        data: {
          name: parsed.data.name,
          city: parsed.data.city || null,
          notes: parsed.data.notes || null,
          customerId: user.id,
          status: "QUOTE_REQUESTED",
          items: { create: parsed.data.items }
        },
        include: { items: { include: { product: true, service: true } } }
      });
      await tx.auditLog.create({ data: { actorId: user.id, action: "PROJECT_SUBMITTED", entity: "Project", entityId: created.id } });
      return created;
    });
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("PUBLISHED_")) {
      return Response.json({ error: "Tanlangan mahsulot yoki xizmat nashrda emas." }, { status: 400 });
    }
    console.error("Project submission failed", error);
    return Response.json({ error: "Loyihani saqlab bo‘lmadi." }, { status: 500 });
  }
}
