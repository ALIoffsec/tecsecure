import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { settingsState } from "@/lib/settings-data";
import { NotificationSettings } from "@/components/cabinet/settings-views";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Bildirishnomalar | Tecsecure" }, robots: { index: false, follow: false } };

/** Open to staff too: their password and two-factor live here. */
export default async function Page() {
  if (isPreviewMode) return <PreviewModeNotice />;
  const user = await requireUser("/portal/settings/notifications");
  return <NotificationSettings state={await settingsState(user.id)} />;
}
