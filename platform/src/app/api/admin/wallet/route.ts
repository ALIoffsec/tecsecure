import { isResponse, requireModuleApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyTelegramUser, walletDecisionText } from "@/lib/telegram";
import { reviewWalletTransaction, WalletReviewError, walletReviewMessages } from "@/lib/wallet-review";
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
    const transaction = await reviewWalletTransaction(parsed.data.id, parsed.data.status, { id: actor.id, via: "panel" });
    await notifyTelegramUser(transaction.userId, walletDecisionText(transaction));
    return Response.json({ transaction });
  } catch (error) {
    if (error instanceof WalletReviewError) {
      const { status, error: message } = walletReviewMessages[error.code];
      return Response.json({ error: message }, { status });
    }
    console.error("Wallet transaction review failed", error);
    return Response.json({ error: "Hamyon so‘rovini ko‘rib chiqib bo‘lmadi." }, { status: 500 });
  }
}
