import { notFound } from "next/navigation";
import { ExamView } from "@/components/exam-view";
import { PreviewModeNotice } from "@/components/preview-mode-notice";
import { requireUser } from "@/lib/auth";
import { getModule } from "@/lib/learning-demo";
import { getExam } from "@/lib/learning-exams";
import { learningLabs } from "@/lib/learning-labs";
import { examPriceFor } from "@/lib/practice-perks";
import { getActivePlanKey } from "@/lib/practice-server";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function modTitle(slug: string) {
  const title = getModule(slug)?.title;
  return typeof title === "string" ? title : title?.uz ?? slug;
}

export default async function ExamPage({ params }: { params: Promise<{ slug: string }> }) {
  if (isPreviewMode) return <div className="container page-shell"><PreviewModeNotice /></div>;
  const { slug } = await params;
  const exam = getExam(slug);
  if (!exam) notFound();
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
    modules={exam.requiredModules.map((item) => ({ slug: item, title: modTitle(item), done: modules.some((row) => row.moduleSlug === item) }))}
    labs={exam.requiredLabs.map((item) => ({ slug: item, title: learningLabs.find((lab) => lab.slug === item)?.title ?? item, done: labs.some((row) => row.labSlug === item) }))}
    hasOpenAttempt={Boolean(open)}
    certificateCode={certificate?.code ?? null}
  />;
}
