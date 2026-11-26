import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { cabinetFrameData } from "@/lib/cabinet-data";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { CabinetFrame } from "@/components/cabinet/cabinet-frame";

export const dynamic = "force-dynamic";

/**
 * The cabinet's frame and its small head. Access is still checked by every page itself: a layout is not
 * drawn again when moving between pages, so it cannot be the only gate.
 */
export default async function CabinetLayout({ children }: { children: ReactNode }) {
  if (isPreviewMode) return <div className="container page-shell"><PreviewModeNotice /></div>;
  // Without a session the page itself sends the person to sign in, with its own address to come back to.
  const user = await getCurrentUser();
  if (!user) return <>{children}</>;
  const frame = await cabinetFrameData(user.id);
  return <CabinetFrame user={frame.user} nav={frame.nav} unread={frame.unread}>{children}</CabinetFrame>;
}
