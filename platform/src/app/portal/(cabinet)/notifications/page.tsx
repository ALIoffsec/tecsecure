import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { NotificationList } from "@/components/cabinet/notification-list";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Bildirishnomalar | Tecsecure" }, robots: { index: false, follow: false } };

export default async function CabinetNotificationsPage() {
  if (isPreviewMode) return <PreviewModeNotice />;
  await requireUser("/portal/notifications");
  return <NotificationList />;
}
