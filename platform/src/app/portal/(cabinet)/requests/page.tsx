import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { cabinetRequestList } from "@/lib/cabinet-requests-data";
import { RequestList } from "@/components/cabinet/request-views";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Arizalarim | Tecsecure" }, robots: { index: false, follow: false } };

export default async function CabinetRequestsPage() {
  if (isPreviewMode) return <PreviewModeNotice />;
  const user = await requireUser("/portal/requests");
  const data = await cabinetRequestList(user.id);
  return <RequestList rows={data.rows} catalog={data.catalog} />;
}
