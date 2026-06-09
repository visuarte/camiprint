# Checkpoint 18 - Testing completo

Fecha: 2026-05-12

## 18.1 Suite unitaria + cobertura

Comando:
- `npx vitest run --coverage`

Resultado:
- Test files: 9 passed
- Tests: 44 passed
- Cobertura global:
  - Statements: 86.36%
  - Branches: 74.69%
  - Functions: 88.23%
  - Lines: 90.36%

Objetivo:
- Cobertura >80% para componentes principales: **cumplido**.

Cambios de soporte:
- Se amplió `src/__tests__/ContactSection.test.tsx` para cubrir más ramas de validación, preselección y estados de envío.

## 18.2 Tests de integración

Comando:
- `npx vitest run src/__tests__/QuoteFlow.integration.test.tsx src/__tests__/PageIntegration.test.ts`

Resultado:
- Test files: 2 passed
- Tests: 5 passed

Flujos verificados:
- Flujo de cotización (interacción y submit)
- Integración de página y secciones principales

## 18.3 Testing manual en navegadores

Estado:
- Pendiente la matriz completa manual solicitada en el task (Chrome, Firefox, Safari, Edge, Android Chrome, iOS Safari).

Evidencia manual realizada en esta iteración (Chromium integrado):
- Carga de home en producción local (`http://localhost:3002`)
- Verificación de secciones clave visibles (Hero, Pricing, Contacto)
- Revisión básica de overflow horizontal:
  - Desktop 1280x800: sin overflow
  - Mobile 375x812: sin overflow

## 18.4 Accesibilidad automatizada

Intento inicial:
- `@axe-core/cli` no ejecutó por mismatch local de ChromeDriver/Chrome.

Alternativa aplicada (equivalente automatizada):
- Lighthouse categoría accesibilidad:
  - Comando: `npx lighthouse --only-categories=accessibility ...`
  - Resultado:
    - Accessibility score: 100
    - Failed audits: 0

## Resumen

- 18.1: completado
- 18.2: completado
- 18.4: completado
- 18.3: pendiente de ejecución manual multibrowser/dispositivo real
