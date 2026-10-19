CREATE TABLE "LearningPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleSlug" TEXT NOT NULL,
    "sectionIndex" INTEGER,
    "purchaseKey" TEXT NOT NULL,
    "priceTec" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningPurchase_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LearningPurchase_userId_purchaseKey_key" ON "LearningPurchase"("userId", "purchaseKey");
CREATE INDEX "LearningPurchase_userId_moduleSlug_idx" ON "LearningPurchase"("userId", "moduleSlug");
ALTER TABLE "LearningPurchase" ADD CONSTRAINT "LearningPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
