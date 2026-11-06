-- Int (32-bit) capped prices at about 21.4M UZS and overflowed order totals.
-- DOUBLE PRECISION holds whole minor units exactly up to 2^53. The API only accepts
-- integers and caps prices and totals below that limit, so no rounding can occur.
ALTER TABLE "Product" ALTER COLUMN "priceMinor" TYPE DOUBLE PRECISION;
ALTER TABLE "Order" ALTER COLUMN "totalMinor" TYPE DOUBLE PRECISION;
ALTER TABLE "OrderItem" ALTER COLUMN "unitPriceMinor" TYPE DOUBLE PRECISION;

-- Payment proofs must not be publicly readable.
ALTER TABLE "MediaAsset" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN "private" BOOLEAN NOT NULL DEFAULT false;
UPDATE "MediaAsset" AS asset
SET "private" = true, "ownerId" = wallet."userId"
FROM "WalletTransaction" AS wallet
WHERE wallet."proofMediaId" = asset."id";
