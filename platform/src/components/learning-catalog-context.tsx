"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { LearningCatalogData } from "@/lib/learning-catalog-types";

const LearningCatalogContext = createContext<LearningCatalogData | null>(null);

export function LearningCatalogProvider({ children, data }: { children: ReactNode; data: LearningCatalogData }) {
  return <LearningCatalogContext.Provider value={data}>{children}</LearningCatalogContext.Provider>;
}

export function useLearningCatalog(): LearningCatalogData {
  const catalog = useContext(LearningCatalogContext);
  if (!catalog) throw new Error("LearningCatalogProvider is missing from the application layout.");
  return catalog;
}
