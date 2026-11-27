import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { prisma } from "@/lib/prisma";
import { getProfilePractice } from "@/lib/learning-profile-server";
import { getLearningSubscriptionPlan } from "@/lib/learning-subscriptions";
import { learningModules } from "@/lib/learning-demo";
import { ProfileHero } from "@/components/profile-hero";
import { CabinetTitle } from "@/components/cabinet/sections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Mening o‘qishim | Tecsecure" }, robots: { index: false, follow: false } };

/**
 * "My learning", the one learning page for a signed-in learner: where to continue (from the server, not the
 * browser), what the plan opens, paths and achievements already started, and real certificates.
 */
export default async function CabinetLearningPage() {
  if (isPreviewMode) return <PreviewModeNotice />;
  const user = await requireUser("/portal/learning");
  const [account, practice, last, subscription] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { rewardPoints: true } }),
    getProfilePractice(user.id),
    prisma.learningProgress.findFirst({ where: { userId: user.id }, orderBy: { completedAt: "desc" }, select: { moduleSlug: true } }),
    prisma.learningSubscription.findUnique({ where: { userId: user.id }, select: { planKey: true, endsAt: true } })
  ]);
  const module = last ? learningModules.find(item => item.slug === last.moduleSlug) : undefined;
  const done = module ? practice.progress.completedSections.filter(item => item.moduleSlug === module.slug).length : 0;
  const resume = module ? { slug: module.slug, title: module.title, done, total: module.sections.length, percent: module.sections.length ? Math.round((done / module.sections.length) * 100) : 0 } : null;
  const plan = subscription ? getLearningSubscriptionPlan(subscription.planKey) : undefined;
  const access = subscription && plan ? { name: plan.name, endsAt: subscription.endsAt.toISOString(), active: subscription.endsAt > new Date(), modules: plan.modules === "all" ? "all" as const : plan.modules.length } : null;
  return <><CabinetTitle section="learning" /><ProfileHero name={user.name} email={user.email} rewardPoints={account?.rewardPoints ?? 0} practice={practice} resume={resume} access={access} /></>;
}
