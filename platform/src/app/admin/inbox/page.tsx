import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unreadForStaff } from "@/lib/conversations";
import { AdminInboxList } from "@/components/admin-inbox";

export const dynamic = "force-dynamic";
export const metadata = { title: { absolute: "Xabarlar qutisi | Tecsecure" }, robots: { index: false, follow: false } };

/** Every customer conversation, newest first: open ones by default, unread ones marked. */
export default async function AdminInboxPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage();
  const { status } = await searchParams;
  const filter = status === "CLOSED" ? "CLOSED" : status === "ALL" ? "ALL" : "OPEN";
  const rows = await prisma.portalConversation.findMany({
    where: filter === "ALL" ? {} : { status: filter },
    orderBy: { lastMessageAt: "desc" },
    take: 200,
    select: {
      id: true, reference: true, category: true, subject: true, customerName: true, status: true, lastMessageAt: true, staffReadAt: true,
      messages: { orderBy: { createdAt: "desc" }, take: 20, select: { sender: true, body: true, createdAt: true } }
    }
  });
  const conversations = rows.map(row => ({
    id: row.id, reference: row.reference, category: row.category, subject: row.subject, customerName: row.customerName, status: row.status,
    lastMessageAt: row.lastMessageAt, unread: unreadForStaff(row.messages, row.staffReadAt), preview: row.messages[0]?.body.slice(0, 140) ?? ""
  }));
  return <AdminInboxList conversations={conversations} filter={filter} />;
}
