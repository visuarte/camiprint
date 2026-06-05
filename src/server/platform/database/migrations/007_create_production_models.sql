-- Migración 007: Modelos de producción, técnicas y proveedores
-- Crea las tablas para el flujo completo de producción

-- Técnicas de estampación
CREATE TABLE IF NOT EXISTS printing_techniques (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    min_quantity INTEGER NOT NULL DEFAULT 1,
    max_colors INTEGER,
    lead_time_days INTEGER NOT NULL DEFAULT 5,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS printing_techniques_code_idx ON printing_techniques(code);

-- Relación producto-técnica
CREATE TABLE IF NOT EXISTS product_techniques (
    product_id TEXT NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
    technique_id TEXT NOT NULL REFERENCES printing_techniques(id) ON DELETE CASCADE,
    is_default BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (product_id, technique_id)
);

-- Direcciones de envío del cliente
CREATE TABLE IF NOT EXISTS customer_addresses (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL DEFAULT 'España',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customer_addresses_customer_id_idx ON customer_addresses(customer_id);

-- Extensiones a ProductionOrder: añadir columnas si no existen
-- Crear tabla ProductionOrder (no existía en DB, solo en schema Prisma)
CREATE TABLE IF NOT EXISTS "ProductionOrder" (
    id TEXT PRIMARY KEY,
    quote_id TEXT REFERENCES "Quote"(id),
    external_id VARCHAR(255),
    customer_id VARCHAR(255),
    status TEXT NOT NULL DEFAULT 'pending_review',
    priority INTEGER NOT NULL DEFAULT 0,
    technician_notes TEXT,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMPTZ,
    estimated_delivery_date TIMESTAMPTZ,
    actual_cost FLOAT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "ProductionOrder_status_idx" ON "ProductionOrder"(status);
CREATE INDEX IF NOT EXISTS "ProductionOrder_quote_id_idx" ON "ProductionOrder"(quote_id);

-- Crear tabla DesignAsset (no existía en DB)
CREATE TABLE IF NOT EXISTS "DesignAsset" (
    id TEXT PRIMARY KEY,
    production_order_id TEXT REFERENCES "ProductionOrder"(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    mime_type VARCHAR(255),
    size INTEGER,
    checksum_sha256 VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "DesignAsset_prod_order_idx" ON "DesignAsset"(production_order_id);

-- Crear tabla JobTicket (no existía en DB)
CREATE TABLE IF NOT EXISTS "JobTicket" (
    id TEXT PRIMARY KEY,
    production_order_id TEXT REFERENCES "ProductionOrder"(id) ON DELETE CASCADE,
    ticket_number INTEGER NOT NULL,
    department VARCHAR(100) NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    payload TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "JobTicket_prod_order_idx" ON "JobTicket"(production_order_id);

-- Crear tabla WorkQueueItem (no existía en DB)
CREATE TABLE IF NOT EXISTS "WorkQueueItem" (
    id TEXT PRIMARY KEY,
    job_ticket_id TEXT NOT NULL REFERENCES "JobTicket"(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "WorkQueueItem_job_ticket_idx" ON "WorkQueueItem"(job_ticket_id);

-- Líneas de producción
CREATE TABLE IF NOT EXISTS production_order_lines (
    id TEXT PRIMARY KEY,
    production_order_id TEXT NOT NULL REFERENCES "ProductionOrder"(id) ON DELETE CASCADE,
    source VARCHAR(20) NOT NULL,  -- 'roly', 'stamina', 'own_stock'
    product_sku VARCHAR(255) NOT NULL,
    product_name VARCHAR(255),
    quantity INTEGER NOT NULL,
    technique_id TEXT REFERENCES printing_techniques(id),
    unit_price FLOAT,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS prod_order_lines_order_id_idx ON production_order_lines(production_order_id);
CREATE INDEX IF NOT EXISTS prod_order_lines_source_idx ON production_order_lines(source);
CREATE INDEX IF NOT EXISTS prod_order_lines_technique_idx ON production_order_lines(technique_id);

-- Pedidos a proveedores externos (Roly, Stamina)
CREATE TABLE IF NOT EXISTS supplier_orders (
    id TEXT PRIMARY KEY,
    supplier VARCHAR(50) NOT NULL,
    production_order_id TEXT REFERENCES "ProductionOrder"(id),
    status TEXT NOT NULL DEFAULT 'pending',
    supplier_ref VARCHAR(255),
    total_amount FLOAT,
    notes TEXT,
    placed_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS supplier_orders_supplier_idx ON supplier_orders(supplier);
CREATE INDEX IF NOT EXISTS supplier_orders_prod_order_idx ON supplier_orders(production_order_id);
CREATE INDEX IF NOT EXISTS supplier_orders_status_idx ON supplier_orders(status);

-- Líneas de pedido a proveedor
CREATE TABLE IF NOT EXISTS supplier_order_lines (
    id TEXT PRIMARY KEY,
    supplier_order_id TEXT NOT NULL REFERENCES supplier_orders(id) ON DELETE CASCADE,
    product_sku VARCHAR(255) NOT NULL,
    product_name VARCHAR(255),
    quantity INTEGER NOT NULL,
    unit_price FLOAT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS supplier_order_lines_order_id_idx ON supplier_order_lines(supplier_order_id);

-- Extensiones a Quote (Prisma table, case-sensitive)
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS techniques TEXT;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS production_order_id TEXT;

-- Seed data: técnicas de estampación por defecto
INSERT INTO printing_techniques (id, name, code, description, min_quantity, max_colors, lead_time_days) VALUES
    ('tech_serigrafia', 'Serigrafía', 'SERIGRAFIA', 'Ideal para grandes tiradas. Colores planos con excelente durabilidad. Requiere fotolitos y pantallas por color.', 50, 6, 7),
    ('tech_bordado', 'Bordado', 'BORDADO', 'Acabado profesional para logos corporativos. Máximo detalle en prendas de vestir.', 10, NULL, 5),
    ('tech_dtf', 'DTF (Direct to Film)', 'DTF', 'Transfer directo a película. Ideal para pequeñas tiradas, full color, sin mínimo de colores.', 1, NULL, 2),
    ('tech_vinilo', 'Vinilo Textil', 'VINILO', 'Corte de vinilo para nombres, números y logos sencillos. Perfecto para personalización unitaria.', 1, 1, 1),
    ('tech_sublimacion', 'Sublimación', 'SUBLIMACION', 'Para tejido poliéster. Colores vibrantes, ideal para ropa deportiva.', 10, NULL, 3)
ON CONFLICT (code) DO NOTHING;
