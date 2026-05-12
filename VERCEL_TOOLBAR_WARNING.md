# Vercel Toolbar warning: DialogContent requires DialogTitle

## Diagnostico

El warning:

- DialogContent requires a DialogTitle for the component to be accessible...

no proviene del codigo de la app en este repositorio.

Tambien puede aparecer este warning:

- [DEPRECATED] Default export is deprecated. Instead use import { create } from 'zustand'

Cuando aparece en archivos como instrument.*.js y feedback.js con query dpl=..., tampoco proviene del codigo de la app.

### Evidencia

- No existe uso de Radix Dialog en el codigo fuente de la app (no hay importaciones de @radix-ui/react-dialog en src).
- En dependencias del proyecto no esta Radix UI.
- En dependencias del proyecto no esta zustand.
- El warning aparece desde un script externo tipo instrument.*.js con parametro dpl=..., que corresponde al entorno de Vercel Toolbar/Live Feedback.

## Impacto

- No rompe estilos CSS de la landing.
- No rompe la funcionalidad principal del sitio.
- Es un warning de accesibilidad del overlay/herramienta de Vercel en el navegador.

## Como corregirlo (operativo)

1. Abre la web en modo incognito sin extensiones.
2. Si desaparece, el conflicto es de extension/toolbar.
3. Desactiva Vercel Toolbar/Live Feedback para este dominio, o cierra sesion en Vercel en ese navegador.
4. Recarga fuerte (Ctrl+Shift+R).

Opcional para depuracion limpia:

5. Desactiva temporalmente la extension de Vercel en el navegador.
6. Repite la prueba en una ventana de invitado/incognito.

## Como validar que tu app esta limpia

1. Abre consola en un navegador sin extensiones.
2. Navega a / y /#contacto.
3. Verifica que no salga el warning.
4. Verifica que se carguen estilos (fondos oscuros, gradientes, botones metal).

## Nota

Si necesitas ese overlay para colaboracion, el warning puede ignorarse mientras no afecte UX ni accesibilidad de componentes propios.
