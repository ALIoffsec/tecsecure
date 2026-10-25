import { notFound } from "next/navigation";
import { ExamView } from "@/components/exam-view";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { requireUser } from "@/lib/auth";
import { getLearningExam, getLearningModule, getPublishedLearningDocuments } from "@/lib/learning-content";
import { examPriceFor } from "@/lib/practice-perks";
import { getActivePlanKey } from "@/lib/practice-server";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function modTitle(slug: string) {
  const title = (await getLearningModule(slug))?.title;
  return typeof title === "string" ? title : title?.uz ?? slug;
}

export default async function ExamPage({ params }: { params: Promise<{ slug: string }> }) {
  if (isPreviewMode) return <div className="container page-shell"><PreviewModeNotice /></div>;
  const { slug } = await params;
  const exam = await getLearningExam(slug);
  if (!exam) notFound();
  const [labsData, moduleTitles] = await Promise.all([
    getPublishedLearningDocuments("lab"),
    Promise.all(exam.requiredModules.map(async (moduleSlug) => [moduleSlug, await modTitle(moduleSlug)] as const))
  ]);
  const user = await requireUser();
  const now = new Date();
  const [account, planKey, modules, labs, open, certificate] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { rewardPoints: true } }),
    getActivePlanKey(user.id),
    prisma.learningModuleCompletion.findMany({ where: { userId: user.id, moduleSlug: { in: exam.requiredModules } }, select: { moduleSlug: true } }),
    prisma.learningLabCompletion.findMany({ where: { userId: user.id, labSlug: { in: exam.requiredLabs } }, select: { labSlug: true } }),
    prisma.learningExamAttempt.findFirst({ where: { userId: user.id, examSlug: exam.slug, submittedAt: null, deadlineAt: { gt: now } }, select: { id: true } }),
    prisma.learningCertificate.findUnique({ where: { userId_examSlug: { userId: user.id, examSlug: exam.slug } }, select: { code: true } })
  ]);
  return <ExamView
    exam={{ slug: exam.slug, title: exam.title, summary: exam.summary, minutes: exam.minutes, passPercent: exam.passPercent, questionCount: exam.questions.length, topics: exam.topics }}
    price={examPriceFor(planKey, exam.feeTec)}
    listPrice={exam.feeTec}
    tecBalance={account?.rewardPoints ?? 0}
    modules={exam.requiredModules.map((item) => ({ slug: item, title: moduleTitles.find(([slug]) => slug === item)?.[1] ?? item, done: modules.some((row) => row.moduleSlug === item) }))}
    labs={exam.requiredLabs.map((item) => ({ slug: item, title: labsData.find((lab) => lab.slug === item)?.title ?? item, done: labs.some((row) => row.labSlug === item) }))}
    hasOpenAttempt={Boolean(open)}
    certificateCode={certificate?.code ?? null}
  />;
}
