# Vercel 404 Routing Fix - Bugfix Design

## Overview

El bug se manifiesta cuando Next.js encuentra dos directorios de App Router simultáneamente: `/app` (template por defecto) y `/src/app` (aplicación real de Camiprint). Next.js prioriza el directorio `/app` en la raíz sobre `/src/app`, causando que se sirva el contenido incorrecto en producción.

La solución correcta siguiendo las mejores prácticas de Next.js es **eliminar completamente el directorio `/app`** y mantener únicamente `/src/app` como la única fuente de verdad. Esta es la estructura recomendada para proyectos que utilizan el directorio `src/` para organizar el código de la aplicación, separándolo de archivos de configuración en la raíz del proyecto.

## Glossary

- **Bug_Condition (C)**: La condición que activa el bug - cuando existen simultáneamente los directorios `/app` y `/src/app` en el proyecto
- **Property (P)**: El comportamiento deseado - Next.js debe servir únicamente el contenido de `/src/app` (aplicación Camiprint)
- **Preservation**: El comportamiento existente que debe mantenerse sin cambios - archivos estáticos, configuración, y funcionalidad en desarrollo local
- **App Router**: El sistema de enrutamiento de Next.js 13+ que utiliza el directorio `app/` para definir rutas mediante convenciones de archivos especiales
- **Directory Priority**: Next.js prioriza `/app` sobre `/src/app` cuando ambos existen, según la documentación oficial que establece "create a new `app` directory at the root of your project (or `src/` directory)"
- **Template por defecto**: El contenido generado por `create-next-app` en `/app` que muestra "To get started, edit the page.tsx file"
- **Aplicación Camiprint**: El contenido real de producción en `/src/app` con la landing page de camisetas personalizadas

## Bug Details

### Bug Condition

El bug se manifiesta cuando el proyecto contiene dos directorios de App Router simultáneamente. Next.js detecta primero el directorio `/app` en la raíz y lo utiliza como fuente de verdad, ignorando completamente el directorio `/src/app` que contiene la aplicación real.

**Formal Specification:**
```
FUNCTION isBugCondition(projectStructure)
  INPUT: projectStructure of type FileSystemStructure
  OUTPUT: boolean
  
  RETURN directoryExists(projectStructure, '/app')
         AND directoryExists(projectStructure, '/src/app')
         AND containsFile(projectStructure, '/app/page.tsx')
         AND containsFile(projectStructure, '/src/app/page.tsx')
         AND NOT contentMatches('/app/page.tsx', '/src/app/page.tsx')
END FUNCTION
```

### Examples

- **Producción en Vercel**: Al desplegar, el usuario accede a `https://camiprint.vercel.app/` y ve el template por defecto de Next.js ("To get started, edit the page.tsx file") en lugar de la landing page de Camiprint con ofertas de camisetas
- **Build exitoso pero contenido incorrecto**: El comando `next build` se ejecuta sin errores, pero genera páginas estáticas del directorio `/app` incorrecto
- **Desarrollo local funciona**: En algunos casos, el servidor de desarrollo puede mostrar el contenido correcto de `/src/app`, pero producción sirve `/app`, creando una discrepancia entre entornos
- **Metadata incorrecta**: Los meta tags muestran "Create Next App" (de `/app/layout.tsx`) en lugar de "Camiprint | Camisetas laborales y publicitarias" (de `/src/app/layout.tsx`)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- El servidor de desarrollo local debe continuar funcionando correctamente con `npm run dev`
- El comando `npm run build` debe continuar compilando exitosamente sin errores
- Los archivos estáticos en `/public` deben continuar siendo servidos correctamente
- La configuración de Next.js en `next.config.ts` debe continuar siendo respetada
- Los archivos de configuración de TypeScript, ESLint, y Tailwind deben continuar funcionando sin modificaciones
- El contenido de `/src/app` (layout.tsx, page.tsx, globals.css, favicon.ico) debe permanecer completamente intacto

**Scope:**
Todos los aspectos del proyecto que NO involucran el directorio `/app` en la raíz deben permanecer completamente inalterados. Esto incluye:
- Toda la estructura de `/src/app` y su contenido
- Archivos de configuración en la raíz del proyecto
- Dependencias en `package.json`
- Archivos estáticos en `/public`
- Configuración de Git en `.gitignore`

## Hypothesized Root Cause

Basándome en la documentación oficial de Next.js y el análisis del bug, la causa raíz es clara:

1. **Prioridad de Directorios en Next.js**: Next.js tiene una regla de prioridad documentada donde el directorio `/app` en la raíz tiene precedencia sobre `/src/app`. La documentación oficial establece: "create a new `app` directory at the root of your project (or `src/` directory)" - indicando que son opciones mutuamente excluyentes, no complementarias.

2. **Creación Accidental del Template**: El directorio `/app` fue creado accidentalmente (probablemente mediante `create-next-app` o un comando similar) después de que ya existía `/src/app` con el contenido de Camiprint. Esto creó una estructura de directorios inválida con dos App Routers.

3. **Detección de Directorio en Build Time**: Durante el proceso de build, Next.js escanea el sistema de archivos y detecta `/app` primero debido a su posición en la raíz, estableciéndolo como el directorio de App Router y ignorando `/src/app`.

4. **Discrepancia entre Desarrollo y Producción**: Es posible que el servidor de desarrollo tenga un comportamiento ligeramente diferente al build de producción en cuanto a la resolución de directorios, lo que explica por qué el bug puede no ser evidente en desarrollo local pero sí en Vercel.

## Correctness Properties

Property 1: Bug Condition - Single App Router Directory

_For any_ proyecto Next.js donde se elimina el directorio `/app` de la raíz y se mantiene únicamente `/src/app`, Next.js SHALL detectar y utilizar `/src/app` como el único directorio de App Router, sirviendo el contenido correcto de Camiprint en todas las rutas.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Unchanged Project Configuration

_For any_ archivo o directorio que NO sea `/app` en la raíz (incluyendo `/src/app`, `/public`, archivos de configuración, y dependencias), el sistema SHALL mantener exactamente el mismo comportamiento y contenido que tenía antes de la eliminación de `/app`, preservando toda la funcionalidad existente.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

La solución es directa y sigue las mejores prácticas de Next.js para proyectos con estructura `src/`:

**Acción Principal**: Eliminar completamente el directorio `/app` de la raíz del proyecto

**Archivos a Eliminar**:
1. `/app/page.tsx` - Template por defecto de Next.js
2. `/app/layout.tsx` - Layout con configuración de Geist fonts
3. `/app/globals.css` - Estilos del template por defecto
4. `/app/favicon.ico` - Favicon del template por defecto
5. `/app/` - El directorio completo

**Justificación**:
- Next.js soporta dos estructuras mutuamente excluyentes: `/app` O `/src/app`, pero no ambas simultáneamente
- La documentación oficial indica que `src/` es una opción válida para organizar el código de la aplicación separado de archivos de configuración
- El contenido de `/src/app` es la aplicación real de Camiprint y debe ser la única fuente de verdad
- El contenido de `/app` es el template por defecto generado por `create-next-app` y no tiene valor para el proyecto

**Archivos que NO se modifican**:
- `/src/app/page.tsx` - Contenido de Camiprint (se mantiene intacto)
- `/src/app/layout.tsx` - Layout de Camiprint (se mantiene intacto)
- `/src/app/globals.css` - Estilos de Camiprint (se mantiene intacto)
- `/src/app/favicon.ico` - Favicon de Camiprint (se mantiene intacto)
- `next.config.ts` - Sin cambios necesarios
- `package.json` - Sin cambios necesarios
- Todos los demás archivos del proyecto

### Implementation Steps

1. **Backup (Opcional pero Recomendado)**: Crear un commit de Git antes de eliminar archivos
2. **Eliminar Directorio**: Ejecutar `rm -rf app/` (Linux/Mac) o eliminar manualmente el directorio `/app`
3. **Verificar Build Local**: Ejecutar `npm run build` para confirmar que el build se completa exitosamente
4. **Verificar Contenido**: Ejecutar `npm run start` y verificar que `http://localhost:3000` muestra el contenido de Camiprint
5. **Desplegar a Vercel**: Hacer commit y push de los cambios para que Vercel reconstruya la aplicación
6. **Verificar Producción**: Acceder a la URL de Vercel y confirmar que muestra el contenido de Camiprint

## Testing Strategy

### Validation Approach

La estrategia de testing sigue un enfoque de dos fases: primero, confirmar que el bug existe en el código sin arreglar (exploratory testing), luego verificar que el fix funciona correctamente y preserva el comportamiento existente.

### Exploratory Bug Condition Checking

**Goal**: Confirmar que el bug existe ANTES de implementar el fix. Verificar que Next.js está sirviendo el contenido incorrecto de `/app` en lugar de `/src/app`.

**Test Plan**: Inspeccionar el build actual y el contenido servido en producción para confirmar que se está utilizando el directorio incorrecto.

**Test Cases**:
1. **Build Output Inspection**: Ejecutar `npm run build` y examinar el output para ver qué directorio está siendo compilado (esperamos ver referencias a `/app`)
2. **Production Content Check**: Acceder a la URL de Vercel y verificar que el contenido mostrado es el template por defecto (will fail - muestra contenido incorrecto)
3. **Metadata Verification**: Inspeccionar los meta tags en producción y verificar que muestran "Create Next App" en lugar de "Camiprint" (will fail - metadata incorrecta)
4. **Directory Structure Check**: Listar los directorios del proyecto y confirmar que ambos `/app` y `/src/app` existen simultáneamente (will confirm bug condition)

**Expected Counterexamples**:
- El contenido servido en producción es el template por defecto de Next.js, no Camiprint
- Los meta tags muestran "Create Next App" en lugar de "Camiprint | Camisetas laborales y publicitarias"
- El build de Next.js está compilando archivos de `/app` en lugar de `/src/app`

### Fix Checking

**Goal**: Verificar que después de eliminar `/app`, Next.js sirve correctamente el contenido de `/src/app` en todos los entornos.

**Pseudocode:**
```
FOR ALL deployment_environment IN [local_build, local_production, vercel_production] DO
  result := buildAndServeApplication(deployment_environment)
  ASSERT contentMatches(result.homepage, CAMIPRINT_EXPECTED_CONTENT)
  ASSERT metadataMatches(result.metadata, CAMIPRINT_EXPECTED_METADATA)
  ASSERT NOT contentMatches(result.homepage, NEXTJS_TEMPLATE_CONTENT)
END FOR
```

**Specific Assertions:**
- La página raíz `/` muestra el título "Camisetas personalizadas para negocios, restaurantes y empresas"
- Los meta tags incluyen "Camiprint | Camisetas laborales y publicitarias"
- El contenido incluye las tres ofertas por cantidad (10+, 25+, 50+ camisetas)
- El contenido incluye la sección "Especialistas en" con las tres categorías
- NO se muestra el mensaje "To get started, edit the page.tsx file"
- NO se muestran los botones "Deploy Now" y "Documentation" del template

### Preservation Checking

**Goal**: Verificar que todos los aspectos del proyecto que NO involucran el directorio `/app` permanecen completamente inalterados.

**Pseudocode:**
```
FOR ALL file IN [src/app/*, public/*, config_files, package.json] DO
  ASSERT fileContent_after_fix = fileContent_before_fix
  ASSERT fileExists_after_fix = fileExists_before_fix
END FOR

FOR ALL functionality IN [dev_server, build_process, static_assets, typescript_compilation] DO
  ASSERT behavior_after_fix = behavior_before_fix
END FOR
```

**Testing Approach**: Comparación directa de archivos y comportamiento antes y después del fix. Dado que la única operación es eliminar un directorio completo, la preservación es inherente - no hay riesgo de modificar accidentalmente otros archivos.

**Test Cases**:
1. **Source Code Preservation**: Verificar que todos los archivos en `/src/app` permanecen idénticos (contenido, permisos, timestamps relativos)
2. **Configuration Preservation**: Verificar que `next.config.ts`, `tsconfig.json`, `package.json`, etc. no han sido modificados
3. **Static Assets Preservation**: Verificar que todos los archivos en `/public` siguen siendo servidos correctamente
4. **Development Server**: Ejecutar `npm run dev` y verificar que funciona exactamente igual que antes
5. **Build Process**: Ejecutar `npm run build` y verificar que se completa sin errores nuevos
6. **TypeScript Compilation**: Verificar que no hay errores de TypeScript nuevos introducidos

### Unit Tests

Dado que este es un bug de configuración de estructura de directorios y no de lógica de código, los "unit tests" son verificaciones manuales:

- **Test 1**: Verificar que el directorio `/app` no existe después del fix
- **Test 2**: Verificar que el directorio `/src/app` existe y contiene los 4 archivos esperados
- **Test 3**: Ejecutar `npm run build` y verificar exit code 0 (éxito)
- **Test 4**: Ejecutar `npm run start` y verificar que el servidor inicia correctamente
- **Test 5**: Hacer una petición HTTP a `http://localhost:3000` y verificar status code 200
- **Test 6**: Verificar que el HTML retornado contiene "Camiprint" y no "Create Next App"

### Property-Based Tests

Para este tipo de bug (estructura de directorios), property-based testing no es directamente aplicable. Sin embargo, podemos definir propiedades invariantes:

- **Property 1**: En cualquier momento después del fix, `directoryExists('/app')` debe ser `false`
- **Property 2**: En cualquier momento después del fix, `directoryExists('/src/app')` debe ser `true`
- **Property 3**: Para cualquier ruta válida de Next.js, el contenido servido debe provenir de `/src/app` y no de `/app`
- **Property 4**: Para cualquier archivo en `/src/app`, su contenido debe ser idéntico antes y después del fix

Estas propiedades pueden verificarse mediante scripts de validación que se ejecuten en diferentes momentos del ciclo de vida del proyecto.

### Integration Tests

Tests de integración que verifican el comportamiento end-to-end:

- **Test 1 - Local Build and Serve**: 
  1. Ejecutar `npm run build`
  2. Ejecutar `npm run start`
  3. Hacer petición HTTP a `http://localhost:3000`
  4. Verificar que el contenido es de Camiprint
  5. Verificar que los meta tags son correctos
  6. Verificar que no hay errores en la consola del navegador

- **Test 2 - Vercel Deployment**:
  1. Hacer commit y push de los cambios
  2. Esperar a que Vercel complete el build
  3. Acceder a la URL de producción de Vercel
  4. Verificar que el contenido es de Camiprint
  5. Verificar que los meta tags son correctos
  6. Verificar que el status del deployment en Vercel es "Ready"

- **Test 3 - Static Asset Serving**:
  1. Acceder a archivos estáticos como `/next.svg`, `/vercel.svg`
  2. Verificar que se sirven correctamente con status code 200
  3. Verificar que el favicon se carga correctamente

- **Test 4 - CSS and Styling**:
  1. Acceder a la página principal
  2. Verificar que los estilos de Tailwind se aplican correctamente
  3. Verificar que el diseño responsive funciona en diferentes tamaños de pantalla
  4. Verificar que los colores y tipografía coinciden con el diseño de Camiprint
