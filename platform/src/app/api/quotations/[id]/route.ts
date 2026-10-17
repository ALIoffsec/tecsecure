import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
const schema = z.object({ status: z.enum(["ACCEPTED", "REJECTED"]) });

export async function PATCH(request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") return Response.json({ error: "Taklifga faqat tegishli mijoz javob bera oladi." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Taklif holati noto‘g‘ri." }, { status: 400 });
  const { id } = await context.params;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const quote = await tx.quotation.findUnique({ where: { id }, include: { project: { select: { id: true, customerId: true } } } });
      if (!quote) return { error: "Taklif topilmadi.", status: 404 as const };
      if (user.role === "CUSTOMER" && quote.project.customerId !== user.id) {
        return { error: "Bu taklifga ruxsat yo‘q.", status: 403 as const };
      }
      if (user.role === "CUSTOMER" && quote.status !== "ISSUED") {
        return { error: "Faqat yuborilgan taklifga javob berish mumkin.", status: 409 as const };
      }
      if (user.role === "CUSTOMER") {
        const latest = await tx.quotation.findFirst({
          where: { projectId: quote.project.id },
          orderBy: { version: "desc" },
          select: { id: true }
        });
        if (latest?.id !== quote.id) return { error: "Faqat eng so‘nggi narx taklifiga javob berish mumkin.", status: 409 as const };
        if (quote.validUntil && quote.validUntil < new Date()) {
          return { error: "Narx taklifining amal qilish muddati tugagan.", status: 409 as const };
        }
      }
      const updated = await tx.quotation.update({ where: { id }, data: { status: parsed.data.status } });
      await tx.project.update({
        where: { id: quote.project.id },
        data: { status: parsed.data.status === "ACCEPTED" ? "APPROVED" : "QUOTE_REQUESTED" }
      });
      await tx.auditLog.create({
        data: { actorId: user.id, action: `QUOTATION_${parsed.data.status}`, entity: "Quotation", entityId: id }
      });
      return { quotation: updated };
    });
    if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
    return Response.json({ quotation: result.quotation });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) console.error("Quotation response database error", error);
    else console.error("Quotation response failed", error);
    return Response.json({ error: "Taklif javobini saqlab bo‘lmadi." }, { status: 500 });
  }
}
