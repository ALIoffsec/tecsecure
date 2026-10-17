import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { manualPaymentSchema } from "@/lib/validation";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") return Response.json({ error: "Faqat mijoz to‘lov ma’lumotini yuborishi mumkin." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = manualPaymentSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "To‘lov ma’lumotlari noto‘g‘ri." }, { status: 400 });
  const { id } = await context.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id },
        include: { quotation: { include: { project: { select: { customerId: true } } } }, items: true }
      });
      if (!invoice) return { error: "Hisob-faktura topilmadi.", status: 404 as const };
      if (user.role === "CUSTOMER" && invoice.quotation?.project.customerId !== user.id) {
        return { error: "Bu hisob-fakturaga ruxsat yo‘q.", status: 403 as const };
      }
      if (!["ISSUED", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status)) {
        return { error: "Ushbu hisob-fakturaga to‘lov qabul qilinmaydi.", status: 409 as const };
      }
      const payment = await tx.payment.create({
        data: {
          invoiceId: id,
          amountMinor: parsed.data.amountMinor,
          currency: invoice.currency,
          method: parsed.data.method,
          reference: parsed.data.reference,
          submittedById: user.id,
          status: "PENDING"
        },
        select: { id: true, amountMinor: true, currency: true, method: true, reference: true, status: true, createdAt: true }
      });
      await tx.auditLog.create({ data: { actorId: user.id, action: "MANUAL_PAYMENT_SUBMITTED", entity: "Payment", entityId: payment.id } });
      return { payment };
    });
    if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
    return Response.json({ payment: result.payment }, { status: 201 });
  } catch (error) {
    console.error("Manual payment submission failed", error);
    return Response.json({ error: "To‘lov ma’lumotini qayd qilib bo‘lmadi." }, { status: 500 });
  }
}
