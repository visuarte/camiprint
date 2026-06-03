# Bugfix Requirements Document

## Introduction

El despliegue en Vercel muestra estado "ready" y el build se completa exitosamente, pero al acceder a la aplicaciÃ³n en producciÃ³n se muestra un error 404 "not found" en lugar del contenido esperado de CAMIART. El problema ocurre porque Next.js estÃ¡ sirviendo el contenido del directorio `/app` (que contiene el template por defecto de Next.js) en lugar del directorio `/src/app` (que contiene el contenido real de la aplicaciÃ³n CAMIART).

Este bug afecta a todos los usuarios que intentan acceder a la aplicaciÃ³n desplegada en Vercel, impidiendo que vean el contenido de la landing page de CAMIART con las ofertas de camisetas personalizadas.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN la aplicaciÃ³n se despliega en Vercel con ambos directorios `/app` y `/src/app` presentes THEN el sistema sirve el contenido del directorio `/app` (template por defecto) en lugar del contenido de `/src/app` (aplicaciÃ³n real de CAMIART)

1.2 WHEN un usuario accede a la ruta raÃ­z `/` en producciÃ³n THEN el sistema muestra el template por defecto de Next.js con el mensaje "To get started, edit the page.tsx file" en lugar de la landing page de CAMIART

1.3 WHEN el build de Next.js se ejecuta en Vercel THEN el sistema detecta y compila el directorio `/app` ignorando el directorio `/src/app` que contiene el cÃ³digo de producciÃ³n

### Expected Behavior (Correct)

2.1 WHEN la aplicaciÃ³n se despliega en Vercel THEN el sistema SHALL servir el contenido del directorio `/src/app` que contiene la aplicaciÃ³n real de CAMIART

2.2 WHEN un usuario accede a la ruta raÃ­z `/` en producciÃ³n THEN el sistema SHALL mostrar la landing page de CAMIART con el tÃ­tulo "Camisetas personalizadas para negocios, restaurantes y empresas" y las ofertas por cantidad

2.3 WHEN el build de Next.js se ejecuta en Vercel THEN el sistema SHALL compilar Ãºnicamente el directorio `/src/app` y generar las pÃ¡ginas estÃ¡ticas correspondientes al contenido de CAMIART

### Unchanged Behavior (Regression Prevention)

3.1 WHEN la aplicaciÃ³n se ejecuta en modo desarrollo local THEN el sistema SHALL CONTINUE TO funcionar correctamente mostrando el contenido de `/src/app`

3.2 WHEN el build se ejecuta localmente con `npm run build` THEN el sistema SHALL CONTINUE TO compilar exitosamente sin errores de TypeScript o ESLint

3.3 WHEN existen archivos estÃ¡ticos en el directorio `/public` THEN el sistema SHALL CONTINUE TO servirlos correctamente en todas las rutas

3.4 WHEN la configuraciÃ³n de Next.js en `next.config.ts` estÃ¡ presente THEN el sistema SHALL CONTINUE TO respetar todas las opciones de configuraciÃ³n definidas
