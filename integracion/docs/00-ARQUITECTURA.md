# Integración Gor Factory — Arquitectura

## Visión General

Integración B2B con **Gor Factory** (marcas **Roly** y **Stamina**) para sincronización de catálogo,
consulta de stock, gestión de pedidos y documentos (facturas, albaranes, etc.).

## Endpoints Identificados (API v1.0)

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1.0/login` | Login (formdata: username, password) → devuelve token |

### Catálogo (Item)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1.0/item/get?itemcode=X&lang=es-ES` | Detalle de un artículo |
| GET | `/api/v1.0/item/getcatalog?lang=es-ES&brand=roly` | Catálogo completo por marca |
| POST | `/api/v1.0/item/pricelist` | Lista de precios con filtros |
| GET | `/api/v1.0/item/categories?lang=es-ES&brand=roly` | Categorías planas |
| GET | `/api/v1.0/item/categories/tree?lang=es-ES&brand=roly` | Árbol de categorías |
| GET | `/api/v1.0/item/categories/get?lang=es-ES&brand=roly` | Obtener categoría |

### Stock
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1.0/stock/getuserstock` | Stock del usuario (formdata: whscode, brand) |
| PUT | `/api/v1.0/stock/consignment` | Actualizar stock en consigna (JSON) |

### Pedidos (Order)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1.0/order` | Crear pedido (JSON) |

### Documentos (Doc)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1.0/doc/getall` | Listar documentos (formdata) |
| POST | `/api/v1.0/doc/get` | Obtener documento (formdata) |
| POST | `/api/v1.0/doc/print` | Imprimir documento (formdata) |

### Versión
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1.0/version` | Versión API |
| GET | `/api/v1.1/version` | Versión API 1.1 |
| GET | `/api/v2.0/version` | Versión API 2.0 |

## Entornos

| Entorno | URL Base | Puerto |
|---------|----------|--------|
| **DEV** | `https://devclientsws.gorfactory.es` | `2096` |
| **PRO** | `https://clientsws.gorfactory.es` | `2096` |

## Autenticación

1. **Login:** POST formdata con `username` + `password` → devuelve un **token**.
2. **Requests subsiguientes:** El token se envía como `Authorization: Bearer <token>` en el header.

## Datos críticos faltantes (a confirmar)

- [ ] **Credenciales PRO** (usuario/contraseña) — actualmente solo tenemos las DEV de prueba
- [ ] Tiempo de expiración del token
- [ ] Códigos de almacén (`whscode`) disponibles para nuestro usuario en PRO
- [ ] Formato exacto de respuesta del login (campo del token)
- [ ] Rate limits de la API

## Marcas disponibles

- `roly` — Roly
- `stamina` — Stamina
- `roly_stamina` — Ambas

## Arquitectura del Código

```
src/server/integrations/gor-factory/
├── client.ts              # Cliente HTTP base (auth, retry, logging)
├── types.ts               # Interfaces y tipos
├── auth.ts                # Módulo de autenticación (login, token storage)
├── catalog.ts             # Sincronización de catálogo (items, categorías, precios)
├── stock.ts               # Consulta y actualización de stock
├── orders.ts              # Creación y consulta de pedidos
├── documents.ts           # Consulta de documentos (facturas, albaranes)
└── sync-engine.ts         # Orchestrador: sincronización completa
```

## Proceso de Sincronización

1. **Auth** → Login con credenciales → obtiene token (con cache)
2. **Catalog Sync** → Obtiene catálogo por marca → mapea a modelo local
3. **Stock Sync** → Obtiene stock disponible por almacén
4. **Price Sync** → Obtiene lista de precios actualizada
5. **Order Push** → Envía pedidos locales a Gor Factory
6. **Doc Pull** → Consulta documentos (pedidos confirmados, albaranes)

## Seguridad

- Token almacenado en memoria (no persistir en DB)
- Las credenciales van en variables de entorno: `GOR_USERNAME`, `GOR_PASSWORD`
- Endpoints expuestos internamente vía API routes de Next.js (protegidas con admin auth)

## Pendientes (24h)

- [ ] Activar plugin en plataforma → esperar 24h para que aparezca "Conecta tu tienda"
- [ ] Obtener credenciales PRO definitivas desde el panel
- [ ] Probar login contra PRO
- [ ] Primera sincronización de catálogo Roly + Stamina
