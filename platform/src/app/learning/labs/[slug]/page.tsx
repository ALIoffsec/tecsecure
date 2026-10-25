import { notFound } from "next/navigation";
import { LabView } from "@/components/lab-view";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { requireUser } from "@/lib/auth";
import { toPublicLab } from "@/lib/learning-labs";
import { getLearningLab } from "@/lib/learning-content";
import { labPriceFor } from "@/lib/practice-perks";
import { getActivePlanKey, labPurchaseKey } from "@/lib/practice-server";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LabPage({ params }: { params: Promise<{ slug: string }> }) {
  if (isPreviewMode) return <div className="container page-shell"><PreviewModeNotice /></div>;
  const { slug } = await params;
  const lab = await getLearningLab(slug);
  if (!lab) notFound();
  const user = await requireUser();
  const [account, planKey, purchase, solved, completion] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { rewardPoints: true } }),
    getActivePlanKey(user.id),
    prisma.learningPurchase.findUnique({ where: { userId_purchaseKey: { userId: user.id, purchaseKey: labPurchaseKey(lab.slug) } }, select: { id: true } }),
    prisma.learningLabTask.findMany({ where: { userId: user.id, labSlug: lab.slug }, select: { taskId: true } }),
    prisma.learningLabCompletion.findUnique({ where: { userId_labSlug: { userId: user.id, labSlug: lab.slug } }, select: { id: true } })
  ]);
  const unlocked = Boolean(purchase);
  const publicLab = toPublicLab(lab);
  return <LabView
    lab={unlocked ? publicLab : { ...publicLab, evidence: [], tasks: [], debrief: "" }}
    meta={{ taskCount: lab.tasks.length, evidenceCount: lab.evidence.length }}
    unlocked={unlocked}
    price={labPriceFor(planKey, lab.priceTec)}
    listPrice={lab.priceTec}
    tecBalance={account?.rewardPoints ?? 0}
    solvedIds={solved.map((item) => item.taskId)}
    completed={Boolean(completion)}
    debrief={completion ? lab.debrief : ""}
  />;
}
