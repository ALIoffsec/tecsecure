import { randomBytes } from "node:crypto";
import { getCurrentUser, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { requestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await checkRateLimit("service-request", ip, 6, 60 * 60 * 1000))) {
    return Response.json({ error: "Ariza yuborish limiti oshdi. Keyinroq urinib ko‘ring." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Ariza ma’lumotlarini tekshiring.", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const user = await getCurrentUser();
    if (user && user.role !== "CUSTOMER") {
      return Response.json({ error: "Xodim yoki administrator hisobi bilan mijoz arizasi yuborib bo‘lmaydi." }, { status: 403 });
    }
    if (parsed.data.serviceId) {
      const service = await prisma.service.findFirst({
        where: { id: parsed.data.serviceId, status: "PUBLISHED", availability: true },
        select: { id: true }
      });
      if (!service) return Response.json({ error: "Tanlangan xizmat mavjud emas." }, { status: 400 });
    }
    const reference = `TS-${new Date().getUTCFullYear()}-${randomBytes(8).toString("hex").toUpperCase()}`;
    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.serviceRequest.create({
        data: {
          reference,
          customerId: user?.id,
          name: parsed.data.name,
          phone: parsed.data.phone,
          email: parsed.data.email || null,
          organizationName: parsed.data.organizationName || null,
          city: parsed.data.city || null,
          location: parsed.data.location || null,
          serviceId: parsed.data.serviceId || null,
          description: parsed.data.description,
          budgetRange: parsed.data.budgetRange || null,
          preferredContactTime: parsed.data.preferredContactTime || null,
          history: { create: { toStatus: "NEW", actorId: user?.id ?? null } }
        },
        select: { id: true, reference: true, status: true, createdAt: true }
      });
      const admins = await tx.user.findMany({
        where: { role: { in: ["FOUNDER", "ADMIN", "STAFF"] }, active: true },
        select: { id: true }
      });
      if (admins.length > 0) {
        await tx.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            channel: "IN_APP",
            event: "SERVICE_REQUEST_RECEIVED",
            status: "DELIVERED",
            payload: { reference: created.reference, requestId: created.id }
          }))
        });
      }
      return created;
    });
    return Response.json({ request: record }, { status: 201 });
  } catch (error) {
    console.error("Service request submission failed", error);
    return Response.json({ error: "Arizani saqlab bo‘lmadi. Iltimos, qayta urinib ko‘ring." }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") {
    const authorized = await requireModuleApi("REQUESTS");
    if (authorized instanceof Response) return authorized;
  }
  if (user.role === "CUSTOMER") {
    const requests = await prisma.serviceRequest.findMany({
      where: { customerId: user.id },
      include: { service: { select: { name: true } }, history: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" }
    });
    return Response.json({ requests });
  }
  const requests = await prisma.serviceRequest.findMany({
    include: { service: { select: { name: true } }, history: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return Response.json({ requests });
}
