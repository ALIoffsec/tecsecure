import { getCurrentUser } from "@/lib/auth";
import { supplementalLessonExamples } from "@/lib/learning-demo";
import { getLearningModule } from "@/lib/learning-content";
import { firewallZeroToHeroDetails } from "@/lib/firewall-zero-to-hero-content";
import { firewallKerioTerminalExamples } from "@/lib/firewall-kerio-terminal-examples";
import { kerioControlDetails } from "@/lib/kerio-control-content";
import { linuxFundamentalsDetails } from "@/lib/linux-fundamentals-content";
import { learningSpecialistDetails } from "@/lib/learning-specialist-content";
import { learningTeachingVisuals } from "@/lib/learning-teaching-visuals";
import { careerTeachingVisuals } from "@/lib/learning-teaching-visuals-career";
import { getLearningSectionQuestion } from "@/lib/learning-completion";
import { networkFundamentalsDetails } from "@/lib/network-fundamentals-content";
import { sectionPriceTec } from "@/lib/learning-pricing";
import { isPreviewMode } from "@/lib/preview-mode";
import { prisma } from "@/lib/prisma";
import { hasLearningModuleAccess } from "@/lib/learning-subscriptions";

export const runtime = "nodejs";

const extendedLessons: Record<string, Record<number, string>> = {
  "network-fundamentals": networkFundamentalsDetails,
  "firewall-zero-to-hero": firewallZeroToHeroDetails,
  "kerio-control-zero-to-hero": kerioControlDetails,
  "linux-fundamentals": linuxFundamentalsDetails,
  ...learningSpecialistDetails
};

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; index: string }> }) {
  const { slug, index: rawIndex } = await params;
  const module = await getLearningModule(slug);
  const index = Number(rawIndex);
  if (!module || !Number.isInteger(index) || index < 0 || index >= module.sections.length) {
    return Response.json({ error: "O‘quv bo‘limi topilmadi." }, { status: 404 });
  }
  if (sectionPriceTec(module, index) > 0) {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Bu materialni ko‘rish uchun avval TEC bilan oching." }, { status: 401 });
    if (isPreviewMode) return Response.json({ error: "TEC bilan ochilgan materiallar hozircha mavjud emas." }, { status: 503 });
    if (!await hasLearningModuleAccess(prisma, user.id, module, index)) {
      return Response.json({ error: "Bu bo‘lim hali ochilmagan." }, { status: 403 });
    }
  }

  const section = module.sections[index];
  const terminalExample = firewallKerioTerminalExamples[module.slug]?.[index];
  const supplementalExample = supplementalLessonExamples[module.slug]?.[index];
  const question = getLearningSectionQuestion(module, index);
  if (!question) return Response.json({ error: "Bu dars uchun bilim tekshiruvi tayyorlanmagan." }, { status: 409 });
  return Response.json({
    lesson: {
      ...section,
      expandedContent: extendedLessons[module.slug]?.[index],
      diagram: section.diagram ?? learningTeachingVisuals[module.slug]?.[index] ?? careerTeachingVisuals[module.slug]?.[index],
      question: { prompt: question.prompt, options: question.options },
      example: section.example ?? terminalExample?.code ?? supplementalExample?.code,
      exampleExplanation: section.exampleExplanation ?? terminalExample?.explanation ?? supplementalExample?.explanation
    }
  }, {
    headers: { "Cache-Control": "private, no-store" }
  });
}
