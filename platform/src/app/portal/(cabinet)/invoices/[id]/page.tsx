import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { cabinetInvoice } from "@/lib/cabinet-requests-data";
import { getCompanyRequisites } from "@/lib/payment-card";
import { InvoiceView } from "@/components/cabinet/invoice-view";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "To‘lov uchun hisob | Tecsecure" }, robots: { index: false, follow: false } };

export default async function CabinetInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  if (isPreviewMode) return <PreviewModeNotice />;
  const { id } = await params;
  const user = await requireUser(`/portal/invoices/${encodeURIComponent(id)}`);
  // Staff with the payments permission open any invoice; a customer only their own.
  const staff = user.role === "FOUNDER" || user.role === "ADMIN" || (user.role === "STAFF" && user.permissions.includes("PAYMENTS"));
  const [invoice, seller] = await Promise.all([cabinetInvoice(id, { id: user.id, staff }), getCompanyRequisites()]);
  if (!invoice) notFound();
  const project = invoice.quotation?.project;
  const backHref = staff && user.role !== "CUSTOMER" ? "/admin" : project ? `/portal/requests/${project.requestId ?? project.id}` : "/portal/requests";
  return <InvoiceView invoice={invoice} seller={seller} backHref={backHref} />;
}
