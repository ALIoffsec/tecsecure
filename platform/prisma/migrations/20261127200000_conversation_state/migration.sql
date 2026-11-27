-- AlterTable
ALTER TABLE "PortalConversation" ADD COLUMN     "customerReadAt" TIMESTAMP(3),
ADD COLUMN     "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "staffReadAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'OPEN';

-- CreateIndex
CREATE INDEX "PortalConversation_status_lastMessageAt_idx" ON "PortalConversation"("status", "lastMessageAt");


-- Backfill: old conversations keep their real order, and nothing written before this release counts as unread.
UPDATE "PortalConversation" c SET "lastMessageAt" = m.last FROM (SELECT "conversationId", max("createdAt") AS last FROM "PortalMessage" GROUP BY "conversationId") m WHERE m."conversationId" = c.id;
UPDATE "PortalConversation" SET "customerReadAt" = "lastMessageAt", "staffReadAt" = "lastMessageAt";
