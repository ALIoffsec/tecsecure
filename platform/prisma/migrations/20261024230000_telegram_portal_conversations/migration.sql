ALTER TABLE "User"
ADD COLUMN "telegramChatId" TEXT,
ADD COLUMN "telegramLinkToken" TEXT,
ADD COLUMN "telegramLinkExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_telegramChatId_key" ON "User"("telegramChatId");
CREATE UNIQUE INDEX "User_telegramLinkToken_key" ON "User"("telegramLinkToken");

ALTER TABLE "Project" ADD COLUMN "reference" TEXT;
UPDATE "Project" SET "reference" = 'PRJ-OLD-' || "id" WHERE "reference" IS NULL;
ALTER TABLE "Project" ALTER COLUMN "reference" SET NOT NULL;
CREATE UNIQUE INDEX "Project_reference_key" ON "Project"("reference");

CREATE TABLE "PortalConversation" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PortalConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PortalMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PortalMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TelegramUpdate" (
    "updateId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TelegramUpdate_pkey" PRIMARY KEY ("updateId")
);

CREATE UNIQUE INDEX "PortalConversation_reference_key" ON "PortalConversation"("reference");
CREATE UNIQUE INDEX "PortalConversation_sourceType_sourceId_key" ON "PortalConversation"("sourceType", "sourceId");
CREATE INDEX "PortalConversation_customerId_createdAt_idx" ON "PortalConversation"("customerId", "createdAt");
CREATE INDEX "PortalConversation_category_createdAt_idx" ON "PortalConversation"("category", "createdAt");
CREATE INDEX "PortalMessage_conversationId_createdAt_idx" ON "PortalMessage"("conversationId", "createdAt");

ALTER TABLE "PortalConversation"
ADD CONSTRAINT "PortalConversation_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PortalMessage"
ADD CONSTRAINT "PortalMessage_conversationId_fkey"
FOREIGN KEY ("conversationId") REFERENCES "PortalConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
