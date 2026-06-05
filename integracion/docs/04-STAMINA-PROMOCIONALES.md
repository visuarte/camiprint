# Stamina — Regalos Promocionales (separado de Roly)

Stamina es la línea de **regalos promocionales y artículos de merchandising** de Gor Factory.
Mantenerlo separado del catálogo de camisetas (Roly) para no mezclar negocios.

## ✅ Prueba contra DEV — Exitosa

| Prueba | Resultado |
|--------|-----------|
| GET `/api/v1.0/item/getcatalog?brand=stamina` | ✅ Datos recibidos |
| Items en catálogo | **Cientos de artículos** |

## Familias de producto detectadas

| Familia | Código | Ejemplos |
|---------|--------|----------|
| 🎄 **NAVIDAD** | `XM` | Gorros navideños, calcetines, adornos, velas, imanes, sets para colorear, lápices navideños, calcetines, bidones |
| 👟 **CALZADO** | `ZS` | Chanclas (playa), zapatilleros |
| 🏖️ **VERANO** | — | Artículos de playa, chanclas |
| 🧳 **BOLSOS & VIAJE** | — | Zapatilleros, accesorios de viaje |
| 🏅 **DEPORTE** | — | Accesorios deportivos |
| 🖨️ **SUBLIMACIÓN** | — | Chanclas para sublimar |
| 🏠 **HOGAR & REGALOS** | — | Velas, decoración |
| ✏️ **ESCRITURA & OFICINA** | — | Lápices |

## Características diferenciales vs Roly

| Aspecto | Roly (Camisetas) | Stamina (Promocionales) |
|---------|-----------------|-------------------------|
| **Producto** | Textil (camisetas, polos, etc.) | Regalo promocional, decoración, accesorios |
| **Tallas** | Múltiples (XS-XXL) | Mayormente "TALLA ÚNICA ADULTO" |
| **MOQ** | Generalmente 1 unidad | Varía: 1, 5, 10, 50 uds |
| **Packaging** | Por unidad | Por pack (50, 100, 500 uds) |
| **Estacionalidad** | Todo el año | Fuerte componente navideño |
| **Público** | Tiendas de moda, personalización | Empresas, regalos corporativos, campañas |

## Estructura separada

El código ya está preparado para usarse con ambas marcas:

```typescript
// Stamina (regalos promocionales)
const staminaCatalog = await catalog.getCatalog('stamina');
const staminaStock = await stock.getUserStock({ whscode: '01', brand: 'stamina' });

// Roly (camisetas) — completamente separado
const rolyCatalog = await catalog.getCatalog('roly');
const rolyStock = await stock.getUserStock({ whscode: '01', brand: 'roly' });
```

## Endpoint de diagnóstico

```
GET /api/admin/integrations/gor-factory/diagnose?action=full&brand=stamina
GET /api/admin/integrations/gor-factory/diagnose?action=full&brand=roly
```
