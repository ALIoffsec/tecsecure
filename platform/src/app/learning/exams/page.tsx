import { LearningCatalog } from "@/components/learning-catalog";
import { getPublishedLearningDocuments } from "@/lib/learning-content";
import { pageMetadata } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/learning/exams",
  title: "Imtihonlar katalogi",
  description: "Tarmoq, Linux va kiberxavfsizlik bo‘yicha imtihonlar ro‘yxati: mavzulari, savollar soni va o‘tish bali bilan."
});

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
