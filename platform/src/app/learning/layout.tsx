import { LearningCatalogLayout } from "@/components/learning-catalog-layout";

export default function LearningLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <LearningCatalogLayout>{children}</LearningCatalogLayout>;
}
