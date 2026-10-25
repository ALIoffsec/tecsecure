import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StoreView } from "@/components/store-view";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { isPreviewMode } from "@/lib/preview-mode";
import { getPublishedLearningDocuments } from "@/lib/learning-content";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  if (isPreviewMode) return <div className="container page-shell"><PreviewModeNotice /></div>;
  const user = await requireUser();
  const [account, modules] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { walletBalanceMinor: true } }),
    getPublishedLearningDocuments("module")
  ]);
  return <StoreView walletBalanceMinor={account?.walletBalanceMinor ?? 0} moduleCount={modules.length} />;
}
