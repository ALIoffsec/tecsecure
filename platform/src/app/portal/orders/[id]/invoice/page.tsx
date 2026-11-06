import { notFound } from "next/navigation";
import { InvoiceView } from "@/components/growth-pages";
import { requireUser } from "@/lib/auth";
import { getCompanyRequisites } from "@/lib/payment-card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "To‘lov uchun hisob | Tecsecure", robots: { index: false, follow: false } };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("/portal/orders");
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  const staff = user.role === "FOUNDER" || user.role === "ADMIN" || (user.role === "STAFF" && user.permissions.includes("PRODUCTS"));
  if (!order || order.paymentMethod !== "BANK_TRANSFER" || (order.customerId !== user.id && !staff)) notFound();
  return <InvoiceView order={order} seller={await getCompanyRequisites()} />;
}
