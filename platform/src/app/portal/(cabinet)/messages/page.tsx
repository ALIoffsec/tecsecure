import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { CabinetTitle } from "@/components/cabinet/sections";
import { ChatView } from "@/components/chat";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Xabarlarim | Tecsecure" }, robots: { index: false, follow: false } };

/** The same chat as the help panel, with more room. */
export default async function CabinetMessagesPage() {
  if (isPreviewMode) return <PreviewModeNotice />;
  await requireUser("/portal/messages");
  return <><CabinetTitle section="messages" /><section className="panel-card cab-chat-page"><ChatView scope="page" /></section></>;
}
