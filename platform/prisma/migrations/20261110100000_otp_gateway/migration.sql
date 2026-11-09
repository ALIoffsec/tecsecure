-- Telegram Gateway: which request carried a code and how its delivery went. Additive only.
ALTER TABLE "OtpCode" ADD COLUMN "providerRef" TEXT;
ALTER TABLE "OtpCode" ADD COLUMN "deliveryStatus" TEXT;
CREATE INDEX "OtpCode_providerRef_idx" ON "OtpCode"("providerRef");
