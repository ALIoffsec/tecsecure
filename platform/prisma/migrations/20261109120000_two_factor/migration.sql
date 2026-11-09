-- Optional two-factor sign-in and Telegram phone checks. Additive only.
ALTER TABLE "User" ADD COLUMN "twoFactorSecret" TEXT;
ALTER TABLE "User" ADD COLUMN "twoFactorEnabledAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "twoFactorBackupCodes" JSONB;
ALTER TABLE "User" ADD COLUMN "twoFactorLastStep" INTEGER;

CREATE TABLE "PhoneVerification" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "chatId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PhoneVerification_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PhoneVerification_tokenHash_key" ON "PhoneVerification"("tokenHash");
CREATE INDEX "PhoneVerification_chatId_createdAt_idx" ON "PhoneVerification"("chatId", "createdAt");
