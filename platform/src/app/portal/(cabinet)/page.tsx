import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { cabinetFrameData, cabinetHomeData } from "@/lib/cabinet-data";
import { CabinetHome } from "@/components/cabinet/cabinet-home";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Kabinet | Tecsecure" }, robots: { index: false, follow: false } };

export default async function CabinetHomePage() {
  if (isPreviewMode) return <PreviewModeNotice />;
  const user = await requireUser("/portal");
  // The frame's data is shared with the layout in this request; the home reads its own counts fresh each visit.
  const [frame, data] = await Promise.all([cabinetFrameData(user.id), cabinetHomeData(user.id)]);
  return <CabinetHome user={frame.user} unread={frame.unread} nav={frame.nav} data={data} />;
}
