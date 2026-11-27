import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { escapeTelegramHtml, notifyTelegramUser } from "@/lib/telegram";

export const runtime = "nodejs";

/**
 * Staff open a project from a service request so its quote and invoice join the request's line. One project
 * per request (unique column). The customer comes from the request; a guest request is never matched to an
 * account by name or phone, so it cannot get a project until the guest has an account on the request.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const requests = await requireModuleApi("REQUESTS");
  if (isResponse(requests)) return requests;
  const projects = await requireModuleApi("PROJECTS");
  if (isResponse(projects)) return projects;
  const { id } = await params;
  const record = await prisma.serviceRequest.findUnique({ where: { id }, select: { id: true, reference: true, customerId: true, city: true, description: true, status: true, service: { select: { name: true } }, project: { select: { id: true } } } });
  if (!record) return Response.json({ error: "Ariza topilmadi." }, { status: 404 });
  if (record.project) return Response.json({ error: "Bu arizada loyiha allaqachon bor.", code: "EXISTS" }, { status: 409 });
  if (!record.customerId) return Response.json({ error: "Ariza mehmondan: avval mijoz hisobini arizaga bog‘lash kerak.", code: "GUEST" }, { status: 409 });
  if (["REJECTED", "CANCELLED", "COMPLETED"].includes(record.status)) return Response.json({ error: "Yopilgan arizadan loyiha ochib bo‘lmaydi.", code: "CLOSED" }, { status: 409 });
  try {
    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          reference: `PRJ-${new Date().getUTCFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`,
          name: record.service?.name ?? `Ariza ${record.reference}`,
          customerId: record.customerId,
          requestId: record.id,
          status: "QUOTE_REQUESTED",
          city: record.city,
          notes: record.description.slice(0, 5000)
        },
        select: { id: true, reference: true, name: true }
      });
      await tx.auditLog.create({ data: { actorId: projects.id, action: "PROJECT_OPENED_FROM_REQUEST", entity: "Project", entityId: created.id, metadata: { requestId: record.id } } });
      return created;
    });
    if (record.customerId) await notifyTelegramUser(record.customerId, `<b>Tecsecure: arizangiz bo‘yicha narx tayyorlanmoqda</b>\nAriza: <code>${escapeTelegramHtml(record.reference)}</code>`);
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    // Two staff at once: the unique request column lets only the first through.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return Response.json({ error: "Bu arizada loyiha allaqachon bor.", code: "EXISTS" }, { status: 409 });
    console.error("Project from request failed", error);
    return Response.json({ error: "Loyihani ochib bo‘lmadi." }, { status: 500 });
  }
}
