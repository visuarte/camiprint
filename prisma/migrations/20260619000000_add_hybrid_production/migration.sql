-- AlterTable: Add hybrid production fields to Order
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "productionSource" TEXT NOT NULL DEFAULT 'local';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "gorOrderRef" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingCarrier" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippedAt" TIMESTAMPTZ;

-- CreateIndex for production queries
CREATE INDEX IF NOT EXISTS "Order_productionSource_idx" ON "Order"("productionSource");
