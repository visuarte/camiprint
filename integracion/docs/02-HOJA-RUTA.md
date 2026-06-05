# Hoja de Ruta — Integración Gor Factory

## Fases y dependencias

### 🔵 Fase 0 — Preparación (ahora)
- [x] Analizar documentación API (Postman + PDF)
- [x] Crear estructura de código
- [x] Implementar cliente HTTP con auth
- [x] Implementar módulos: catalog, stock, orders, documents
- [x] Documentar arquitectura

### 🟡 Fase 1 — Esperar credenciales (~24h)
- [ ] Activar plugin en plataforma
- [ ] Esperar a que aparezca "Conecta tu tienda" en el área de cliente
- [ ] Generar credenciales PRO definitivas
- [ ] Configurar `GOR_USERNAME` y `GOR_PASSWORD` en Vercel (Environment Variables)

### 🟢 Fase 2 — Pruebas contra DEV
- [ ] Probar login contra DEV (credenciales actuales de prueba)
- [ ] Probar `getCatalog` con brand=roly
- [ ] Probar `getCatalog` con brand=stamina
- [ ] Probar `getUserStock` con whscode=01
- [ ] Validar estructura de respuesta real vs tipos definidos
- [ ] Ajustar tipos si es necesario

### 🟣 Fase 3 — Integración PRO
- [ ] Probar login contra PRO
- [ ] Primera sincronización completa (Roly + Stamina)
- [ ] Verificar stock real
- [ ] Crear pedido de prueba

### 🔴 Fase 4 — Pase a producción
- [ ] Endpoint interno `/api/admin/integrations/gor/sync` para trigger manual
- [ ] Programar sincronización automática (cron Vercel)
- [ ] Sincronizar imágenes de productos
- [ ] Mapear catálogo Gor → productos locales (Prisma Product)

## Variables de entorno requeridas

```bash
# Entorno (dev | pro)
GOR_ENVIRONMENT=dev

# Credenciales (las obtendrás del panel "Conecta tu tienda")
GOR_USERNAME=it09@gorfactory.es      # ← Temporal DEV
GOR_PASSWORD=Test1234                 # ← Temporal DEV
```

## Comandos útiles

```bash
# Probar login manualmente
curl -X POST https://devclientsws.gorfactory.es:2096/api/v1.0/login \
  -d "username=it09@gorfactory.es&password=Test1234"

# Probar catálogo Roly
curl https://devclientsws.gorfactory.es:2096/api/v1.0/item/getcatalog?lang=es-ES&brand=roly \
  -H "Authorization: Bearer <TOKEN>"
```
