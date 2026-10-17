import { Prisma } from "@prisma/client";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serviceSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const services = await prisma.service.findMany({
    where: { status: "PUBLISHED", availability: true },
    orderBy: { createdAt: "desc" }
  });
  return Response.json({ services });
}

export async function POST(request: Request) {
  const actor = await requireModuleApi("SERVICES");
  if (isResponse(actor)) return actor;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Xizmat ma’lumotlari noto‘g‘ri.", details: parsed.error.flatten() }, { status: 400 });
  }
  const slug = `${parsed.data.name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${crypto.randomUUID().slice(0, 8)}`;

  try {
    const service = await prisma.$transaction(async (tx) => {
      const created = await tx.service.create({ data: { ...parsed.data, slug } });
      await tx.auditLog.create({
        data: { actorId: actor.id, action: "SERVICE_CREATED", entity: "Service", entityId: created.id }
      });
      return created;
    });
    return Response.json({ service }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Service creation database error", error);
    } else {
      console.error("Service creation failed", error);
    }
    return Response.json({ error: "Xizmatni saqlab bo‘lmadi." }, { status: 500 });
  }
}
