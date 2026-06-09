# Checkpoint 15 - Responsive y Accesibilidad

Fecha: 2026-05-12

## 14.5 Contraste (WCAG)
Verificacion cuantitativa con calculo de ratio de contraste (luminancia relativa) sobre paleta usada en UI:

- `cami100` sobre `cami950`: 16.68:1
- `cami200` sobre `cami950`: 13.35:1
- `cami300` sobre `cami950`: 10.45:1
- `white` sobre `cami950`: 18.90:1
- `accent400` sobre `cami900`: 8.53:1
- `accent500` sobre `cami950`: 7.32:1
- `cami100` sobre `cami800`: 13.03:1
- `cami300` sobre `cami800`: 8.16:1

Resultado: combinaciones principales por encima de 4.5:1 para texto normal (cumple AA).

## 15. Checkpoint responsive y accesibilidad

### Responsive (breakpoints)
Comprobado en viewport: 320x740, 375x812, 768x1024, 1024x768, 1280x800, 1920x1080.

- Sin overflow horizontal (`scrollWidth <= clientWidth`) en todos los breakpoints.
- Presencia de estructura principal accesible (`#main-content`).
- Un solo `h1` en pagina.

### Teclado y navegacion
- `Tab` enfoca primero el skip link "Saltar al contenido principal".
- `Enter` sobre skip link navega a `#main-content`.
- Focus visible definido globalmente con `:focus-visible`.
- Menu movil con `aria-controls` y cierre por `Escape` implementado en componente.

### Reduced motion
- Regla global `@media (prefers-reduced-motion: reduce)` activa:
  - desactiva/reduce animaciones y transiciones,
  - desactiva smooth scroll,
  - neutraliza transformaciones de reveal.

### Touch targets
- Regla movil para minimo `44px` en botones y enlaces touch (`a.touch-target`).

## Nota
Este checkpoint cubre verificacion automatizada y manual asistida en navegador local. La validacion con lector de pantalla en entorno real (NVDA/VoiceOver) y dispositivos fisicos iOS/Android queda recomendada como paso adicional de QA final.
