-- Additive: older orders keep null here and show "delivery agreed by phone", as before.
-- New orders are always totalled in so'm; foreign-currency items keep their list price beside the converted one.
ALTER TABLE "Order" ADD COLUMN "region" TEXT;
ALTER TABLE "Order" ADD COLUMN "deliveryMethod" TEXT;
ALTER TABLE "Order" ADD COLUMN "deliveryFeeMinor" DOUBLE PRECISION;
ALTER TABLE "Order" ADD COLUMN "itemsTotalMinor" DOUBLE PRECISION;
ALTER TABLE "Order" ADD COLUMN "vatMinor" DOUBLE PRECISION;
ALTER TABLE "Order" ADD COLUMN "exchangeRates" JSONB;
ALTER TABLE "OrderItem" ADD COLUMN "listPriceMinor" DOUBLE PRECISION;
ALTER TABLE "OrderItem" ADD COLUMN "listCurrency" TEXT;
