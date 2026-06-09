# 🏭 Integración Gor Factory — Checklist

## ⏳ Esperando (24h desde 5-Jun-2026)

- [ ] Activar plugin en plataforma
- [ ] Aparecerá "Conecta tu tienda" en el área de cliente
- [ ] Generar **credenciales PRO** (usuario/contraseña)

## 🔧 Cuando tengas credenciales PRO

- [ ] Configurar en Vercel:
  - `GOR_USERNAME` = (tu usuario PRO)
  - `GOR_PASSWORD` = (tu contraseña PRO)
  - `GOR_ENVIRONMENT` = `pro`
- [ ] Probar login contra PRO
- [ ] Primera sincronización Roly + Stamina
- [ ] Probar workflow completo:
  ```
  Quote → Pago → Revisión técnica → Split Roly/Stamina → Pedido proveedor
  ```

## ✅ Ya implementado

- [x] Integración API Roly (camisetas vírgenes)
- [x] Integración API Stamina (regalos promocionales)
- [x] Catálogo de técnicas de estampación (5 técnicas seed)
- [x] Tablas de producción y proveedores en Supabase
- [x] Endpoint diagnóstico: `/api/admin/integrations/gor-factory/diagnose`
- [x] API técnicas: `GET/POST /api/admin/production/techniques`
- [x] API revisión técnica: `GET/POST /api/admin/production/review`
- [x] API split proveedores: `POST /api/admin/production/split`
- [x] Documentación completa en `integracion/docs/`
