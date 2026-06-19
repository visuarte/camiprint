-- CreateTable
CREATE TABLE IF NOT EXISTS "ProductPricing" (
  "id" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'gor',
  "productName" TEXT,
  "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "printingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "marginMarkup" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
  "fixedMargin" DOUBLE PRECISION,
  "publicPrice" DOUBLE PRECISION,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductPricing_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductPricing_sku_key" ON "ProductPricing"("sku");
CREATE INDEX IF NOT EXISTS "ProductPricing_source_idx" ON "ProductPricing"("source");
