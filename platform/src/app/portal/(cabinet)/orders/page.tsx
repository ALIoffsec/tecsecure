import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { cabinetOrderList } from "@/lib/cabinet-data";
import { OrderList } from "@/components/cabinet/order-list";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Buyurtmalarim | Tecsecure" }, robots: { index: false, follow: false } };

export default async function CabinetOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (isPreviewMode) return <PreviewModeNotice />;
  const user = await requireUser("/portal/orders");
  const { status, page } = await searchParams;
  const data = await cabinetOrderList(user.id, typeof status === "string" ? status : undefined, typeof page === "string" ? page : undefined);
  return <OrderList data={data} />;
}
