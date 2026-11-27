import { Prisma } from "@prisma/client";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
const schema = z.object({ status: z.enum(["VERIFIED", "REJECTED"]) });

export async function PATCH(request: Request, context: Context) {
  const actor = await requireModuleApi("PAYMENTS");
  if (isResponse(actor)) return actor;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "To‘lov holati noto‘g‘ri." }, { status: 400 });
  const { id } = await context.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const found = await tx.payment.findUnique({ where: { id }, select: { invoiceId: true } });
      if (!found) return { error: "To‘lov topilmadi.", status: 404 as const };
      // The invoice row is the lock for everything that changes what was paid on it.
      await tx.$queryRaw`SELECT id FROM "Invoice" WHERE id = ${found.invoiceId} FOR UPDATE`;
      const payment = await tx.payment.findUniqueOrThrow({ where: { id }, include: { invoice: { include: { items: true } } } });
      if (payment.status !== "PENDING") return { error: "Faqat kutilayotgan to‘lovni ko‘rib chiqish mumkin.", status: 409 as const };
      const invoice = payment.invoice;
      if (parsed.data.status === "VERIFIED" && !["ISSUED", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status)) {
        return { error: "Bu hisob bo‘yicha to‘lov qabul qilinmaydi.", status: 409 as const };
      }
      if (parsed.data.status === "VERIFIED") {
        const total = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPriceMinor + item.taxMinor - item.discountMinor, 0);
        const otherVerified = await tx.payment.aggregate({
          where: { invoiceId: invoice.id, status: "VERIFIED" },
          _sum: { amountMinor: true }
        });
        const paid = (otherVerified._sum.amountMinor ?? 0) + payment.amountMinor;
        if (paid > total) return { error: "Tasdiqlash jami hisob-faktura qiymatidan oshib ketadi.", status: 409 as const };
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: paid === total ? "PAID" : "PARTIALLY_PAID" }
        });
      }
      const claim = await tx.payment.updateMany({
        where: { id, status: "PENDING" },
        data: {
          status: parsed.data.status,
          verifiedById: actor.id,
          verifiedAt: parsed.data.status === "VERIFIED" ? new Date() : null
        }
      });
      if (claim.count === 0) throw new Error("ALREADY_REVIEWED");
      const updated = await tx.payment.findUniqueOrThrow({ where: { id } });
      await tx.auditLog.create({
        data: { actorId: actor.id, action: `MANUAL_PAYMENT_${parsed.data.status}`, entity: "Payment", entityId: id }
      });
      return { payment: updated };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
    return Response.json({ payment: result.payment });
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_REVIEWED") {
      return Response.json({ error: "Faqat kutilayotgan to‘lovni ko‘rib chiqish mumkin." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return Response.json({ error: "To‘lov holati parallel o‘zgardi; yangilab qayta urinib ko‘ring." }, { status: 409 });
    }
    console.error("Payment review failed", error);
    return Response.json({ error: "To‘lov holatini yangilab bo‘lmadi." }, { status: 500 });
  }
}
