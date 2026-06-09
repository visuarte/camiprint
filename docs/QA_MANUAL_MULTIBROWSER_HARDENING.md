# QA Manual Multibrowser y Dispositivos Reales (Hardening)

Fecha: 2026-05-14
Estado: listo para ejecucion
Owner sugerido: QA Lead + Product + Tech Lead

## 1. Objetivo

Validar en condiciones reales de navegador y dispositivo que el flujo de cotizacion, la navegacion movil y los endpoints operativos cumplen comportamiento esperado antes de go-live.

## 2. Alcance

Incluye:
- Render de home y secciones clave
- Flujo de cotizacion feliz
- Manejo visual de errores 422 y 429
- Menu movil en iPhone y Android
- Verificacion operativa de endpoints de salud y metricas en entorno local

No incluye:
- Rediseño UI
- Pruebas de carga masiva
- Auditorias de seguridad avanzadas (pentest)

## 3. Matriz minima de ejecucion

### 3.1 Desktop
- Chrome (estable)
- Edge (estable)
- Firefox (estable)
- Safari en macOS (si disponible)

### 3.2 Mobile real
- iPhone (Safari iOS)
- Android (Chrome)

## 4. Precondiciones

- Rama main actualizada
- npm install ejecutado
- npm run dev activo en localhost:3000
- Backend local operativo con endpoints /api/v1/quotes, /api/v1/health y /api/v1/metrics
- Evidencia habilitada: screenshots y/o grabacion corta por caso

## 5. Casos criticos (P0)

### C1. Smoke home render
Pasos:
1. Abrir home en cada navegador de matriz desktop.
2. Confirmar render de Hero, Pricing, Proceso, FAQ y Contacto.

Esperado:
- No hay layout roto ni errores visuales criticos.
- Navegacion principal visible y funcional.

Evidencia:
- 1 screenshot por navegador.

### C2. Flujo cotizacion feliz
Pasos:
1. Ir a seccion contacto.
2. Completar formulario con datos validos.
3. Enviar solicitud.

Esperado:
- Mensaje: "Solicitud enviada. Te contactaremos en breve."
- Sin errores de validacion en UI.

Evidencia:
- Screenshot del estado de exito.

### C3. Error 422 visible en UI
Pasos:
1. Enviar payload invalido (email/telefono invalido) desde formulario.

Esperado:
- Se muestran mensajes por campo.
- Mensaje general de payload invalido cuando aplique.

Evidencia:
- Screenshot de errores visibles.

### C4. Error 429 visible en UI
Pasos:
1. Forzar condicion de limite (ambiente de prueba o backend con condicion de 429).
2. Enviar formulario.

Esperado:
- Mensaje: "Hay alta demanda en este momento. Intentalo nuevamente en unos minutos."

Evidencia:
- Screenshot del mensaje 429.

### C5. Menu movil iPhone y Android
Pasos:
1. Abrir home en iPhone Safari y Android Chrome.
2. Abrir menu movil.
3. Validar enlaces visibles.
4. Cerrar menu seleccionando un enlace.

Esperado:
- Menu abre y cierra sin glitches.
- No hay bloqueo de scroll inesperado ni solapamientos criticos.

Evidencia:
- 1 screenshot abierto y 1 cerrado por dispositivo.

### C6. Health y metrics locales
Pasos:
1. Abrir /api/v1/health y validar respuesta.
2. Abrir /api/v1/metrics y validar texto de metricas.

Esperado:
- /api/v1/health responde 200 con payload valido.
- /api/v1/metrics responde 200 y contenido text/plain.

Evidencia:
- Screenshot o export de respuesta de ambos endpoints.

## 6. Casos recomendados (P1)

- Rotacion portrait/landscape en mobile
- Zoom 125% y 150% en desktop
- Navegacion con teclado en formulario y menu
- Validacion de contraste en bloques criticos

## 7. Registro de resultados

Usar este formato por caso:

- Caso: Cx
- Entorno: navegador + version + SO + dispositivo
- Resultado: PASS o FAIL
- Hallazgo: descripcion breve
- Severidad: P0 o P1
- Evidencia: ruta o link interno

## 8. Criterio de cierre hardening QA

Se considera cerrado cuando:
- Todos los casos P0 estan en PASS
- No quedan bugs P0 abiertos
- Bugs P1 tienen ticket y plan de remediacion
- Existe evidencia adjunta por navegador/dispositivo de la matriz minima

## 9. Salida esperada

- Reporte final QA manual firmado por QA Lead
- Lista de bugs encontrados y estado
- Decision go/no-go respaldada por evidencia
