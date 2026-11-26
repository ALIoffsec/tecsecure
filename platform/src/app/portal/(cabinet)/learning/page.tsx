import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { isPreviewMode } from "@/lib/preview-mode";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { prisma } from "@/lib/prisma";
import { getProfilePractice } from "@/lib/learning-profile-server";
import { ProfileHero } from "@/components/profile-hero";
import { CabinetTitle } from "@/components/cabinet/sections";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Mening o‘qishim | Tecsecure" }, robots: { index: false, follow: false } };

/** The learning profile as it was in the old cabinet, until its own page is built (stage 9). */
export default async function CabinetLearningPage() {
  if (isPreviewMode) return <PreviewModeNotice />;
  const user = await requireUser("/portal/learning");
  const [account, practice] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { rewardPoints: true } }),
    getProfilePractice(user.id)
  ]);
  return <><CabinetTitle section="learning" /><ProfileHero name={user.name} email={user.email} rewardPoints={account?.rewardPoints ?? 0} practice={practice} /></>;
}
