# Bugfix Requirements Document

## Introduction

El despliegue en Vercel muestra estado "ready" y el build se completa exitosamente, pero al acceder a la aplicación en producción se muestra un error 404 "not found" en lugar del contenido esperado de Camiprint. El problema ocurre porque Next.js está sirviendo el contenido del directorio `/app` (que contiene el template por defecto de Next.js) en lugar del directorio `/src/app` (que contiene el contenido real de la aplicación Camiprint).

Este bug afecta a todos los usuarios que intentan acceder a la aplicación desplegada en Vercel, impidiendo que vean el contenido de la landing page de Camiprint con las ofertas de camisetas personalizadas.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN la aplicación se despliega en Vercel con ambos directorios `/app` y `/src/app` presentes THEN el sistema sirve el contenido del directorio `/app` (template por defecto) en lugar del contenido de `/src/app` (aplicación real de Camiprint)

1.2 WHEN un usuario accede a la ruta raíz `/` en producción THEN el sistema muestra el template por defecto de Next.js con el mensaje "To get started, edit the page.tsx file" en lugar de la landing page de Camiprint

1.3 WHEN el build de Next.js se ejecuta en Vercel THEN el sistema detecta y compila el directorio `/app` ignorando el directorio `/src/app` que contiene el código de producción

### Expected Behavior (Correct)

2.1 WHEN la aplicación se despliega en Vercel THEN el sistema SHALL servir el contenido del directorio `/src/app` que contiene la aplicación real de Camiprint

2.2 WHEN un usuario accede a la ruta raíz `/` en producción THEN el sistema SHALL mostrar la landing page de Camiprint con el título "Camisetas personalizadas para negocios, restaurantes y empresas" y las ofertas por cantidad

2.3 WHEN el build de Next.js se ejecuta en Vercel THEN el sistema SHALL compilar únicamente el directorio `/src/app` y generar las páginas estáticas correspondientes al contenido de Camiprint

### Unchanged Behavior (Regression Prevention)

3.1 WHEN la aplicación se ejecuta en modo desarrollo local THEN el sistema SHALL CONTINUE TO funcionar correctamente mostrando el contenido de `/src/app`

3.2 WHEN el build se ejecuta localmente con `npm run build` THEN el sistema SHALL CONTINUE TO compilar exitosamente sin errores de TypeScript o ESLint

3.3 WHEN existen archivos estáticos en el directorio `/public` THEN el sistema SHALL CONTINUE TO servirlos correctamente en todas las rutas

3.4 WHEN la configuración de Next.js en `next.config.ts` está presente THEN el sistema SHALL CONTINUE TO respetar todas las opciones de configuración definidas
