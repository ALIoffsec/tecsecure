import type { LearningModule } from "@/lib/learning-demo";

const rewardByDifficulty: Record<LearningModule["difficulty"], number> = {
  fundamental: 0.75,
  easy: 1,
  medium: 1.5,
  hard: 2
};

export function moduleCompletionRewardTec(module: LearningModule): number {
  return Math.max(5, Math.round(module.sections.length * rewardByDifficulty[module.difficulty]));
}
