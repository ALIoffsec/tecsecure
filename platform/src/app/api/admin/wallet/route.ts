import { Prisma } from "@prisma/client";
import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const reviewSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["APPROVED", "REJECTED"])
});

export async function GET() {
  const actor = await requireModuleApi("WALLET");
  if (isResponse(actor)) return actor;
  const transactions = await prisma.walletTransaction.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { name: true, email: true, walletBalanceMinor: true } } },
    orderBy: { createdAt: "asc" },
    take: 200
  });
  return Response.json({ transactions });
}

export async function PATCH(request: Request) {
  const actor = await requireModuleApi("WALLET");
  if (isResponse(actor)) return actor;
  let input: unknown;
  try { input = await request.json(); } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Hamyon so‘rovi noto‘g‘ri." }, { status: 400 });
  try {
    const transaction = await prisma.$transaction(async (tx) => {
      const current = await tx.walletTransaction.findUnique({ where: { id: parsed.data.id } });
      if (!current) throw new Error("WALLET_TRANSACTION_NOT_FOUND");
      if (current.status !== "PENDING") throw new Error("WALLET_TRANSACTION_ALREADY_REVIEWED");
      if (parsed.data.status === "APPROVED") {
        const user = await tx.user.findUnique({ where: { id: current.userId }, select: { walletBalanceMinor: true, rewardPoints: true } });
        if (!user) throw new Error("WALLET_USER_NOT_FOUND");
        if (current.kind === "WITHDRAWAL" && user.walletBalanceMinor < current.amountMinor) throw new Error("WALLET_BALANCE_TOO_LOW");
        const delta = current.kind === "DEPOSIT" ? current.amountMinor : -current.amountMinor;
        const earnedPoints = current.kind === "DEPOSIT" ? Math.floor(current.amountMinor / 1_000_000) : 0;
        await tx.user.update({
          where: { id: current.userId },
          data: {
            walletBalanceMinor: { increment: delta },
            rewardPoints: { increment: earnedPoints }
          }
        });
      }
      const updated = await tx.walletTransaction.update({
        where: { id: current.id },
        data: { status: parsed.data.status, reviewedById: actor.id, reviewedAt: new Date() }
      });
      await tx.auditLog.create({
        data: { actorId: actor.id, action: `WALLET_${current.kind}_${parsed.data.status}`, entity: "WalletTransaction", entityId: current.id }
      });
      return updated;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return Response.json({ transaction });
  } catch (error) {
    if (error instanceof Error && error.message === "WALLET_TRANSACTION_NOT_FOUND") return Response.json({ error: "Hamyon so‘rovi topilmadi." }, { status: 404 });
    if (error instanceof Error && error.message === "WALLET_TRANSACTION_ALREADY_REVIEWED") return Response.json({ error: "Bu so‘rov avval ko‘rib chiqilgan." }, { status: 409 });
    if (error instanceof Error && error.message === "WALLET_BALANCE_TOO_LOW") return Response.json({ error: "Hamyon balansi yechib olish uchun yetarli emas." }, { status: 409 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return Response.json({ error: "Hamyon holati o‘zgardi, qayta urinib ko‘ring." }, { status: 409 });
    console.error("Wallet transaction review failed", error);
    return Response.json({ error: "Hamyon so‘rovini ko‘rib chiqib bo‘lmadi." }, { status: 500 });
  }
}
