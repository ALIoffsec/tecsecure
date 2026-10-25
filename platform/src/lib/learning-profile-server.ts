import { computeProfile } from "@/lib/learning-profile";
import type { ProfilePractice } from "@/lib/learning-profile-types";
import { prisma } from "@/lib/prisma";
import { getPublishedLearningDocuments } from "@/lib/learning-content";

export async function getProfilePractice(userId: string): Promise<ProfilePractice> {
  const [sections, completions, labs, attempts, certificates, learningModules, learningPaths, learningLabs, learningExams] = await Promise.all([
    prisma.learningProgress.findMany({ where: { userId }, select: { moduleSlug: true, sectionIndex: true } }),
    prisma.learningModuleCompletion.findMany({ where: { userId }, select: { moduleSlug: true, rewardTec: true, completedAt: true }, orderBy: { completedAt: "desc" } }),
    prisma.learningLabCompletion.findMany({ where: { userId }, select: { labSlug: true } }),
    prisma.learningExamAttempt.findMany({ where: { userId, passed: true }, select: { examSlug: true }, distinct: ["examSlug"] }),
    prisma.learningCertificate.findMany({ where: { userId }, orderBy: { issuedAt: "desc" }, select: { code: true, examSlug: true, scorePercent: true, issuedAt: true } }),
    getPublishedLearningDocuments("module"),
    getPublishedLearningDocuments("path"),
    getPublishedLearningDocuments("lab"),
    getPublishedLearningDocuments("exam")
  ]);
  const doneKeys = new Set(sections.map((item) => `${item.moduleSlug}:${item.sectionIndex}`));
  const pathsFinished = learningPaths.filter((path) => {
    const modules = path.modules.map((slug) => learningModules.find((item) => item.slug === slug)).filter((item): item is NonNullable<typeof item> => Boolean(item));
    return modules.length > 0 && modules.every((item) => item.sections.every((_, index) => doneKeys.has(`${item.slug}:${index}`)));
  }).length;
  const profile = computeProfile({
    sections,
    modulesDone: completions.map((item) => item.moduleSlug),
    labsDone: labs.map((item) => item.labSlug),
    examsPassed: attempts.map((item) => item.examSlug),
    certificates: certificates.length,
    pathsFinished,
    catalogs: { modules: learningModules, labs: learningLabs, exams: learningExams }
  });
  return {
    profile,
    certificates: certificates.map((item) => ({
      code: item.code,
      examSlug: item.examSlug,
      title: learningExams.find((exam) => exam.slug === item.examSlug)?.title ?? item.examSlug,
      acronym: learningExams.find((exam) => exam.slug === item.examSlug)?.acronym ?? "TEC",
      accent: learningExams.find((exam) => exam.slug === item.examSlug)?.accent ?? "#3aa9ff",
      scorePercent: item.scorePercent, issuedAt: item.issuedAt.toISOString()
    })),
    progress: {
      completedSections: sections,
      completions: completions.map((item) => ({
        ...item,
        title: learningModules.find((module) => module.slug === item.moduleSlug)?.title ?? { uz: item.moduleSlug, ru: item.moduleSlug, en: item.moduleSlug },
        completedAt: item.completedAt.toISOString()
      })),
      earnedTec: completions.reduce((total, item) => total + item.rewardTec, 0),
      paths: learningPaths.map((path) => {
        const modules = path.modules.map((slug) => learningModules.find((item) => item.slug === slug)).filter((item): item is NonNullable<typeof item> => Boolean(item));
        const total = modules.reduce((sum, module) => sum + module.sections.length, 0);
        const done = modules.reduce((sum, module) => sum + module.sections.filter((_, index) => doneKeys.has(`${module.slug}:${index}`)).length, 0);
        return { slug: path.slug, title: path.title, total, done };
      })
    }
  };
}
