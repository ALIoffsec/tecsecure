import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { prisma } from "@/lib/prisma";
import { getPaymentCard } from "@/lib/payment-card";
import { CabinetTitle } from "@/components/cabinet/sections";
import { WalletView } from "@/components/cabinet/wallet-view";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Hamyon va TEC | Tecsecure" }, robots: { index: false, follow: false } };

export default async function CabinetWalletPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (isPreviewMode) return <PreviewModeNotice />;
  const user = await requireUser("/portal/wallet");
  const [wallet, paymentCard] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { walletBalanceMinor: true, rewardPoints: true, walletTransactions: { orderBy: { createdAt: "desc" }, take: 100, select: { id: true, kind: true, status: true, amountMinor: true, reference: true, details: true, createdAt: true } } }
    }),
    getPaymentCard()
  ]);
  // "?topup=<tiyin>" from the store opens the top-up with the missing amount filled in (only a hint, checked again on send).
  const { topup } = await searchParams;
  const start = typeof topup === "string" && /^\d{1,12}$/.test(topup) ? Number(topup) : null;
  return <><CabinetTitle section="wallet" /><WalletView balanceMinor={wallet?.walletBalanceMinor ?? 0} points={wallet?.rewardPoints ?? 0} entries={wallet?.walletTransactions ?? []} paymentCard={paymentCard} startTopUp={start && start > 0 ? start : null} /></>;
}
