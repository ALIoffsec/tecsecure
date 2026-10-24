import { randomBytes } from "node:crypto";
import { getCurrentUser, isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { escapeTelegramHtml, notifyTelegramUser } from "@/lib/telegram";
import { quotationSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") {
    const authorized = await requireModuleApi("PROJECTS");
    if (authorized instanceof Response) return authorized;
  }
  const quotations = await prisma.quotation.findMany({
    where: user.role === "CUSTOMER" ? { project: { customerId: user.id } } : {},
    include: { project: { select: { id: true, name: true, customerId: true } }, items: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return Response.json({ quotations });
}

export async function POST(request: Request) {
  const actor = await requireModuleApi("PROJECTS");
  if (isResponse(actor)) return actor;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = quotationSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Narx taklifi ma’lumotlari noto‘g‘ri.", details: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.items.some((item) => item.discountMinor > item.quantity * item.unitPriceMinor)) {
    return Response.json({ error: "Chegirma satr summasidan oshmasligi kerak." }, { status: 400 });
  }

  try {
    const quote = await prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({ where: { id: parsed.data.projectId }, select: { id: true, status: true } });
      if (!project) throw new Error("PROJECT_NOT_FOUND");
      const current = await tx.quotation.aggregate({ where: { projectId: project.id }, _max: { version: true } });
      const version = (current._max.version ?? 0) + 1;
      const created = await tx.quotation.create({
        data: {
          number: `Q-${new Date().getUTCFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`,
          projectId: project.id,
          version,
          status: "ISSUED",
          currency: parsed.data.currency,
          validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
          assumptions: parsed.data.assumptions || null,
          exclusions: parsed.data.exclusions || null,
          items: { create: parsed.data.items }
        },
        include: { items: true }
      });
      await tx.project.update({ where: { id: project.id }, data: { status: "QUOTED" } });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "QUOTATION_ISSUED", entity: "Quotation", entityId: created.id } });
      return created;
    });
    const totalMinor = quote.items.reduce((total, item) => total + item.quantity * item.unitPriceMinor - item.discountMinor, 0);
    const project = await prisma.project.findUnique({
      where: { id: parsed.data.projectId },
      select: { customerId: true, name: true }
    });
    if (project?.customerId) {
      await notifyTelegramUser(
        project.customerId,
        `<b>Tecsecure: sizga narx taklifi tayyor</b>\nLoyiha: ${escapeTelegramHtml(project.name)}\nTaklif: <code>${escapeTelegramHtml(quote.number)}</code>\nProfilingizdagi “Loyihalar va takliflar” bo‘limida ko‘ring.`
      );
    }
    return Response.json({ quotation: quote, totalMinor }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "PROJECT_NOT_FOUND") {
      return Response.json({ error: "Loyiha topilmadi." }, { status: 404 });
    }
    console.error("Quotation creation failed", error);
    return Response.json({ error: "Narx taklifini tuzib bo‘lmadi." }, { status: 500 });
  }
}
