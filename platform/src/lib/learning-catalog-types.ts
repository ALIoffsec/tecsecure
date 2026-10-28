import type { LearningModule, LearningPath, Localized } from "@/lib/learning-demo";

export type LearningModulePreview = Omit<LearningModule, "sections"> & {
  sections: { title: Localized; requiresPractice: boolean }[];
  sectionPricesTec: number[];
  individualPriceTec: number;
  modulePriceTec: number;
};

export type LearningCatalogData = {
  modules: LearningModulePreview[];
  paths: LearningPath[];
};
