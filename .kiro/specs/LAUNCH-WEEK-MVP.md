# Launch Week MVP - Venta de Camisetas en 7 Días

**Duración:** 7 días (Du-Dom)  
**Equipo:** 2 devs mínimo (1 backend, 1 frontend)  
**Objetivo:** Tienda online VENDIENDO camisetas en 7 días  
**Tech Stack:** Next.js, Stripe/PayPal, PostgreSQL, Tailwind CSS

---

## 🎯 Scope Mínimo Viable

✅ **SÍ necesitas:**
- Catálogo de camisetas (3-10 modelos)
- Carrito de compras (add, remove, cantidad)
- Checkout con formulario (nombre, email, dirección)
- Integración Stripe/PayPal (procesamiento de pagos)
- Confirmación de orden + email
- Dashboard admin (ver órdenes)

❌ **NO necesitas (Phase 2+):**
- Cotizaciones
- Tickets de soporte
- Admin panel completo
- Portal de clientes
- Inventario automático
- Envíos trackeable

---

## 📅 Timeline (7 Días)

### 🔴 Day 1 (Hoy) - Infraestructura Base
**Duración:** 8 horas

**Tareas:**
- [ ] 1.1 Setup proyecto Next.js con Tailwind CSS
- [ ] 1.2 Setup base de datos PostgreSQL (Vercel Postgres o local)
- [ ] 1.3 Setup Prisma ORM + migrations
- [ ] 1.4 Modelo de datos: Product, Cart, Order, Customer

**Entregable:** Proyecto compilando, DB conectada, modelos listos

---

### 🟠 Day 2 - API Backend Órdenes
**Duración:** 8 horas

**Tareas:**
- [ ] 2.1 Crear rutas API:
  - `POST /api/orders` - crear orden
  - `GET /api/orders/:id` - obtener orden
  - `GET /api/orders/admin/list` - listar todas (auth básica)
- [ ] 2.2 Implementar validación mínima (email, dirección, cantidad)
- [ ] 2.3 Crear transacción Stripe API (crear payment intent)
- [ ] 2.4 Tests básicos para rutas

**Entregable:** API funcional para crear órdenes, Stripe conectado

---

### 🟡 Day 3 - Catálogo & Carrito
**Duración:** 8 horas

**Tareas:**
- [ ] 3.1 Seed 5-10 productos en DB (nombre, precio, imagen URL, tallas)
- [ ] 3.2 Página de catálogo (grid de camisetas)
- [ ] 3.3 Componente de carrito (context o zustand simple)
- [ ] 3.4 Página de carrito (ver items, modificar cantidad, total)
- [ ] 3.5 Botón "Comprar ahora" → checkout

**Entregable:** Se ven productos, se agregan al carrito, se ve total

---

### 🟢 Day 4 - Checkout UI
**Duración:** 8 horas

**Tareas:**
- [ ] 4.1 Página de checkout
- [ ] 4.2 Formulario: nombre, email, teléfono, dirección
- [ ] 4.3 Validación cliente-side básica
- [ ] 4.4 Integración Stripe.js (CardElement o Payment Element)
- [ ] 4.5 Botón "Pagar" llama a `/api/orders`

**Entregable:** Checkout visual, form validado, button conectado

---

### 🔵 Day 5 - Pagos & Confirmación
**Duración:** 8 horas

**Tareas:**
- [ ] 5.1 Stripe confirmación de payment (webhook local con stripe-cli)
- [ ] 5.2 Actualizar orden status en DB (pending → paid)
- [ ] 5.3 Página de confirmación (show order ID, items, total)
- [ ] 5.4 Enviar email de confirmación (SendGrid o nodemailer)
- [ ] 5.5 Error handling (payment declined, validación fallida)

**Entregable:** Se puede pagar con tarjeta de prueba, se confirma orden, email

---

### 🟣 Day 6 - Admin Dashboard & Deploy
**Duración:** 8 horas

**Tareas:**
- [ ] 6.1 Página admin simple (`/admin/orders`)
- [ ] 6.2 Auth admin básica (contraseña hardcoded o JWT simple)
- [ ] 6.3 Tabla de órdenes: cliente, monto, status, fecha
- [ ] 6.4 Filtrar por status (pending, paid, shipped)
- [ ] 6.5 Deploy a Vercel (setup env vars)
- [ ] 6.6 Configurar Stripe variables en producción

**Entregable:** Admin funcional, todo en Vercel live

---

### ⚫ Day 7 (Fin de semana) - Testing & Fine-tuning
**Duración:** 4-6 horas

**Tareas:**
- [ ] 7.1 Comprar 3-5 órdenes reales (testing con tarjeta real o test mode)
- [ ] 7.2 Verificar emails llegan
- [ ] 7.3 Verificar órdenes aparecen en admin
- [ ] 7.4 Mejorar copy, imágenes, colores
- [ ] 7.5 Test en móvil
- [ ] 7.6 Configurar DNS, SSL (Vercel automático)

**Entregable:** 🎉 TIENDA EN VIVO, VENDIENDO

---

## 📊 Task Breakdown por Tema

### Backend (Día 2-5) - 12 tareas
1. API `/api/orders` POST/GET
2. Validación órdenes
3. Stripe integration (create payment intent)
4. Stripe webhook confirmación
5. Actualizar orden status
6. Email service (SendGrid/nodemailer)
7. Admin GET `/api/orders/admin/list`
8. Error handling payloads
9. Health check `/api/health`
10. Rate limiting básico
11. Tests para órdenes
12. Deploy env vars

### Frontend (Día 1, 3-5, 7) - 14 tareas
1. Setup Next.js + Tailwind
2. Catálogo página (grid)
3. Producto card component
4. Carrito context/zustand
5. Carrito página
6. Checkout página
7. Formulario checkout
8. Validación form
9. Stripe.js integration
10. Confirmación página
11. Admin /admin/orders
12. Admin auth básica
13. Tabla órdenes
14. Mobile responsive

### DevOps (Día 1, 6) - 4 tareas
1. PostgreSQL setup (Vercel Postgres)
2. Prisma schema + migrations
3. Vercel deploy setup
4. Stripe env vars (test + prod)

---

## 🚨 Riesgos Mitigados

| Riesgo | Mitigación |
|--------|-----------|
| Pago falla | Testing manual con tarjeta test Stripe |
| DB query lenta | Simple (sin joins complejos) |
| Email no llega | Usar SendGrid (confiable) |
| Mobile rompe | Vercel preview para testing |
| Stripe sync issues | Webhook local con stripe-cli durante dev |

---

## ✅ Definición de DONE (Fin de Semana 1)

- ✅ Producto agregable al carrito
- ✅ Carrito muestra total correcto
- ✅ Checkout acepta card Stripe
- ✅ Pago procesado (amount correcto)
- ✅ Orden guardada en DB
- ✅ Email confirmación enviado
- ✅ Admin ve órdenes
- ✅ URL en producción (Vercel)
- ✅ 0 errores 5xx
- ✅ Mobil responsive

---

## 🛠️ Stack Recomendado (Sin Complicaciones)

```json
{
  "frontend": {
    "framework": "Next.js 16 (App Router)",
    "styling": "Tailwind CSS",
    "state": "Zustand (carrito)",
    "forms": "React Hook Form",
    "payments": "Stripe.js (Card Element)"
  },
  "backend": {
    "runtime": "Node.js (Next.js API routes)",
    "database": "PostgreSQL (Vercel Postgres)",
    "orm": "Prisma",
    "payments": "Stripe SDK",
    "email": "SendGrid (o nodemailer local)"
  },
  "hosting": {
    "web": "Vercel",
    "db": "Vercel Postgres",
    "dns": "Vercel / tu registrador"
  }
}
```

---

## 📝 Archivos Clave a Crear

```
src/
├── app/
│   ├── page.tsx                    # Home (redirect catálogo)
│   ├── catalog/page.tsx            # Catálogo
│   ├── cart/page.tsx               # Carrito
│   ├── checkout/page.tsx           # Checkout
│   ├── confirmation/page.tsx       # Confirmación
│   ├── admin/
│   │   ├── orders/page.tsx         # Admin órdenes
│   │   └── layout.tsx              # Auth wrapper
│   └── api/
│       ├── orders/route.ts         # POST crear orden
│       ├── orders/[id]/route.ts    # GET orden
│       ├── webhook/stripe.ts       # Webhook Stripe
│       └── health/route.ts         # Health check
├── lib/
│   ├── stripe.ts                   # Stripe client
│   ├── email.ts                    # SendGrid/nodemailer
│   └── db.ts                       # Prisma client
├── components/
│   ├── ProductCard.tsx
│   ├── CartSummary.tsx
│   ├── CheckoutForm.tsx
│   └── OrderTable.tsx
└── styles/
    └── globals.css

prisma/
├── schema.prisma                   # Models
└── migrations/

public/
└── images/
    └── products/                   # Imágenes camisetas
```

---

## 🚀 Day-by-Day Horas Estimadas

| Día | Backend | Frontend | Devops | Total | Status |
|-----|---------|----------|--------|-------|--------|
| 1   | 0h      | 3h       | 5h     | 8h    | Setup |
| 2   | 6h      | 0h       | 2h     | 8h    | API |
| 3   | 1h      | 6h       | 1h     | 8h    | Catálogo |
| 4   | 1h      | 6h       | 1h     | 8h    | Checkout |
| 5   | 5h      | 2h       | 1h     | 8h    | Pagos |
| 6   | 1h      | 4h       | 3h     | 8h    | Admin + Deploy |
| 7   | 1h      | 2h       | 0h     | 3h    | Testing |
| **TOTAL** | **15h** | **23h** | **12h** | **50h** | 🎉 |

**Team Size:** 2 devs × 5 días × 8h/día = 80h disponibles → **50h suficientes** ✅

---

## 🎬 Go Live Checklist

Antes de publicar:
- [ ] ✅ Todos los botones funcionan
- [ ] ✅ Checkout acepta pagos
- [ ] ✅ Email de confirmación llega
- [ ] ✅ Admin panel funciona
- [ ] ✅ Stripe live keys configuradas
- [ ] ✅ Domain apunta a Vercel
- [ ] ✅ SSL activo
- [ ] ✅ Probado en móvil
- [ ] ✅ Probado en 3 navegadores (Chrome, Safari, Firefox)

---

## 💡 Después de Week 1 (Phase 2)

Una vez vendiendo, agregar en siguientes semanas:
- Inventario automático
- Orden tracking
- Admin panel completo
- Customer portal
- Ticket system
- etc.

**Pero hoy: SOLO VENDER** 🍕

