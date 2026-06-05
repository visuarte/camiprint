# Flujo de Producción — Camiprint

## Modelo de Negocio

```
                  ┌─────────────────────────────────┐
                  │         CLIENTE FINAL            │
                  │  (Solicita presupuesto web)      │
                  └────────────┬────────────────────┘
                               │
                               ▼
                  ┌─────────────────────────────────┐
                  │       Cotización / CRM           │
                  │  • Recibir solicitud             │
                  │  • Contactar al cliente          │
                  │  • Definir técnicas y cantidades │
                  │  • Enviar presupuesto            │
                  └────────────┬────────────────────┘
                               │
                               ▼
                  ┌─────────────────────────────────┐
                  │         PAGO CONFIRMADO          │
                  │  • Stripe / Transferencia        │
                  └────────────┬────────────────────┘
                               │
                               ▼
                  ┌─────────────────────────────────┐
                  │   REVISIÓN TÉCNICA (IMPRENTA)    │
                  │  • Técnico verifica el pedido    │
                  │  • Confirma técnicas aplicables  │
                  │  • Decide proveedores            │
                  └────────────┬────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
   ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
   │  PEDIDO ROLY     │ │ PEDIDO STAMIN│ │ TRABAJO TALL.│
   │  (Camis. vírgen) │ │ (Ya estampad)│ │ (Prod. prop.)│
   │  • Proveedor ext │ │ • Proveedor  │ │ • Stock prop.│
   │  • Llega a tall. │ │   externo    │ │              │
   │  • Se procesa    │ │ • Envío dir. │ │              │
   └────────┬─────────┘ └──────┬───────┘ └──────┬───────┘
            │                  │                │
            └──────────────────┼────────────────┘
                               │
                               ▼
                  ┌─────────────────────────────────┐
                  │    PRODUCCIÓN / ESTAMPACIÓN      │
                  │  • Serigrafía / Bordado / DTF   │
                  │  • Vinilo / Sublimación         │
                  └────────────┬────────────────────┘
                               │
                               ▼
                  ┌─────────────────────────────────┐
                  │      ENVÍO AL CLIENTE           │
                  └─────────────────────────────────┘
```

## Proveedores

| Proveedor | Rol | Productos | Tipo pedido |
|-----------|-----|-----------|-------------|
| **Roly** | Camisetas vírgenes | Blancas para estampar en taller | Llegan a taller, se procesan |
| **Stamina** | Camisetas estampadas | Ya personalizadas, listas para vender | Envío directo o a taller |
| **Taller propio** | Producción interna | Estampación personalizada | Se fabrica internamente |

## Técnicas de estampación disponibles

| Técnica | Código | Ideal para | Proveedor |
|---------|--------|------------|-----------|
| Serigrafía | `SERIGRAFIA` | Grandes tiradas, colores planos | Taller propio |
| Bordado | `BORDADO` | Logos, ropa corporativa | Taller propio |
| DTF (Direct to Film) | `DTF` | Pequeñas tiradas, full color | Taller propio |
| Vinilo textil | `VINILO` | Nombres, números, pequeños logos | Taller propio |
| Sublimación | `SUBLIMACION` | Poliéster, deportivo | Taller propio |
| Estampado directo (Stamina ready) | `ESTAMPA_DIRECTA` | Producto terminado | **Stamina** (sin proceso interno) |

## Flujo de decisión de proveedor

```
¿El producto necesita estampación personalizada?
  ├── NO → ¿Existe ya en Stamina?
  │        ├── SÍ → Pedir a Stamina (producto terminado)
  │        └── NO → Evaluar si se fabrica o se rechaza
  │
  └── SÍ → ¿Tenemos la camiseta virgen en Roly?
           ├── SÍ → Pedir Roly + Producción propia
           └── NO → Buscar alternativa o informar al cliente
```

## Datos a modelar (nuevos)

### Técnicas (`printing_techniques`)
```sql
CREATE TABLE printing_techniques (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,           -- "Serigrafía", "Bordado", etc.
  code TEXT NOT NULL UNIQUE,    -- "SERIGRAFIA", "BORDADO"
  description TEXT,
  is_active BOOLEAN DEFAULT true
);
```

### Producto-Técnica (`product_techniques`)
```sql
CREATE TABLE product_techniques (
  product_id TEXT REFERENCES products(id),
  technique_id TEXT REFERENCES printing_techniques(id),
  is_default BOOLEAN DEFAULT false,
  notes TEXT,
  PRIMARY KEY (product_id, technique_id)
);
```

### Pedido de producción (`production_orders`)
```sql
CREATE TABLE production_orders (
  id TEXT PRIMARY KEY,
  quote_id TEXT REFERENCES quotes(id),
  status TEXT NOT NULL DEFAULT 'pending_review',
    -- pending_review → approved → in_production → completed → shipped
  technician_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Líneas de producción (`production_order_lines`)
```sql
CREATE TABLE production_order_lines (
  id TEXT PRIMARY KEY,
  production_order_id TEXT REFERENCES production_orders(id),
  source TEXT NOT NULL,          -- 'roly', 'stamina', 'own_stock'
  product_sku TEXT NOT NULL,     -- SKU del producto
  quantity INTEGER NOT NULL,
  technique_id TEXT REFERENCES printing_techniques(id),
  supplier_order_ref TEXT,       -- Nº pedido en Roly/Stamina
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT
);
```

## Estado del pedido (workflow)

```
quote_received
  → quote_sent
    → payment_pending
      → payment_confirmed
        → pending_technician_review
          → technician_approved
            → splitting_orders
              → ├── roly_order_placed
              |   └── stamina_order_placed
              → in_production
                → quality_check
                  → ready_to_ship
                    → shipped
                      → delivered
```

## Lo que ya tenemos vs lo que falta

| Componente | Estado |
|------------|--------|
| Solicitud de presupuesto (Quote) | ✅ Implementado |
| Catálogo Roly (camisetas vírgenes) | ✅ Integración lista |
| Catálogo Stamina (producto terminado) | ✅ Integración lista |
| Pagos (Stripe) | ✅ Implementado |
| Envío de emails | ✅ Implementado |
| **Técnicas de estampación** | ❌ Pendiente |
| **Workflow de revisión técnica** | ❌ Pendiente |
| **División de pedidos (split)** | ❌ Pendiente |
| **Órdenes de producción** | ❌ Pendiente |
| **Pedido a proveedores (Roly/Stamina)** | ❌ Pendiente |
