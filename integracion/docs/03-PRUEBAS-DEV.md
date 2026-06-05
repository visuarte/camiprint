# Fase 2 — Resultado de pruebas contra DEV

## ✅ Prueba 1: Autenticación
- **Endpoint:** POST `/api/v1.0/login`
- **Resultado:** ✅ Éxito
- **Token:** JWT obtenido correctamente
- **Formato:** `Authorization: Bearer <token>`

## ✅ Prueba 2: Catálogo Roly
- **Endpoint:** GET `/api/v1.0/item/getcatalog?lang=es-ES&brand=roly`
- **Resultado:** ✅ Éxito — datos masivos recibidos
- **Estructura del item:** ~35 campos por artículo
- **Imágenes:** URLs de CDN estático de Gor Factory (`static.gorfactory.es`)
- **Campos clave identificados:**
  - `itemcode` — SKU único del producto-talla-color
  - `modelcode` / `modelid` / `modelname` — Modelo base
  - `itemname` — Nombre completo del producto
  - `eancode` — Código de barras
  - `description`, `composition`, `observations`
  - `familycode` / `family` — Familia (CAMISETAS, CALZADO, etc.)
  - `gendercode` / `gender` — Mujer, Hombre, Unisex, Niño
  - `sizecode` / `sizename` — Talla
  - `colorcode` / `colorname` — Color
  - `moq`, `packunits`, `boxunits`
  - `productimage`, `modelimage`, `detailsimages`, `viewsimages` — URLs múltiples
  - `brand`, `originalbrand`
  - `categories`, `categoriesids` — Ruta de categoría
  - `boxsize`, `weight`, `madein`, `taric`

## ✅ Prueba 3: Stock Roly (almacén 01)
- **Endpoint:** POST `/api/v1.0/stock/getuserstock`
- **Resultado:** ✅ Éxito — cientos de registros recibidos
- **Estructura del item de stock:**
  - `sku` — Código del artículo
  - `description` — Descripción
  - `onhand` — Stock disponible actual
  - `incoming` — Fecha de próxima entrada (yyyy-MM-dd)
  - `state` — Estado (SHIPPED, PRODUCTIONS, vacío)
  - `canteco` — Cantidad en pedido (pendiente de recibir)
  - `brand` — Marca

## Ajustes realizados en el código

Basado en la respuesta real de DEV, se actualizaron:

1. **`types.ts`** — `GorCatalogRawItem` con ~35 campos, `GorStockRawItem` con `incoming`, `state`, `canteco`
2. **`catalog.ts`** — Nuevo mapper `mapRawToCatalogItem` con conversión de tipos (strings → numbers, URLs separadas por coma → arrays)
3. **`stock.ts`** — Nuevo mapper `mapRawToStockItem` con campos `incoming`, `state`, `pendingSupply`

## Pendiente para PRO

- [ ] Verificar estructura idéntica en PRO
- [ ] Probar Stamina (brand=stamina)
- [ ] Obtener credenciales definitivas del panel
