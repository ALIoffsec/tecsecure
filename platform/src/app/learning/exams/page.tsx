import { LearningCatalog } from "@/components/learning-catalog";
import { getPublishedLearningDocuments } from "@/lib/learning-content";

export const dynamic = "force-dynamic";

export default async function LearningExamsPage() {
  const exams = await getPublishedLearningDocuments("exam");
  return (
    <LearningCatalog
      exams={exams.map((exam) => ({
        slug: exam.slug,
        title: exam.title,
        summary: exam.summary,
        minutes: exam.minutes,
        passPercent: exam.passPercent,
        questionCount: exam.questions.length,
        topics: exam.topics
      }))}
      section="exams"
    />
  );
}
