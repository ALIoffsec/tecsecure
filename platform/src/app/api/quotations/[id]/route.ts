import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { escapeTelegramHtml, notifyTelegramAdmins } from "@/lib/telegram";
import { rateLimit, tooManyAttempts } from "@/lib/rate-limit";
import { QUOTE_REASON, quoteExpired } from "@/lib/customer-requests";
import { z } from "zod";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

const reason = z.string().trim().min(QUOTE_REASON.min).max(QUOTE_REASON.max);
const schema = z.union([
  z.object({ status: z.literal("ACCEPTED") }),
  z.object({ status: z.literal("REJECTED"), reason }),
  // "Ask for changes" (or a renewal of an expired quote): the quote stays as it is, staff get the message.
  z.object({ action: z.literal("CHANGES"), reason })
]);

/** The project's conversation with staff, made on first use, so the customer's words stay with the project. */
async function writeToProject(tx: Prisma.TransactionClient, project: { id: string; reference: string; name: string }, user: { id: string; name: string }, body: string) {
  await tx.portalConversation.upsert({
    where: { sourceType_sourceId: { sourceType: "PROJECT", sourceId: project.id } },
    create: { reference: project.reference, category: "PROJECT", sourceType: "PROJECT", sourceId: project.id, subject: `Loyiha: ${project.name}`, customerName: user.name, customerId: user.id, messages: { create: { sender: "CUSTOMER", body } } },
    update: { messages: { create: { sender: "CUSTOMER", body } } }
  });
}

/** The customer answers the latest issued quote of their project: accept, decline with a reason, or ask for changes. */
export async function PATCH(request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") return Response.json({ error: "Taklifga faqat tegishli mijoz javob bera oladi." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Sababni 3–500 belgida yozing." }, { status: 400 });
  const answer = parsed.data;
  const limit = await rateLimit("quote-answer", user.id, 20, 60 * 60 * 1000);
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSeconds);
  const { id } = await context.params;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const quote = await tx.quotation.findUnique({ where: { id }, include: { project: { select: { id: true, customerId: true, reference: true, name: true } } } });
      if (!quote || quote.project.customerId !== user.id) return { error: "Taklif topilmadi.", status: 404 as const };
      if (quote.status !== "ISSUED") return { error: "Faqat yuborilgan taklifga javob berish mumkin.", status: 409 as const };
      const latest = await tx.quotation.findFirst({ where: { projectId: quote.project.id }, orderBy: { version: "desc" }, select: { id: true } });
      if (latest?.id !== quote.id) return { error: "Faqat eng so‘nggi narx taklifiga javob berish mumkin.", status: 409 as const };
      if ("action" in answer) {
        await writeToProject(tx, quote.project, user, `Taklif ${quote.number} bo‘yicha o‘zgartirish so‘raldi: ${answer.reason}`);
        await tx.auditLog.create({ data: { actorId: user.id, action: "QUOTATION_CHANGES_REQUESTED", entity: "Quotation", entityId: id, metadata: { reason: answer.reason } } });
        return { quotation: quote, kind: "CHANGES" as const };
      }
      if (answer.status === "ACCEPTED" && quoteExpired(quote)) return { error: "Narx taklifining amal qilish muddati tugagan.", status: 409 as const };
      // Two taps or two tabs: only the first answer to an issued quote counts.
      const claim = await tx.quotation.updateMany({ where: { id, status: "ISSUED" }, data: { status: answer.status } });
      if (claim.count === 0) return { error: "Faqat yuborilgan taklifga javob berish mumkin.", status: 409 as const };
      await tx.project.update({ where: { id: quote.project.id }, data: { status: answer.status === "ACCEPTED" ? "APPROVED" : "QUOTE_REQUESTED" } });
      if (answer.status === "REJECTED") await writeToProject(tx, quote.project, user, `Taklif ${quote.number} rad etildi: ${answer.reason}`);
      await tx.auditLog.create({ data: { actorId: user.id, action: `QUOTATION_${answer.status}`, entity: "Quotation", entityId: id, metadata: answer.status === "REJECTED" ? { reason: answer.reason } : undefined } });
      return { quotation: { ...quote, status: answer.status }, kind: answer.status };
    });
    if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
    const titles = { ACCEPTED: "✅ Mijoz narx taklifini qabul qildi", REJECTED: "✖️ Mijoz narx taklifini rad etdi", CHANGES: "✏️ Mijoz taklifni o‘zgartirishni so‘radi" };
    const why = "reason" in answer ? `\n${escapeTelegramHtml(answer.reason)}` : "";
    await notifyTelegramAdmins(`<b>${titles[result.kind]}</b>\nTaklif <code>${escapeTelegramHtml(result.quotation.number)}</code> · ${escapeTelegramHtml(result.quotation.project.name)}${why}`, result.quotation.number);
    return Response.json({ ok: true, status: result.quotation.status });
  } catch (error) {
    console.error("Quotation response failed", error);
    return Response.json({ error: "Taklif javobini saqlab bo‘lmadi." }, { status: 500 });
  }
}
