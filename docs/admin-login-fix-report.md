Resumen de cambios mínimos para login admin

1) Problema detectado
- La página `/admin/login` devolvía un `<html>` y `<body>` anidados, provocando un hydration mismatch entre el `RootLayout` SSR y la versión cliente. Además, el `fetch` del login no incluía `credentials`, por lo que el `Set-Cookie` del servidor no se almacenaba.

2) Cambios aplicados (mínimos)
- Eliminado `<html>` y `<body>` anidados en `src/app/admin/login/page.tsx` (ahora devuelve solo el contenedor del formulario).
- Añadido `credentials: 'same-origin'` al `fetch` en `src/app/admin/login/page.tsx` para permitir que el navegador guarde la cookie enviada por el servidor.
- Normalizado `trim()` del token en cliente y servidor para evitar fallos por espacios en blanco.
- En `src/app/api/admin/auth/login/route.ts`: comprobación segura de `ADMIN_AUTH_TOKEN`, logging seguro de longitudes en desarrollo, respuesta 401 con longitudes en dev para debugging.
- En `src/middleware.ts`: exención explícita para `POST /api/admin/auth/login` (permite set-cookie vía login).
- Añadido endpoint de debug `GET /api/debug/admin-token` (solo activo fuera de `production`).

3) Riesgos y notas de seguridad (recomendaciones mínimas)
- `admin_token` se establece como `httpOnly` y `sameSite: 'lax'` — conservar `httpOnly` en producción. Revisar `sameSite` según arquitectura (si necesitas subdominios, ajustar).
- El cliente aún mantiene `setAdminToken()` en `localStorage` (útil en dev). Recomendación: en producción dejar que sólo la cookie `httpOnly` controle la autenticación y eliminar dependencias de `localStorage` para el admin.
- El endpoint debug debe ser eliminado o protegido antes de desplegar a producción (actualmente bloqueado en `production`).
- Asegurar que `ADMIN_AUTH_TOKEN` esté gestionado por un secreto seguro (no en VCS). Considerar usar secreto con rotación o un sistema de autenticación más robusto cuando sea necesario.
- Quitar los logs de longitudes y cualquier trazado de debug antes de producción.

4) Pasos mínimos de hardening antes de go-live
- Eliminar `GET /api/debug/admin-token` o protegerlo con ACLs.
- Verificar `secure: true` en cookies en entorno `production` y revisar `SameSite`/dominio si hay proxys.
- Migrar verificación de admin a una sesión firmada/firmas HMAC o JWT con expiración si se requiere mayor seguridad.

5) Estado actual
- Fix aplicado en `src/app/admin/login/page.tsx`, `src/app/api/admin/auth/login/route.ts`, `src/middleware.ts`.
- Login por API responde 200 en dev y crea `admin_token` cookie.

---
Archivo generado automáticamente. Si quieres, puedo generar un PR con estos cambios o revertir los cambios debug antes de desplegar.