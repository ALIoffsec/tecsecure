import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { getModule } from "@/lib/learning-demo";
import { getLearningSectionQuestion, isLearningAnswerCorrect } from "@/lib/learning-completion";
import { moduleCompletionRewardTec } from "@/lib/learning-rewards";
import { sectionPriceTec } from "@/lib/learning-pricing";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";
import { hasLearningModuleAccess } from "@/lib/learning-subscriptions";
import { z } from "zod";

export const runtime = "nodejs";

const completionSchema = z.object({
  moduleSlug: z.string().min(1).max(100),
  sectionIndex: z.number().int().nonnegative(),
  answer: z.string().max(500).optional()
});

export async function GET() {
  if (isPreviewMode) return Response.json({ completedSections: [], completions: [], earnedTec: 0, rewardsAvailable: false });
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") {
    return Response.json({ completedSections: [], completions: [], earnedTec: 0, rewardsAvailable: false });
  }

  const [completedSections, completions] = await Promise.all([
    prisma.learningProgress.findMany({
      where: { userId: user.id },
      select: { moduleSlug: true, sectionIndex: true }
    }),
    prisma.learningModuleCompletion.findMany({
      where: { userId: user.id },
      select: { moduleSlug: true, rewardTec: true, completedAt: true },
      orderBy: { completedAt: "desc" }
    })
  ]);
  return Response.json({
    completedSections,
    completions,
    earnedTec: completions.reduce((total, item) => total + item.rewardTec, 0),
    rewardsAvailable: true
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE() {
  if (isPreviewMode) return Response.json({ error: "O‘qish progressini sinxronlash hozircha mavjud emas." }, { status: 503 });
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") return Response.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  try {
    await prisma.learningProgress.deleteMany({ where: { userId: user.id } });
    return Response.json({ cleared: true });
  } catch (error) {
    console.error("Learning progress reset failed", error);
    return Response.json({ error: "O‘qish progressini tozalab bo‘lmadi." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (isPreviewMode) return Response.json({ error: "O‘qish mukofotlari hozircha mavjud emas." }, { status: 503 });
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Mukofot olish uchun tizimga kiring." }, { status: 401 });
  if (user.role !== "CUSTOMER") return Response.json({ error: "O‘quv mukofotlari mijoz hisoblari uchun." }, { status: 403 });

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }

  const parsed = completionSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Bo‘lim ma’lumotlarini tekshiring." }, { status: 400 });

  const module = getModule(parsed.data.moduleSlug);
  if (!module || parsed.data.sectionIndex >= module.sections.length) {
    return Response.json({ error: "O‘quv bo‘limi topilmadi." }, { status: 404 });
  }
  const question = getLearningSectionQuestion(module, parsed.data.sectionIndex);
  if (!question) {
    return Response.json({ error: "Bu dars uchun bilim tekshiruvi tayyorlanmagan." }, { status: 409 });
  }
  if (!parsed.data.answer || !isLearningAnswerCorrect(question.answers, parsed.data.answer)) {
    return Response.json({ error: "Bilimni tekshirish savoliga to‘g‘ri javob bering." }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      if (sectionPriceTec(module, parsed.data.sectionIndex) > 0) {
        if (!await hasLearningModuleAccess(tx, user.id, module, parsed.data.sectionIndex)) {
          throw new Error("LEARNING_SECTION_NOT_UNLOCKED");
        }
      }

      if (parsed.data.sectionIndex > 0) {
        const completedPreviousSections = await tx.learningProgress.count({
          where: {
            userId: user.id,
            moduleSlug: module.slug,
            sectionIndex: { lt: parsed.data.sectionIndex }
          }
        });
        if (completedPreviousSections !== parsed.data.sectionIndex) {
          throw new Error("LEARNING_PREVIOUS_SECTION_INCOMPLETE");
        }
      }

      await tx.learningProgress.upsert({
        where: {
          userId_moduleSlug_sectionIndex: {
            userId: user.id,
            moduleSlug: module.slug,
            sectionIndex: parsed.data.sectionIndex
          }
        },
        create: { userId: user.id, moduleSlug: module.slug, sectionIndex: parsed.data.sectionIndex },
        update: {}
      });

      const completedCount = await tx.learningProgress.count({
        where: { userId: user.id, moduleSlug: module.slug }
      });
      const priorCompletion = await tx.learningModuleCompletion.findUnique({
        where: { userId_moduleSlug: { userId: user.id, moduleSlug: module.slug } },
        select: { rewardTec: true }
      });
      if (completedCount < module.sections.length || priorCompletion) {
        return { rewardTec: 0, moduleCompleted: Boolean(priorCompletion) };
      }

      const rewardTec = moduleCompletionRewardTec(module);
      await tx.learningModuleCompletion.create({
        data: { userId: user.id, moduleSlug: module.slug, rewardTec }
      });
      await tx.user.update({
        where: { id: user.id },
        data: { rewardPoints: { increment: rewardTec } }
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "LEARNING_MODULE_COMPLETED",
          entity: "LearningModuleCompletion",
          entityId: `${user.id}:${module.slug}`
        }
      });
      return { rewardTec, moduleCompleted: true };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return Response.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "LEARNING_SECTION_NOT_UNLOCKED") {
      return Response.json({ error: "Darsni yakunlashdan oldin uni TEC bilan oching." }, { status: 403 });
    }
    if (error instanceof Error && error.message === "LEARNING_PREVIOUS_SECTION_INCOMPLETE") {
      return Response.json({ error: "Avval modulning oldingi bo‘limlarini yakunlang." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return Response.json({ error: "Progress yangilandi. Amalni qayta urinib ko‘ring." }, { status: 409 });
    }
    console.error("Learning progress update failed", error);
    return Response.json({ error: "O‘quv progressini saqlab bo‘lmadi." }, { status: 500 });
  }
}
