import { notFound } from "next/navigation";
import { LearningModuleView } from "@/components/learning-module-view";
import { getCurrentUser } from "@/lib/auth";
import { getLearningModule } from "@/lib/learning-content";
import { toLearningModulePreview } from "@/lib/learning-catalog-data";

export default async function LearningModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [module, user] = await Promise.all([getLearningModule(slug), getCurrentUser()]);
  if (!module) notFound();
  const nickname = user?.name.trim() || user?.email.split("@")[0] || "student";
  return <LearningModuleView module={toLearningModulePreview(module)} nickname={nickname} />;
}
