import type { LearningModule } from "@/lib/learning-demo";

export const freeLearningModules = new Set([
  "linux-fundamentals",
  "intro-cybersecurity"
]);

const difficultyPrice: Record<LearningModule["difficulty"], number> = {
  fundamental: 5,
  easy: 7,
  medium: 10,
  hard: 13
};

export function sectionPriceTec(module: LearningModule, sectionIndex: number): number {
  const section = module.sections[sectionIndex];
  if (!section) throw new RangeError(`Section ${sectionIndex} does not exist in ${module.slug}.`);
  if (freeLearningModules.has(module.slug)) return 0;
  if (module.slug === "network-fundamentals" && sectionIndex < 2) return 0;
  if (sectionIndex === 0) return 0;

  const words = (section.content?.uz ?? "").trim().split(/\s+/).filter(Boolean).length;
  const teachingFeatures = Number(Boolean(section.example))
    + Number(Boolean(section.question))
    + Number(Boolean(section.diagram)) * 2
    + Number(Boolean(section.images?.length)) * 2;
  return difficultyPrice[module.difficulty] + Math.floor(Math.max(0, words - 120) / 350) + teachingFeatures;
}

export function modulePriceTec(module: LearningModule): number {
  const individualTotal = module.sections.reduce((total, _, index) => total + sectionPriceTec(module, index), 0);
  if (individualTotal === 0) return 0;
  return Math.max(1, Math.ceil(individualTotal * 0.8));
}

export function sectionPurchaseKey(moduleSlug: string, sectionIndex: number | null): string {
  return sectionIndex === null ? `${moduleSlug}:module` : `${moduleSlug}:section:${sectionIndex}`;
}
