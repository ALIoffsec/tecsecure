import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { cabinetOrderDetail } from "@/lib/cabinet-data";
import { OrderDetail } from "@/components/cabinet/order-detail";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Buyurtma | Tecsecure" }, robots: { index: false, follow: false } };

export default async function CabinetOrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (isPreviewMode) return <PreviewModeNotice />;
  const { id } = await params;
  const user = await requireUser(`/portal/orders/${encodeURIComponent(id)}`);
  const order = await cabinetOrderDetail(user.id, id);
  // Someone else's order looks the same as one that does not exist.
  if (!order) notFound();
  const { payme } = await searchParams;
  return <OrderDetail order={order} fromPayme={payme === "1"} />;
}
