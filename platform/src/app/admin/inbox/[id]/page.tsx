import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminInboxThread } from "@/components/admin-inbox";

export const dynamic = "force-dynamic";
export const metadata = { title: { absolute: "Suhbat | Tecsecure" }, robots: { index: false, follow: false } };

/** One conversation for staff; opening it marks the customer's messages as read by staff. */
export default async function AdminInboxThreadPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const conversation = await prisma.portalConversation.findUnique({
    where: { id },
    select: {
      id: true, reference: true, category: true, subject: true, customerName: true, customerPhone: true, status: true, sourceType: true, sourceId: true,
      customer: { select: { email: true, phone: true } },
      messages: { orderBy: { createdAt: "asc" }, select: { id: true, sender: true, body: true, createdAt: true } }
    }
  });
  if (!conversation) notFound();
  await prisma.portalConversation.update({ where: { id }, data: { staffReadAt: new Date() } });
  return <AdminInboxThread conversation={conversation} />;
}
