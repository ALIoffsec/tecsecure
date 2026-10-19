import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";
import { TEC_PRICE_UZS, tecPurchaseCostMinor } from "@/lib/tec-pricing";
import { z } from "zod";

export const runtime = "nodejs";

const purchaseSchema = z.object({ amountTec: z.number().int().min(1).max(2_000) });

export async function POST(request: Request) {
  if (isPreviewMode) return Response.json({ error: "TEC xaridi hozircha mavjud emas." }, { status: 503 });
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "TEC sotib olish uchun tizimga kiring." }, { status: 401 });
  if (user.role !== "CUSTOMER") return Response.json({ error: "TEC’ni faqat mijoz hisobi sotib olishi mumkin." }, { status: 403 });

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = purchaseSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "TEC miqdori 1 dan 2 000 gacha butun son bo‘lishi kerak." }, { status: 400 });

  const amountMinor = tecPurchaseCostMinor(parsed.data.amountTec);
  try {
    const result = await prisma.$transaction(async (tx) => {
      const debit = await tx.user.updateMany({
        where: { id: user.id, walletBalanceMinor: { gte: amountMinor } },
        data: {
          walletBalanceMinor: { decrement: amountMinor },
          rewardPoints: { increment: parsed.data.amountTec }
        }
      });
      if (debit.count !== 1) throw new Error("TEC_WALLET_BALANCE_TOO_LOW");

      const account = await tx.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { walletBalanceMinor: true, rewardPoints: true }
      });
      const transaction = await tx.walletTransaction.create({
        data: {
          userId: user.id,
          kind: "TEC_PURCHASE",
          status: "APPROVED",
          amountMinor,
          details: `TEC xaridi: ${parsed.data.amountTec} TEC (${TEC_PRICE_UZS.toLocaleString("en-US")} UZS/TEC)`
        }
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "TEC_PURCHASED",
          entity: "WalletTransaction",
          entityId: transaction.id
        }
      });
      return { account, transaction, amountTec: parsed.data.amountTec };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return Response.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "TEC_WALLET_BALANCE_TOO_LOW") {
      return Response.json({ error: "TEC sotib olish uchun hamyoningizdagi UZS mablag‘i yetarli emas." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return Response.json({ error: "Hamyon balansi o‘zgardi. Xaridni qayta urinib ko‘ring." }, { status: 409 });
    }
    console.error("TEC purchase failed", error);
    return Response.json({ error: "TEC xaridini yakunlab bo‘lmadi." }, { status: 500 });
  }
}
