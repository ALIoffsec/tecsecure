import { randomBytes } from "node:crypto";
import { getCurrentUser, isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") {
    const authorized = await requireModuleApi("PAYMENTS");
    if (authorized instanceof Response) return authorized;
  }
  const invoices = await prisma.invoice.findMany({
    where: user.role === "CUSTOMER" ? { quotation: { project: { customerId: user.id } } } : {},
    include: { items: true, payments: { select: { id: true, amountMinor: true, currency: true, method: true, reference: true, status: true, createdAt: true } }, quotation: { include: { project: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  const results = invoices.map((invoice) => ({
    ...invoice,
    totalMinor: invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPriceMinor + item.taxMinor - item.discountMinor, 0),
    paidMinor: invoice.payments.filter((payment) => payment.status === "VERIFIED").reduce((sum, payment) => sum + payment.amountMinor, 0)
  }));
  return Response.json({ invoices: results });
}

export async function POST(request: Request) {
  const actor = await requireModuleApi("PAYMENTS");
  if (isResponse(actor)) return actor;
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Hisob-faktura ma’lumotlari noto‘g‘ri." }, { status: 400 });
  try {
    const invoice = await prisma.$transaction(async (tx) => {
      const quote = await tx.quotation.findUnique({ where: { id: parsed.data.quotationId }, include: { items: true } });
      if (!quote) throw new Error("QUOTE_NOT_FOUND");
      if (quote.status !== "ACCEPTED") throw new Error("QUOTE_NOT_ACCEPTED");
      const existing = await tx.invoice.findFirst({ where: { quotationId: quote.id, status: { not: "VOID" } }, select: { id: true } });
      if (existing) throw new Error("INVOICE_EXISTS");
      const created = await tx.invoice.create({
        data: {
          number: `INV-${new Date().getUTCFullYear()}-${randomBytes(6).toString("hex").toUpperCase()}`,
          quotationId: quote.id,
          status: "ISSUED",
          currency: quote.currency,
          issuedAt: new Date(),
          dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
          items: { create: quote.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPriceMinor: item.unitPriceMinor,
            discountMinor: item.discountMinor
          })) }
        },
        include: { items: true }
      });
      await tx.auditLog.create({ data: { actorId: actor.id, action: "INVOICE_ISSUED", entity: "Invoice", entityId: created.id } });
      return created;
    });
    const totalMinor = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPriceMinor + item.taxMinor - item.discountMinor, 0);
    return Response.json({ invoice, totalMinor }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "QUOTE_NOT_FOUND") return Response.json({ error: "Taklif topilmadi." }, { status: 404 });
    if (error instanceof Error && error.message === "QUOTE_NOT_ACCEPTED") return Response.json({ error: "Hisob-faktura faqat mijoz qabul qilgan taklifdan yaratiladi." }, { status: 409 });
    if (error instanceof Error && error.message === "INVOICE_EXISTS") return Response.json({ error: "Bu taklif uchun hisob-faktura allaqachon yaratilgan." }, { status: 409 });
    console.error("Invoice creation failed", error);
    return Response.json({ error: "Hisob-fakturani yaratib bo‘lmadi." }, { status: 500 });
  }
}
