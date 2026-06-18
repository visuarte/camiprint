-- AlterTable
ALTER TABLE "Quote" ADD COLUMN "productionOrderId" TEXT NOT NULL;
ALTER TABLE "ProductionItem" ADD COLUMN "productionOrderId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "productionOrderId" TEXT;
ALTER TABLE "Order" ADD COLUMN "productionOrderId" TEXT;
ALTER TABLE "ProductionTicket" ADD COLUMN "productionOrderId" TEXT;
ALTER TABLE "UploadedFile" ADD COLUMN "productionOrderId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Quote_productionOrderId_idx" ON "Quote"("productionOrderId");
CREATE INDEX IF NOT EXISTS "ProductionItem_productionOrderId_idx" ON "ProductionItem"("productionOrderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productionOrderId_idx" ON "OrderItem"("productionOrderId");
CREATE INDEX IF NOT EXISTS "Order_productionOrderId_idx" ON "Order"("productionOrderId");
CREATE INDEX IF NOT EXISTS "ProductionTicket_productionOrderId_idx" ON "ProductionTicket"("productionOrderId");
CREATE INDEX IF NOT EXISTS "UploadedFile_productionOrderId_idx" ON "UploadedFile"("productionOrderId");
