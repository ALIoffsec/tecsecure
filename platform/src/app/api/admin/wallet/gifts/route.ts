import { Prisma } from "@prisma/client";
import { isResponse, requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const giftSchema = z.object({
  recipientUserId: z.string().cuid(),
  amountTec: z.number().int().min(1).max(100_000)
});

export async function POST(request: Request) {
  const actor = await requireAdminApi();
  if (isResponse(actor)) return actor;

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = giftSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "TEC miqdori yoki qabul qiluvchi noto‘g‘ri." }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const recipient = await tx.user.findFirst({
        where: { id: parsed.data.recipientUserId, active: true, deletedAt: null },
        select: { id: true, name: true }
      });
      if (!recipient) throw new Error("TEC_GIFT_RECIPIENT_UNAVAILABLE");

      await tx.user.update({
        where: { id: recipient.id },
        data: { rewardPoints: { increment: parsed.data.amountTec } }
      });
      await tx.notification.create({
        data: {
          userId: recipient.id,
          channel: "IN_APP",
          event: "TEC_GIFT",
          status: "UNREAD",
          payload: {
            amountTec: parsed.data.amountTec,
            senderName: actor.name,
            recipientName: recipient.name
          }
        }
      });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "TEC_GIFT_SENT",
          entity: "User",
          entityId: recipient.id,
          metadata: { amountTec: parsed.data.amountTec, selfGift: actor.id === recipient.id }
        }
      });
      return { recipientName: recipient.name, amountTec: parsed.data.amountTec };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "TEC_GIFT_RECIPIENT_UNAVAILABLE") {
      return Response.json({ error: "Faol qabul qiluvchi foydalanuvchi topilmadi." }, { status: 404 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return Response.json({ error: "Balans o‘zgardi, sovg‘ani qayta yuboring." }, { status: 409 });
    }
    console.error("TEC gift failed", error);
    return Response.json({ error: "TEC sovg‘asini yuborib bo‘lmadi." }, { status: 500 });
  }
}
