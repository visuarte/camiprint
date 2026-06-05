# Fase 1 — Diagnóstico de la API Gor Factory

## Resumen del análisis

### Autenticación
- **Método:** POST formdata a `/api/v1.0/login` con `username` + `password`
- **Respuesta esperada:** JSON con un campo `token`
- **Uso:** `Authorization: Bearer <token>` en adelante
- ⚠️ **Dato faltante:** Se desconoce el tiempo de expiración del token. El cliente implementa reintento automático en 401.

### Catálogo — Endpoints verificados
| Endpoint | Método | ¿Requiere token? | Estado |
|----------|--------|-----------------|--------|
| `/api/v1.0/item/getcatalog` | GET | Sí | ✅ Documentado |
| `/api/v1.0/item/get` | GET | Sí | ✅ Documentado |
| `/api/v1.0/item/pricelist` | POST | Sí | ✅ Documentado |
| `/api/v1.0/item/categories` | GET | Sí | ✅ Documentado |
| `/api/v1.0/item/categories/tree` | GET | Sí | ✅ Documentado |
| `/api/v1.0/item/categories/get` | GET | Sí | ✅ Documentado |

### Stock — Endpoints verificados
| Endpoint | Método | ¿Requiere token? | Estado |
|----------|--------|-----------------|--------|
| `/api/v1.0/stock/getuserstock` | POST | Sí | ✅ Documentado |
| `/api/v1.0/stock/consignment` | PUT | Sí | ✅ Documentado |

### Pedidos — Endpoints verificados
| Endpoint | Método | ¿Requiere token? | Payload | Estado |
|----------|--------|-----------------|---------|--------|
| `/api/v1.0/order` | POST | Sí | JSON con deliveryaddress, reference, comments, lines | ✅ Documentado |

### Documentos — Endpoints verificados
| Endpoint | Método | ¿Requiere token? | Estado |
|----------|--------|-----------------|--------|
| `/api/v1.0/doc/getall` | POST | Sí | ✅ Documentado |
| `/api/v1.0/doc/get` | POST | Sí | ✅ Documentado |
| `/api/v1.0/doc/print` | POST | Sí | ✅ Documentado |

## Datos críticos que faltan

| # | Dato | Dónde obtenerlo |
|---|------|-----------------|
| 1 | **Credenciales PRO** (usuario/contraseña) | Panel "Conecta tu tienda" (disponible en ~24h) |
| 2 | **Código de almacén (`whscode`)** en PRO | Documentación / Panel |
| 3 | **Expiración del token** | Pendiente de probar |
| 4 | **Rate limits** | No documentados en Postman |
| 5 | **Estructura exacta de respuesta** de catálogo/stock | Ver con llamada real a DEV |

## Riesgos identificados

- 🟡 **Puerto 2096 no estándar** — Verificar que el hosting (Vercel) no bloquee conexiones a puertos no estándar
- 🟡 **Formdata vs JSON** — Algunos endpoints usan formdata, otros JSON raw
- 🟢 **Separación DEV/PRO** — Bien definida, facilita pruebas

## Flujo de integración recomendado

```
1. Login (obtener token) ─────────────────────┐
                                               │
2. Sincronizar catálogo (Roly + Stamina)       │
   ├── Categorías                              │
   ├── Items                                  │
   └── Precios                                 │
                                               │
3. Sincronizar stock                           │
   ├── Consultar stock disponible              │
   └── Actualizar consigna (opcional)          │
                                               │
4. Gestión de pedidos                          │
   ├── Crear pedido → Gor Factory             │
   └── Consultar documentos (albarán, factura) │
                                               │
5. Webhook / Polling (futuro)                  │
   └── Estado de pedidos                       │
```

## Estructura de código implementada

```
src/server/integrations/gor-factory/
├── types.ts              # Interfaces y tipos
├── client.ts             # Cliente HTTP con auth y retry
├── catalog.ts            # Catálogo (items, categorías, precios)
├── stock.ts              # Stock (consulta, consigna)
├── orders.ts             # Pedidos (creación)
├── documents.ts          # Documentos (facturas, albaranes)
├── factory.ts            # Factory / DI
└── sync-engine.ts        # Orquestador de sincronización
```
