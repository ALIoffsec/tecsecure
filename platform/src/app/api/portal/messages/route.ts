import { randomBytes } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { escapeTelegramHtml, notifyTelegramAdmins } from "@/lib/telegram";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const messageSchema = z.object({
  message: z.string().trim().min(3).max(3000)
});

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
    ].join("\n"));

    return Response.json({ reference: conversation.reference, telegramSent }, { status: 201 });
  } catch (error) {
    console.error("Customer portal message submission failed", error);
    return Response.json({ error: "Xabarni saqlab bo‘lmadi. Iltimos, qayta urinib ko‘ring." }, { status: 500 });
  }
}
