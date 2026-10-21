CREATE TABLE "LearningLabTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "labSlug" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "solvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningLabTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LearningLabCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "labSlug" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningLabCompletion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LearningExamAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examSlug" TEXT NOT NULL,
    "feeTec" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadlineAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "scorePercent" INTEGER,
    "passed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LearningExamAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LearningCertificate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examSlug" TEXT NOT NULL,
    "scorePercent" INTEGER NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningCertificate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LearningLabTask_userId_labSlug_taskId_key" ON "LearningLabTask"("userId", "labSlug", "taskId");
CREATE UNIQUE INDEX "LearningLabCompletion_userId_labSlug_key" ON "LearningLabCompletion"("userId", "labSlug");
CREATE INDEX "LearningExamAttempt_userId_examSlug_idx" ON "LearningExamAttempt"("userId", "examSlug");
CREATE UNIQUE INDEX "LearningCertificate_code_key" ON "LearningCertificate"("code");
CREATE UNIQUE INDEX "LearningCertificate_userId_examSlug_key" ON "LearningCertificate"("userId", "examSlug");

ALTER TABLE "LearningLabTask" ADD CONSTRAINT "LearningLabTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearningLabCompletion" ADD CONSTRAINT "LearningLabCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearningExamAttempt" ADD CONSTRAINT "LearningExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearningCertificate" ADD CONSTRAINT "LearningCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
