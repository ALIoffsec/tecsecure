import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { cabinetRequests } from "@/lib/cabinet-data";
import { CabinetTitle, RequestsSection } from "@/components/cabinet/sections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Arizalarim | Tecsecure" }, robots: { index: false, follow: false } };

export default async function CabinetRequestsPage() {
  if (isPreviewMode) return <PreviewModeNotice />;
  const user = await requireUser("/portal/requests");
  const data = await cabinetRequests(user.id);
  return <><CabinetTitle section="requests" /><RequestsSection {...data} /></>;
}
