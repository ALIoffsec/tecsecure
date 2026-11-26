import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { prisma } from "@/lib/prisma";
import { getPaymentCard } from "@/lib/payment-card";
import { WalletPanel } from "@/components/wallet-panel";
import { CabinetTitle } from "@/components/cabinet/sections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Hamyon va TEC | Tecsecure" }, robots: { index: false, follow: false } };

export default async function CabinetWalletPage() {
  if (isPreviewMode) return <PreviewModeNotice />;
  const user = await requireUser("/portal/wallet");
  const [wallet, paymentCard] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { walletBalanceMinor: true, rewardPoints: true, walletTransactions: { orderBy: { createdAt: "desc" }, take: 100, select: { id: true, kind: true, status: true, amountMinor: true, reference: true, details: true, proofMediaId: true, createdAt: true } } }
    }),
    getPaymentCard()
  ]);
  return <><CabinetTitle section="wallet" /><WalletPanel paymentCard={paymentCard} initialBalance={wallet?.walletBalanceMinor ?? 0} initialPoints={wallet?.rewardPoints ?? 0} transactions={wallet?.walletTransactions ?? []} /></>;
}
