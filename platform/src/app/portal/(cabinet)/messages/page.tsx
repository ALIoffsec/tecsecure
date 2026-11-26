import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { prisma } from "@/lib/prisma";
import { CabinetTitle, MessagesSection } from "@/components/cabinet/sections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Xabarlarim | Tecsecure" }, robots: { index: false, follow: false } };

export default async function CabinetMessagesPage() {
  if (isPreviewMode) return <PreviewModeNotice />;
  const user = await requireUser("/portal/messages");
  const conversations = await prisma.portalConversation.findMany({
    where: { customerId: user.id },
    select: { id: true, reference: true, category: true, subject: true, createdAt: true, messages: { orderBy: { createdAt: "asc" }, select: { id: true, sender: true, body: true, createdAt: true } } },
    orderBy: { updatedAt: "desc" },
    take: 50
  });
  return <><CabinetTitle section="messages" /><MessagesSection conversations={conversations} userName={user.name} /></>;
}
