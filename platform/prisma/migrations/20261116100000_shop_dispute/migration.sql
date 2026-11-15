-- A buyer can say a shop part went wrong; its money waits until staff decide.
ALTER TABLE "ShopOrder" ADD COLUMN "disputedAt" TIMESTAMP(3),
ADD COLUMN "disputeNote" TEXT,
ADD COLUMN "disputeResolution" TEXT,
ADD COLUMN "disputeResolvedAt" TIMESTAMP(3);
