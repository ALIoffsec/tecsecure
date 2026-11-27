import { LearningCatalog } from "@/components/learning-catalog";
import { EarnedCertificates } from "@/components/earned-certificates";
import { getCurrentUser } from "@/lib/auth";
import { getPublishedLearningDocuments } from "@/lib/learning-content";
import { prisma } from "@/lib/prisma";
import { pageMetadata } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  path: "/learning/certifications",
  title: "Sertifikatlar va imtihonlar",
  description: "Tarmoq, Linux va kiberxavfsizlik bo‘yicha imtihonlar va ulardan olinadigan sertifikatlar."
});

/** The learner's own certificates first (when signed in), then every exam that gives one. */
export default async function LearningCertificationsPage() {
  const [user, exams] = await Promise.all([getCurrentUser(), getPublishedLearningDocuments("exam")]);
  const earned = user ? await prisma.learningCertificate.findMany({ where: { userId: user.id }, orderBy: { issuedAt: "desc" }, select: { code: true, examSlug: true, scorePercent: true, issuedAt: true } }) : [];
  return <>
    {earned.length > 0 && <EarnedCertificates certificates={earned.map(item => ({ ...item, issuedAt: item.issuedAt.toISOString(), title: exams.find(exam => exam.slug === item.examSlug)?.title ?? null }))} />}
    <LearningCatalog
      exams={exams.map((exam) => ({ slug: exam.slug, title: exam.title, summary: exam.summary, minutes: exam.minutes, passPercent: exam.passPercent, questionCount: exam.questions.length, topics: exam.topics }))}
      section="exams"
    />
  </>;
}
