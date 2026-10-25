import { getCurrentUser } from "@/lib/auth";
import { getLearningModule } from "@/lib/learning-content";
import { getLearningSectionQuestion, isLearningAnswerCorrect } from "@/lib/learning-completion";
import { sectionPriceTec } from "@/lib/learning-pricing";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";
import { hasLearningModuleAccess } from "@/lib/learning-subscriptions";
import { z } from "zod";

export const runtime = "nodejs";

const answerSchema = z.object({
  moduleSlug: z.string().min(1).max(100),
  sectionIndex: z.number().int().nonnegative(),
  answer: z.string().max(500)
});

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "So‘rov JSON formatida bo‘lishi kerak." }, { status: 400 });
  }
  const parsed = answerSchema.safeParse(input);
  if (!parsed.success) return Response.json({ error: "Javob ma’lumotlarini tekshiring." }, { status: 400 });

  const module = await getLearningModule(parsed.data.moduleSlug);
  if (!module || parsed.data.sectionIndex >= module.sections.length) {
    return Response.json({ error: "O‘quv bo‘limi topilmadi." }, { status: 404 });
  }
  if (sectionPriceTec(module, parsed.data.sectionIndex) > 0) {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Bu savolga javob berish uchun darsni TEC bilan oching." }, { status: 401 });
    if (isPreviewMode) return Response.json({ error: "TEC bilan ochilgan darslar hozircha mavjud emas." }, { status: 503 });
    if (!await hasLearningModuleAccess(prisma, user.id, module, parsed.data.sectionIndex)) {
      return Response.json({ error: "Bu savolni tekshirish uchun avval darsni oching." }, { status: 403 });
    }
  }
  const question = getLearningSectionQuestion(module, parsed.data.sectionIndex);
  if (!question) return Response.json({ error: "Bu dars uchun bilim tekshiruvi tayyorlanmagan." }, { status: 409 });

  return Response.json({
    correct: isLearningAnswerCorrect(question.answers, parsed.data.answer)
  }, { headers: { "Cache-Control": "no-store" } });
}
