ALTER TYPE "UserRole" ADD VALUE 'FOUNDER';

ALTER TABLE "User" ADD COLUMN "permissions" JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE "Session" ADD COLUMN "adminAccessHash" TEXT;

CREATE UNIQUE INDEX "Session_adminAccessHash_key" ON "Session"("adminAccessHash");
