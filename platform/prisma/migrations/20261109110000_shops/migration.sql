-- Sellers on the marketplace. New table only; nothing existing changes.
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "phone" TEXT NOT NULL,
    "telegram" TEXT,
    "instagram" TEXT,
    "region" TEXT,
    "city" TEXT,
    "address" TEXT,
    "description" TEXT,
    "logoMediaId" TEXT,
    "legalName" TEXT,
    "tin" TEXT,
    "commissionPercent" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "referralCommissionPercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "balanceMinor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewNote" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Shop_slug_key" ON "Shop"("slug");
CREATE UNIQUE INDEX "Shop_ownerId_key" ON "Shop"("ownerId");
CREATE INDEX "Shop_status_createdAt_idx" ON "Shop"("status", "createdAt");
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
