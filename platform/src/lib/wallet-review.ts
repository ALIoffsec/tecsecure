import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type WalletReviewStatus = "APPROVED" | "REJECTED";
export type WalletReviewFailure = "NOT_FOUND" | "ALREADY_REVIEWED" | "BALANCE_TOO_LOW" | "USER_NOT_FOUND" | "CONFLICT";

export class WalletReviewError extends Error {
  constructor(readonly code: WalletReviewFailure) {
    super(code);
  }
}

export const walletReviewMessages: Record<WalletReviewFailure, { status: number; error: string }> = {
  NOT_FOUND: { status: 404, error: "Hamyon so‘rovi topilmadi." },
  ALREADY_REVIEWED: { status: 409, error: "Bu so‘rov avval ko‘rib chiqilgan." },
  BALANCE_TOO_LOW: { status: 409, error: "Hamyon balansi yechib olish uchun yetarli emas." },
  USER_NOT_FOUND: { status: 404, error: "Hamyon egasi topilmadi." },
  CONFLICT: { status: 409, error: "Hamyon holati o‘zgardi, qayta urinib ko‘ring." }
};

/**
 * The single place where a wallet request changes money, so the admin panel and the Telegram
 * buttons cannot drift apart. A review from Telegram has no site user behind it, so actorId is null
 * and the audit record says where it came from.
 */
export async function reviewWalletTransaction(id: string, status: WalletReviewStatus, actor: { id: string | null; via: "panel" | "telegram" }) {
  try {
    return await prisma.$transaction(async (tx) => {
      const current = await tx.walletTransaction.findUnique({ where: { id } });
      if (!current) throw new WalletReviewError("NOT_FOUND");
      if (current.status !== "PENDING") throw new WalletReviewError("ALREADY_REVIEWED");
      if (status === "APPROVED") {
        const user = await tx.user.findUnique({ where: { id: current.userId }, select: { walletBalanceMinor: true } });
        if (!user) throw new WalletReviewError("USER_NOT_FOUND");
        if (current.kind === "WITHDRAWAL" && user.walletBalanceMinor < current.amountMinor) throw new WalletReviewError("BALANCE_TOO_LOW");
        const delta = current.kind === "DEPOSIT" ? current.amountMinor : -current.amountMinor;
        const earnedPoints = current.kind === "DEPOSIT" ? Math.floor(current.amountMinor / 1_000_000) : 0;
        await tx.user.update({
          where: { id: current.userId },
          data: { walletBalanceMinor: { increment: delta }, rewardPoints: { increment: earnedPoints } }
        });
      }
      const updated = await tx.walletTransaction.update({
        where: { id: current.id },
        data: { status, reviewedById: actor.id, reviewedAt: new Date() }
      });
      await tx.auditLog.create({
        data: { actorId: actor.id, action: `WALLET_${current.kind}_${status}`, entity: "WalletTransaction", entityId: current.id, metadata: { via: actor.via } }
      });
      await tx.notification.create({
        data: { userId: current.userId, channel: "IN_APP", event: `WALLET_${status}`, status: "DELIVERED", payload: { kind: current.kind, amountMinor: current.amountMinor } }
      });
      return updated;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") throw new WalletReviewError("CONFLICT");
    throw error;
  }
}
