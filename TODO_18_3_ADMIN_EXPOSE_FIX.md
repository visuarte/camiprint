# Fix requerido (18.3): Dashboard admin expuesto en producción

## Problema reportado
- URL: https://camiart.com/admin
- El feedback indica que el **Dashboard admin está accesible públicamente** (sin autenticación efectiva).

## Análisis técnico del repo
- `src/app/admin/page.tsx` es `use client` y muestra el dashboard.
- El acceso real a datos está protegido por APIs (`/api/admin/*`) con `verifyAdminToken`.
- Pero el **frontend admin** se renderiza públicamente y puede considerarse expuesto.
- Además, hay mezcla de estrategias de token:
  - `src/app/admin/auth-client.ts` usa `localStorage.getItem('admin_token')`.
  - `src/app/admin/orders/[id]/page.tsx` lee `document.cookie` con `admin_token`.

## Objetivo del fix
- Asegurar que **/admin y /admin/orders** requieran autenticación antes de renderizar cualquier contenido.
- En producción, debe redirigir a `/admin/login` si no hay sesión.

## Cambios a implementar (plan corto)
1. Agregar “gate” de autenticación en `src/app/admin/layout.tsx`:
   - Si no es `/admin/login`:
   - Validar presencia de token (idealmente cookie `admin_token`).
   - Si falta: renderizar sólo un fallback (loading) y luego redirigir a `/admin/login`.
2. (Opcional recomendado) Unificar lectura del token en frontend para usar cookie `admin_token` en vez de localStorage.
3. Confirmar que `/admin` y `/admin/orders` NO muestran contenido sin token.

## Verificación mínima (evidencia)
- Capturar C1/C2/C3/C4/C5/C6 solo como parte de la matriz 18.3 ya definida, y además:
  - Caso adicional: “Admin no autenticado redirige a login” (o dashboard muestra error sin datos).


