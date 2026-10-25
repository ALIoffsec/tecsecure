import { Prisma } from "@prisma/client";
import { z } from "zod";
import { toPublicQuestions } from "@/lib/learning-exams";
import { getLearningExam } from "@/lib/learning-content";
import { examPriceFor } from "@/lib/practice-perks";
import { getActivePlanKey, readJson, requirePracticeUser } from "@/lib/practice-server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({ slug: z.string().min(1).max(100) });

export async function POST(request: Request) {
  const auth = await requirePracticeUser();
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return Response.json({ error: "So‘rovni tekshiring." }, { status: 400 });
  const exam = await getLearningExam(parsed.data.slug);
  if (!exam) return Response.json({ error: "Imtihon topilmadi." }, { status: 404 });
  const userId = auth.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const open = await tx.learningExamAttempt.findFirst({
        where: { userId, examSlug: exam.slug, submittedAt: null, deadlineAt: { gt: now } },
        orderBy: { startedAt: "desc" }
      });
      const balance = async () => (await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { rewardPoints: true } })).rewardPoints;
      if (open) return { attemptId: open.id, deadlineAt: open.deadlineAt, charged: 0, resumed: true, tecBalance: await balance() };

      const [modules, labs] = await Promise.all([
        tx.learningModuleCompletion.findMany({ where: { userId, moduleSlug: { in: exam.requiredModules } }, select: { moduleSlug: true } }),
        tx.learningLabCompletion.findMany({ where: { userId, labSlug: { in: exam.requiredLabs } }, select: { labSlug: true } })
      ]);
      const missingModules = exam.requiredModules.filter((slug) => !modules.some((item) => item.moduleSlug === slug));
      const missingLabs = exam.requiredLabs.filter((slug) => !labs.some((item) => item.labSlug === slug));
      if (missingModules.length || missingLabs.length) throw new PrerequisiteError(missingModules, missingLabs);

      const price = examPriceFor(await getActivePlanKey(userId), exam.feeTec);
      if (price > 0) {
        const debit = await tx.user.updateMany({ where: { id: userId, rewardPoints: { gte: price } }, data: { rewardPoints: { decrement: price } } });
        if (debit.count !== 1) throw new Error("TEC_BALANCE_TOO_LOW");
      }
      const attempt = await tx.learningExamAttempt.create({
        data: { userId, examSlug: exam.slug, feeTec: price, deadlineAt: new Date(now.getTime() + exam.minutes * 60_000) }
      });
      await tx.auditLog.create({ data: { actorId: userId, action: "LEARNING_EXAM_STARTED", entity: "LearningExamAttempt", entityId: attempt.id } });
      return { attemptId: attempt.id, deadlineAt: attempt.deadlineAt, charged: price, resumed: false, tecBalance: await balance() };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return Response.json({ ...result, questions: toPublicQuestions(exam) });
  } catch (error) {
    if (error instanceof PrerequisiteError) {
      return Response.json({ error: "Imtihon shartlari bajarilmagan.", missingModules: error.modules, missingLabs: error.labs }, { status: 403 });
    }
    if (error instanceof Error && error.message === "TEC_BALANCE_TOO_LOW") {
      return Response.json({ error: "TEC balansingiz yetarli emas." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return Response.json({ error: "Holat yangilandi. Qayta urinib ko‘ring." }, { status: 409 });
    }
    console.error("Exam start failed", error);
    return Response.json({ error: "Imtihonni boshlab bo‘lmadi." }, { status: 500 });
  }
}

class PrerequisiteError extends Error {
  constructor(readonly modules: string[], readonly labs: string[]) {
    super("EXAM_PREREQUISITES");
  }
}
