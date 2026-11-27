import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { prisma } from "@/lib/prisma";
import { CabinetTitle, MessagesSection } from "@/components/cabinet/sections";
import { unreadForCustomer } from "@/lib/conversations";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Xabarlarim | Tecsecure" }, robots: { index: false, follow: false } };

export default async function CabinetMessagesPage() {
  if (isPreviewMode) return <PreviewModeNotice />;
  const user = await requireUser("/portal/messages");
  const rows = await prisma.portalConversation.findMany({
    where: { customerId: user.id },
    select: { id: true, reference: true, category: true, subject: true, createdAt: true, status: true, customerReadAt: true, messages: { orderBy: { createdAt: "asc" }, select: { id: true, sender: true, body: true, createdAt: true } } },
    orderBy: { lastMessageAt: "desc" },
    take: 50
  });
  // What is new is counted before the page marks everything as read, so this visit still shows it.
  const conversations = rows.map(row => ({ ...row, unread: unreadForCustomer(row.messages, row.customerReadAt) }));
  if (conversations.some(row => row.unread > 0)) await prisma.portalConversation.updateMany({ where: { customerId: user.id }, data: { customerReadAt: new Date() } });
  return <><CabinetTitle section="messages" /><MessagesSection conversations={conversations} userName={user.name} /></>;
}
