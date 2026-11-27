import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { cabinetRequestDetail } from "@/lib/cabinet-requests-data";
import { RequestDetail } from "@/components/cabinet/request-views";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Ariza | Tecsecure" }, robots: { index: false, follow: false } };

export default async function CabinetRequestPage({ params }: { params: Promise<{ id: string }> }) {
  if (isPreviewMode) return <PreviewModeNotice />;
  const { id } = await params;
  const user = await requireUser(`/portal/requests/${encodeURIComponent(id)}`);
  const data = await cabinetRequestDetail(user.id, id);
  // Someone else's request looks the same as one that does not exist.
  if (!data) notFound();
  return <RequestDetail data={data} />;
}
