import { PracticeHub } from "@/components/practice-hub";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { requireUser } from "@/lib/auth";
import { learningExams } from "@/lib/learning-exams";
import { learningLabs } from "@/lib/learning-labs";
import { getModule } from "@/lib/learning-demo";
import { getActivePlanKey } from "@/lib/practice-server";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function modTitle(slug: string) {
  const title = getModule(slug)?.title;
  return typeof title === "string" ? title : title?.uz ?? slug;
}

export default async function PracticePage() {
  if (isPreviewMode) return <div className="container page-shell"><PreviewModeNotice /></div>;
  const user = await requireUser();
  const [account, planKey, labPurchases, labCompletions, labTasks, moduleDone, attempts, certificates] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { rewardPoints: true } }),
    getActivePlanKey(user.id),
    prisma.learningPurchase.findMany({ where: { userId: user.id, purchaseKey: { startsWith: "lab:" } }, select: { purchaseKey: true } }),
    prisma.learningLabCompletion.findMany({ where: { userId: user.id }, select: { labSlug: true } }),
    prisma.learningLabTask.groupBy({ by: ["labSlug"], where: { userId: user.id }, _count: { _all: true } }),
    prisma.learningModuleCompletion.findMany({ where: { userId: user.id }, select: { moduleSlug: true } }),
    prisma.learningExamAttempt.findMany({ where: { userId: user.id, submittedAt: { not: null } }, select: { examSlug: true, scorePercent: true, passed: true } }),
    prisma.learningCertificate.findMany({ where: { userId: user.id }, select: { code: true, examSlug: true, scorePercent: true, issuedAt: true } })
  ]);
  const unlocked = new Set(labPurchases.map((item) => item.purchaseKey.slice(4)));
  const completed = new Set(labCompletions.map((item) => item.labSlug));
  const solved = Object.fromEntries(labTasks.map((item) => [item.labSlug, item._count._all]));
  const doneModules = new Set(moduleDone.map((item) => item.moduleSlug));
  return <PracticeHub
    tecBalance={account?.rewardPoints ?? 0}
    planKey={planKey}
    labs={learningLabs.map((lab) => ({
      slug: lab.slug, title: lab.title, summary: lab.summary, level: lab.level, minutes: lab.minutes, priceTec: lab.priceTec,
      taskCount: lab.tasks.length, solved: solved[lab.slug] ?? 0, unlocked: unlocked.has(lab.slug), completed: completed.has(lab.slug)
    }))}
    exams={learningExams.map((exam) => ({
      slug: exam.slug, title: exam.title, summary: exam.summary, feeTec: exam.feeTec, minutes: exam.minutes, passPercent: exam.passPercent,
      questionCount: exam.questions.length, topics: exam.topics,
      modules: exam.requiredModules.map((slug) => ({ slug, title: modTitle(slug), done: doneModules.has(slug) })),
      labs: exam.requiredLabs.map((slug) => ({ slug, title: learningLabs.find((lab) => lab.slug === slug)?.title ?? slug, done: completed.has(slug) })),
      bestScore: attempts.filter((item) => item.examSlug === exam.slug).reduce((max, item) => Math.max(max, item.scorePercent ?? 0), 0),
      passed: attempts.some((item) => item.examSlug === exam.slug && item.passed)
    }))}
    certificates={certificates.map((item) => ({
      code: item.code, title: learningExams.find((exam) => exam.slug === item.examSlug)?.title ?? item.examSlug,
      scorePercent: item.scorePercent, issuedAt: item.issuedAt.toISOString()
    }))}
  />;
}
