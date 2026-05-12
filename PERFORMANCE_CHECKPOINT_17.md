# Checkpoint 17 - Optimizacion de rendimiento

Fecha: 2026-05-12

## Cambios implementados (17.1)

- Se configuro `next/font` en `src/app/layout.tsx` con `Inter` y variable CSS (`--font-inter`).
- Se conecto la fuente optimizada en `src/app/globals.css` mediante `--font-sans: var(--font-inter), ...`.
- Se configuro `next.config.ts` para formatos modernos de imagen:
  - `image/avif`
  - `image/webp`
  - `minimumCacheTTL` de 7 dias.
- Se optimizo el Hero para diferir la carga del visor 3D:
  - El script de `model-viewer` solo se inyecta bajo demanda del usuario.
  - Se reemplazo la carga inicial por un CTA "Cargar modelo 3D".
- Se redujo costo de pintado inicial en Hero removiendo una capa visual no critica (`bg-cami-noise`).

## Auditoria Lighthouse (17.2)

Ejecucion en entorno local de produccion (`next build` + `next start`, modo headless/incognito):

- Performance score: **96**
- FCP: **0.79s**
- LCP: **2.62s**
- TBT: **117ms**
- CLS: **0.000**

### Objetivos vs resultado

- Performance score > 90: **Cumplido**
- FCP < 1.5s: **Cumplido**
- LCP < 2.5s: **Casi cumplido (2.62s)**
- TBT < 200ms: **Cumplido**
- CLS < 0.1: **Cumplido**

## Bundle size (17.3)

Inspeccion de chunks en `.next/static/chunks` (post-build):

- 0m_p1bxtorv5i.js: 221.0 KB
- 0lw8gfybf7kay.js: 147.3 KB
- 0c7h~x4_chf35.js: 138.3 KB
- 03~yq9q893hmn.js: 110.0 KB

Nota: se intento eliminar `framer-motion`, pero esta dependencia es requerida por `ContactSection.tsx`; se restauro para mantener estabilidad funcional.

## Validacion tecnica

- `npm run test`: 38/38 en verde.
- `npm run build`: OK.
