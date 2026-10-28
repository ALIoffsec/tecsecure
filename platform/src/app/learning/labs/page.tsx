import { LearningCatalog } from "@/components/learning-catalog";
import { getPublishedLearningDocuments } from "@/lib/learning-content";

export const dynamic = "force-dynamic";

export default async function LearningLabsPage() {
  const labs = await getPublishedLearningDocuments("lab");
  return (
    <LearningCatalog
      labs={labs.map((lab) => ({
        slug: lab.slug,
        title: lab.title,
        summary: lab.summary,
        level: lab.level,
        minutes: lab.minutes,
        taskCount: lab.tasks.length
      }))}
      section="labs"
    />
  );
}
