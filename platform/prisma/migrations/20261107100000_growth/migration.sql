-- Additive only: no existing column changes meaning and no row is rewritten.

-- Company buyers.
ALTER TABLE "Order" ADD COLUMN "customerType" TEXT NOT NULL DEFAULT 'INDIVIDUAL';
ALTER TABLE "Order" ADD COLUMN "companyName" TEXT;
ALTER TABLE "Order" ADD COLUMN "companyTin" TEXT;

-- Project stories.
ALTER TABLE "PortfolioPost" ADD COLUMN "location" TEXT;
ALTER TABLE "PortfolioPost" ADD COLUMN "task" TEXT;
ALTER TABLE "PortfolioPost" ADD COLUMN "work" TEXT;
ALTER TABLE "PortfolioPost" ADD COLUMN "result" TEXT;
ALTER TABLE "PortfolioPost" ADD COLUMN "clientName" TEXT;
ALTER TABLE "PortfolioPost" ADD COLUMN "clientRole" TEXT;
ALTER TABLE "PortfolioPost" ADD COLUMN "clientQuote" TEXT;

-- Phone sign-in.
ALTER TABLE "User" ADD COLUMN "phoneVerifiedAt" TIMESTAMP(3);

CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OtpCode_target_purpose_createdAt_idx" ON "OtpCode"("target", "purpose", "createdAt");

-- Online card payments through Payme.
CREATE TABLE "PaymeTransaction" (
    "id" TEXT NOT NULL,
    "paymeId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amountMinor" DOUBLE PRECISION NOT NULL,
    "state" INTEGER NOT NULL DEFAULT 1,
    "reason" INTEGER,
    "paymeTime" BIGINT NOT NULL,
    "createTime" BIGINT NOT NULL,
    "performTime" BIGINT NOT NULL DEFAULT 0,
    "cancelTime" BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT "PaymeTransaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PaymeTransaction_paymeId_key" ON "PaymeTransaction"("paymeId");
CREATE INDEX "PaymeTransaction_orderId_idx" ON "PaymeTransaction"("orderId");
CREATE INDEX "PaymeTransaction_paymeTime_idx" ON "PaymeTransaction"("paymeTime");
ALTER TABLE "PaymeTransaction" ADD CONSTRAINT "PaymeTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Errors the server met, grouped so one bug is one row.
CREATE TABLE "ErrorEvent" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "path" TEXT,
    "count" INTEGER NOT NULL DEFAULT 1,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alertedAt" TIMESTAMP(3),
    CONSTRAINT "ErrorEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ErrorEvent_fingerprint_key" ON "ErrorEvent"("fingerprint");
CREATE INDEX "ErrorEvent_lastSeenAt_idx" ON "ErrorEvent"("lastSeenAt");
