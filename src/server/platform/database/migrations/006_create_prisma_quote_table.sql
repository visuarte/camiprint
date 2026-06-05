-- Crea la tabla "Quote" que Prisma espera (case-sensitive, camelCase)
-- Migracion para alinear Prisma ORM con la base de datos de produccion.
-- Ver: prisma/migrations/20260601184500_add_quote_model/migration.sql

CREATE TABLE IF NOT EXISTS "Quote" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "companyName" VARCHAR(255) NOT NULL,
    "quantity" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'received',
    "responded" BOOLEAN NOT NULL DEFAULT false,
    "respondedAt" TIMESTAMP(3),
    "responseNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Quote_email_idx" ON "Quote"("email");
CREATE INDEX IF NOT EXISTS "Quote_status_idx" ON "Quote"("status");
CREATE INDEX IF NOT EXISTS "Quote_createdAt_idx" ON "Quote"("createdAt");
