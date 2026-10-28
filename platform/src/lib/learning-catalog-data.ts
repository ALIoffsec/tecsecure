import type { LearningModule } from "@/lib/learning-demo";
import type { LearningModulePreview } from "@/lib/learning-catalog-types";
import { modulePriceTec, sectionPriceTec } from "@/lib/learning-pricing";

export function toLearningModulePreview(module: LearningModule): LearningModulePreview {
  const sectionPricesTec = module.sections.map((_, index) => sectionPriceTec(module, index));
  return {
    slug: module.slug,
    title: module.title,
    summary: module.summary,
    difficulty: module.difficulty,
    category: module.category,
    hours: module.hours,
    hasLab: module.hasLab,
    labPlan: module.labPlan,
    references: module.references,
    sections: module.sections.map(({ title, terminalPractice, interactivePractice }) => ({
      title,
      requiresPractice: Boolean(terminalPractice?.tasks.length || interactivePractice?.tasks.length)
    })),
    sectionPricesTec,
    individualPriceTec: sectionPricesTec.reduce((total, price) => total + price, 0),
    modulePriceTec: modulePriceTec(module)
  };
}
