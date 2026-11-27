import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit, tooManyAttempts } from "@/lib/rate-limit";
import { cashReference, invoiceRoom } from "@/lib/quote-rules";
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
  const limit = await rateLimit("invoice-payment", user.id, 10, 60 * 60 * 1000);
  if (!limit.ok) return tooManyAttempts(limit.retryAfterSeconds);
  const { id } = await context.params;
  // A cash payment has no bank document number; the server names it so two customers never collide.
  const reference = parsed.data.method === "CASH" ? cashReference(randomBytes(6).toString("hex")) : parsed.data.reference;
  if (!reference) return Response.json({ error: "To‘lov hujjati raqamini yozing." }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Two reports at once must not together pass the invoice total.
      await tx.$queryRaw`SELECT id FROM "Invoice" WHERE id = ${id} FOR UPDATE`;
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
      const total = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPriceMinor + item.taxMinor - item.discountMinor, 0);
      const committed = await tx.payment.aggregate({
        where: { invoiceId: id, status: { in: ["PENDING", "VERIFIED"] } },
        _sum: { amountMinor: true }
      });
      if (parsed.data.amountMinor > invoiceRoom(total, committed._sum.amountMinor ?? 0)) {
        return { error: "To‘lov summasi hisob-fakturaning qolgan qismidan oshmasligi kerak.", status: 409 as const };
      }
      const payment = await tx.payment.create({
        data: {
          invoiceId: id,
          amountMinor: parsed.data.amountMinor,
          currency: invoice.currency,
          method: parsed.data.method,
          reference,
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Bu hujjat raqami bilan to‘lov allaqachon yuborilgan. Raqamni tekshiring.", code: "REFERENCE_USED" }, { status: 409 });
    }
    console.error("Manual payment submission failed", error);
    return Response.json({ error: "To‘lov ma’lumotini qayd qilib bo‘lmadi." }, { status: 500 });
  }
}
