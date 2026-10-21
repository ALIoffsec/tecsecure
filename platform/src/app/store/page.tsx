import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StoreView } from "@/components/store-view";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { isPreviewMode } from "@/lib/preview-mode";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  if (isPreviewMode) return <div className="container page-shell"><PreviewModeNotice /></div>;
  const user = await requireUser();
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { walletBalanceMinor: true } });
  return <StoreView walletBalanceMinor={account?.walletBalanceMinor ?? 0} />;
}
