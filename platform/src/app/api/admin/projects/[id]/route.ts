import { z } from "zod";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { escapeTelegramHtml, notifyTelegramUser } from "@/lib/telegram";
import { PROJECT_MOVES } from "@/lib/quote-rules";

export const runtime = "nodejs";

const bodySchema = z.object({ status: z.enum(["IN_PROGRESS", "COMPLETED", "CANCELLED"]), note: z.string().trim().max(1000).optional() });

/** Staff mark the work started or finished (or drop a project before work). Only from the step before. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireModuleApi("PROJECTS");
  if (isResponse(actor)) return actor;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Holat noto‘g‘ri." }, { status: 400 });
  const { id } = await params;
  const result = await prisma.$transaction(async (tx) => {
    const project = await tx.project.findUnique({ where: { id }, select: { id: true, name: true, status: true, customerId: true } });
    if (!project) return null;
    if (parsed.data.status === "CANCELLED") {
      // Money first: a project with an invoice is not dropped until the invoice is voided.
      const invoices = await tx.invoice.count({ where: { quotation: { projectId: id }, status: { not: "VOID" } } });
      if (invoices > 0) return "INVOICE" as const;
    }
    const claim = await tx.project.updateMany({ where: { id, status: { in: [...PROJECT_MOVES[parsed.data.status]] as never[] } }, data: { status: parsed.data.status } });
    if (claim.count === 0) return "STATE" as const;
    if (parsed.data.status === "CANCELLED") await tx.quotation.updateMany({ where: { projectId: id, status: { in: ["DRAFT", "ISSUED"] } }, data: { status: "CANCELLED" } });
    await tx.auditLog.create({ data: { actorId: actor.id, action: "PROJECT_STATUS_CHANGED", entity: "Project", entityId: id, metadata: { from: project.status, to: parsed.data.status, note: parsed.data.note ?? null } } });
    return project;
  });
  if (!result) return Response.json({ error: "Loyiha topilmadi." }, { status: 404 });
  if (result === "INVOICE") return Response.json({ error: "Loyihada hisob bor: avval hisobni bekor qiling." }, { status: 409 });
  if (result === "STATE") return Response.json({ error: "Loyiha holati allaqachon o‘zgargan yoki bu qadamga o‘tib bo‘lmaydi." }, { status: 409 });
  if (result.customerId && parsed.data.status !== "CANCELLED") {
    await notifyTelegramUser(result.customerId, `<b>Tecsecure: ${parsed.data.status === "IN_PROGRESS" ? "ish boshlandi" : "ish yakunlandi"}</b>\nLoyiha: ${escapeTelegramHtml(result.name)}${parsed.data.note ? `\n${escapeTelegramHtml(parsed.data.note)}` : ""}`);
  }
  return Response.json({ ok: true });
}
