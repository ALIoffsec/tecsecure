import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { cabinetOrders } from "@/lib/cabinet-data";
import { CustomerOrders } from "@/components/order-views";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Buyurtmalarim | Tecsecure" }, robots: { index: false, follow: false } };

export default async function CabinetOrdersPage() {
  if (isPreviewMode) return <PreviewModeNotice />;
  const user = await requireUser("/portal/orders");
  return <CustomerOrders orders={await cabinetOrders(user.id)} embedded />;
}
