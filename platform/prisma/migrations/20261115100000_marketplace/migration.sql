-- Marketplace: shops sell their own products, orders split into shop shipments, balance ledger and payouts.
-- Additive only: new nullable or defaulted columns and new tables; existing rows are untouched.
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "referralShopId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "shopId" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "moderation" TEXT NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "moderationNote" TEXT,
ADD COLUMN     "promotedUntil" TIMESTAMP(3),
ADD COLUMN     "sellerHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shopId" TEXT,
ADD COLUMN     "stockQuantity" INTEGER,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "notifyOrders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "payoutAccount" TEXT,
ADD COLUMN     "payoutBankName" TEXT,
ADD COLUMN     "payoutMfo" TEXT,
ADD COLUMN     "payoutRecipient" TEXT;

-- CreateTable
CREATE TABLE "ShopOrder" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
    "itemsTotalMinor" DOUBLE PRECISION,
    "commissionPercent" DOUBLE PRECISION NOT NULL,
    "commissionMinor" DOUBLE PRECISION,
    "deliveryShareMinor" DOUBLE PRECISION,
    "payoutMinor" DOUBLE PRECISION,
    "sellerNote" TEXT,
    "creditedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopLedgerEntry" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "amountMinor" DOUBLE PRECISION NOT NULL,
    "balanceAfterMinor" DOUBLE PRECISION NOT NULL,
    "shopOrderId" TEXT,
    "payoutId" TEXT,
    "productId" TEXT,
    "note" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopPayout" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "amountMinor" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "bankName" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "mfo" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "reviewNote" TEXT,
    "paymentReference" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShopOrder_shopId_status_createdAt_idx" ON "ShopOrder"("shopId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ShopOrder_orderId_shopId_key" ON "ShopOrder"("orderId", "shopId");

-- CreateIndex
CREATE INDEX "ShopLedgerEntry_shopId_createdAt_idx" ON "ShopLedgerEntry"("shopId", "createdAt");

-- CreateIndex
CREATE INDEX "ShopPayout_shopId_createdAt_idx" ON "ShopPayout"("shopId", "createdAt");

-- CreateIndex
CREATE INDEX "ShopPayout_status_createdAt_idx" ON "ShopPayout"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_shopId_idx" ON "OrderItem"("shopId");

-- CreateIndex
CREATE INDEX "Product_shopId_createdAt_idx" ON "Product"("shopId", "createdAt");

-- CreateIndex
CREATE INDEX "Product_moderation_createdAt_idx" ON "Product"("moderation", "createdAt");

-- CreateIndex
CREATE INDEX "Product_promotedUntil_idx" ON "Product"("promotedUntil");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopOrder" ADD CONSTRAINT "ShopOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopOrder" ADD CONSTRAINT "ShopOrder_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopLedgerEntry" ADD CONSTRAINT "ShopLedgerEntry_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopPayout" ADD CONSTRAINT "ShopPayout_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

