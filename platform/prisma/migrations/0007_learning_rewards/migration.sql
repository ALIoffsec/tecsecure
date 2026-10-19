CREATE TABLE "LearningProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleSlug" TEXT NOT NULL,
    "sectionIndex" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LearningModuleCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleSlug" TEXT NOT NULL,
    "rewardTec" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningModuleCompletion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LearningProgress_userId_moduleSlug_sectionIndex_key" ON "LearningProgress"("userId", "moduleSlug", "sectionIndex");
CREATE INDEX "LearningProgress_userId_moduleSlug_idx" ON "LearningProgress"("userId", "moduleSlug");
CREATE UNIQUE INDEX "LearningModuleCompletion_userId_moduleSlug_key" ON "LearningModuleCompletion"("userId", "moduleSlug");
CREATE INDEX "LearningModuleCompletion_userId_completedAt_idx" ON "LearningModuleCompletion"("userId", "completedAt");

ALTER TABLE "LearningProgress" ADD CONSTRAINT "LearningProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearningModuleCompletion" ADD CONSTRAINT "LearningModuleCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
