import type { LearningModule } from "@/lib/learning-demo";
import { learningTeachingChecks } from "@/lib/learning-teaching-visuals";

export function normalizeLearningAnswer(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

export function getLearningSectionQuestion(module: LearningModule, sectionIndex: number) {
  return module.sections[sectionIndex]?.question ?? learningTeachingChecks[module.slug]?.[sectionIndex];
}

export function isLearningAnswerCorrect(answers: string[], response: string): boolean {
  const normalized = normalizeLearningAnswer(response);
  return normalized.length > 0 && answers.some((answer) => normalizeLearningAnswer(answer) === normalized);
}
