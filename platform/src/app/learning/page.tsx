import { LearningCatalog } from "@/components/learning-catalog";

export const dynamic = "force-dynamic";

export default async function LearningPage() {
  return <LearningCatalog section="overview" />;
}
