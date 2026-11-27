import { randomBytes } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { escapeTelegramHtml, notifyTelegramAdmins } from "@/lib/telegram";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { unreadForCustomer } from "@/lib/conversations";

export const runtime = "nodejs";

const messageSchema = z.object({
  message: z.string().trim().min(3).max(3000)
});

/**
 * The help panel's view: the customer's own latest conversations (text only) and how many staff replies are
 * unread. `?scope=count` answers just the number. Guests and staff get an empty answer.
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") return Response.json({ guest: true, unread: 0, conversations: [] }, { headers: { "Cache-Control": "no-store" } });
  const query = new URL(request.url).searchParams;
  const countOnly = query.get("scope") === "count";
  // The help panel shows the latest few; the messages page asks for more.
  const many = query.get("scope") === "all";
  const rows = await prisma.portalConversation.findMany({
    where: { customerId: user.id },
    orderBy: { lastMessageAt: "desc" },
    take: countOnly ? 20 : many ? 50 : 10,
    select: { id: true, reference: true, subject: true, status: true, customerReadAt: true, lastMessageAt: true, messages: { orderBy: { createdAt: "desc" }, take: countOnly ? 10 : 100, select: { id: true, sender: true, body: true, createdAt: true } } }
  });
  const unread = rows.reduce((sum, row) => sum + unreadForCustomer(row.messages, row.customerReadAt), 0);
  if (countOnly) return Response.json({ guest: false, unread }, { headers: { "Cache-Control": "no-store" } });
  return Response.json({
    guest: false, unread,
    conversations: rows.map(row => ({
      id: row.id, reference: row.reference, subject: row.subject, status: row.status, lastMessageAt: row.lastMessageAt,
      unread: unreadForCustomer(row.messages, row.customerReadAt),
      messages: [...row.messages].reverse().map(message => ({ id: message.id, fromStaff: message.sender !== "CUSTOMER", body: message.body, createdAt: message.createdAt }))
    }))
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  if (user.role !== "CUSTOMER") return Response.json({ error: "Faqat mijozlar xabar yuborishi mumkin." }, { status: 403 });
  if (!(await checkRateLimit("portal-message", user.id, 5, 60 * 60 * 1000))) {
    return Response.json({ error: "Xabar yuborish limiti oshdi. Keyinroq urinib ko‘ring." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Xabar kamida 3 ta belgi va ko‘pi bilan 3000 ta belgi bo‘lishi kerak." }, { status: 400 });
  }

  try {
    const reference = `MSG-${new Date().getUTCFullYear()}-${randomBytes(8).toString("hex").toUpperCase()}`;
    const conversation = await prisma.$transaction(async (tx) => {
      const created = await tx.portalConversation.create({
        data: {
          reference,
          category: "MESSAGE",
          sourceType: "CUSTOMER_MESSAGE",
          sourceId: reference,
          subject: "Saytdan yangi xabar",
          customerName: user.name,
          customerId: user.id,
          messages: { create: { sender: "CUSTOMER", body: parsed.data.message } }
        },
        select: { id: true, reference: true }
      });
      const admins = await tx.user.findMany({
        where: { role: { in: ["FOUNDER", "ADMIN", "STAFF"] }, active: true },
        select: { id: true }
      });
      if (admins.length > 0) {
        await tx.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            channel: "IN_APP",
            event: "CUSTOMER_MESSAGE_RECEIVED",
            status: "DELIVERED",
            payload: { reference: created.reference, conversationId: created.id }
          }))
        });
      }
      return created;
    });

    const telegramSent = await notifyTelegramAdmins([
      "<b>Saytdan yangi mijoz xabari</b>",
      `Murojaat: <code>${escapeTelegramHtml(conversation.reference)}</code>`,
      `Mijoz: ${escapeTelegramHtml(user.name)} · ${escapeTelegramHtml(user.email)}`,
      "",
      escapeTelegramHtml(parsed.data.message),
      "",
      `Javob: <code>/reply ${escapeTelegramHtml(conversation.reference)} matn</code>`
    ].join("\n"), conversation.reference);

    return Response.json({ reference: conversation.reference, telegramSent }, { status: 201 });
  } catch (error) {
    console.error("Customer portal message submission failed", error);
    return Response.json({ error: "Xabarni saqlab bo‘lmadi. Iltimos, qayta urinib ko‘ring." }, { status: 500 });
  }
}
