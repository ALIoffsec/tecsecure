import { notFound } from "next/navigation";
import { LearningModuleView } from "@/components/learning-module-view";
import { getLearningModule } from "@/lib/learning-content";
import { toLearningModulePreview } from "@/lib/learning-catalog-data";

export default async function LearningModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const module = await getLearningModule((await params).slug);
  if (!module) notFound();
  return <LearningModuleView module={toLearningModulePreview(module)} />;
}
