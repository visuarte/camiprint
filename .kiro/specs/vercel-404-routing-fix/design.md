# Vercel 404 Routing Fix - Bugfix Design

## Overview

El bug se manifiesta cuando Next.js encuentra dos directorios de App Router simultÃ¡neamente: `/app` (template por defecto) y `/src/app` (aplicaciÃ³n real de CAMIART). Next.js prioriza el directorio `/app` en la raÃ­z sobre `/src/app`, causando que se sirva el contenido incorrecto en producciÃ³n.

La soluciÃ³n correcta siguiendo las mejores prÃ¡cticas de Next.js es **eliminar completamente el directorio `/app`** y mantener Ãºnicamente `/src/app` como la Ãºnica fuente de verdad. Esta es la estructura recomendada para proyectos que utilizan el directorio `src/` para organizar el cÃ³digo de la aplicaciÃ³n, separÃ¡ndolo de archivos de configuraciÃ³n en la raÃ­z del proyecto.

## Glossary

- **Bug_Condition (C)**: La condiciÃ³n que activa el bug - cuando existen simultÃ¡neamente los directorios `/app` y `/src/app` en el proyecto
- **Property (P)**: El comportamiento deseado - Next.js debe servir Ãºnicamente el contenido de `/src/app` (aplicaciÃ³n CAMIART)
- **Preservation**: El comportamiento existente que debe mantenerse sin cambios - archivos estÃ¡ticos, configuraciÃ³n, y funcionalidad en desarrollo local
- **App Router**: El sistema de enrutamiento de Next.js 13+ que utiliza el directorio `app/` para definir rutas mediante convenciones de archivos especiales
- **Directory Priority**: Next.js prioriza `/app` sobre `/src/app` cuando ambos existen, segÃºn la documentaciÃ³n oficial que establece "create a new `app` directory at the root of your project (or `src/` directory)"
- **Template por defecto**: El contenido generado por `create-next-app` en `/app` que muestra "To get started, edit the page.tsx file"
- **AplicaciÃ³n CAMIART**: El contenido real de producciÃ³n en `/src/app` con la landing page de camisetas personalizadas

## Bug Details

### Bug Condition

El bug se manifiesta cuando el proyecto contiene dos directorios de App Router simultÃ¡neamente. Next.js detecta primero el directorio `/app` en la raÃ­z y lo utiliza como fuente de verdad, ignorando completamente el directorio `/src/app` que contiene la aplicaciÃ³n real.

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

- **ProducciÃ³n en Vercel**: Al desplegar, el usuario accede a `https://camiart.com/` y ve el template por defecto de Next.js ("To get started, edit the page.tsx file") en lugar de la landing page de CAMIART con ofertas de camisetas
- **Build exitoso pero contenido incorrecto**: El comando `next build` se ejecuta sin errores, pero genera pÃ¡ginas estÃ¡ticas del directorio `/app` incorrecto
- **Desarrollo local funciona**: En algunos casos, el servidor de desarrollo puede mostrar el contenido correcto de `/src/app`, pero producciÃ³n sirve `/app`, creando una discrepancia entre entornos
- **Metadata incorrecta**: Los meta tags muestran "Create Next App" (de `/app/layout.tsx`) en lugar de "CAMIART | Camisetas laborales y publicitarias" (de `/src/app/layout.tsx`)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- El servidor de desarrollo local debe continuar funcionando correctamente con `npm run dev`
- El comando `npm run build` debe continuar compilando exitosamente sin errores
- Los archivos estÃ¡ticos en `/public` deben continuar siendo servidos correctamente
- La configuraciÃ³n de Next.js en `next.config.ts` debe continuar siendo respetada
- Los archivos de configuraciÃ³n de TypeScript, ESLint, y Tailwind deben continuar funcionando sin modificaciones
- El contenido de `/src/app` (layout.tsx, page.tsx, globals.css, favicon.ico) debe permanecer completamente intacto

**Scope:**
Todos los aspectos del proyecto que NO involucran el directorio `/app` en la raÃ­z deben permanecer completamente inalterados. Esto incluye:
- Toda la estructura de `/src/app` y su contenido
- Archivos de configuraciÃ³n en la raÃ­z del proyecto
- Dependencias en `package.json`
- Archivos estÃ¡ticos en `/public`
- ConfiguraciÃ³n de Git en `.gitignore`

## Hypothesized Root Cause

BasÃ¡ndome en la documentaciÃ³n oficial de Next.js y el anÃ¡lisis del bug, la causa raÃ­z es clara:

1. **Prioridad de Directorios en Next.js**: Next.js tiene una regla de prioridad documentada donde el directorio `/app` en la raÃ­z tiene precedencia sobre `/src/app`. La documentaciÃ³n oficial establece: "create a new `app` directory at the root of your project (or `src/` directory)" - indicando que son opciones mutuamente excluyentes, no complementarias.

2. **CreaciÃ³n Accidental del Template**: El directorio `/app` fue creado accidentalmente (probablemente mediante `create-next-app` o un comando similar) despuÃ©s de que ya existÃ­a `/src/app` con el contenido de CAMIART. Esto creÃ³ una estructura de directorios invÃ¡lida con dos App Routers.

3. **DetecciÃ³n de Directorio en Build Time**: Durante el proceso de build, Next.js escanea el sistema de archivos y detecta `/app` primero debido a su posiciÃ³n en la raÃ­z, estableciÃ©ndolo como el directorio de App Router y ignorando `/src/app`.

4. **Discrepancia entre Desarrollo y ProducciÃ³n**: Es posible que el servidor de desarrollo tenga un comportamiento ligeramente diferente al build de producciÃ³n en cuanto a la resoluciÃ³n de directorios, lo que explica por quÃ© el bug puede no ser evidente en desarrollo local pero sÃ­ en Vercel.

## Correctness Properties

Property 1: Bug Condition - Single App Router Directory

_For any_ proyecto Next.js donde se elimina el directorio `/app` de la raÃ­z y se mantiene Ãºnicamente `/src/app`, Next.js SHALL detectar y utilizar `/src/app` como el Ãºnico directorio de App Router, sirviendo el contenido correcto de CAMIART en todas las rutas.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Unchanged Project Configuration

_For any_ archivo o directorio que NO sea `/app` en la raÃ­z (incluyendo `/src/app`, `/public`, archivos de configuraciÃ³n, y dependencias), el sistema SHALL mantener exactamente el mismo comportamiento y contenido que tenÃ­a antes de la eliminaciÃ³n de `/app`, preservando toda la funcionalidad existente.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

La soluciÃ³n es directa y sigue las mejores prÃ¡cticas de Next.js para proyectos con estructura `src/`:

**AcciÃ³n Principal**: Eliminar completamente el directorio `/app` de la raÃ­z del proyecto

**Archivos a Eliminar**:
1. `/app/page.tsx` - Template por defecto de Next.js
2. `/app/layout.tsx` - Layout con configuraciÃ³n de Geist fonts
3. `/app/globals.css` - Estilos del template por defecto
4. `/app/favicon.ico` - Favicon del template por defecto
5. `/app/` - El directorio completo

**JustificaciÃ³n**:
- Next.js soporta dos estructuras mutuamente excluyentes: `/app` O `/src/app`, pero no ambas simultÃ¡neamente
- La documentaciÃ³n oficial indica que `src/` es una opciÃ³n vÃ¡lida para organizar el cÃ³digo de la aplicaciÃ³n separado de archivos de configuraciÃ³n
- El contenido de `/src/app` es la aplicaciÃ³n real de CAMIART y debe ser la Ãºnica fuente de verdad
- El contenido de `/app` es el template por defecto generado por `create-next-app` y no tiene valor para el proyecto

**Archivos que NO se modifican**:
- `/src/app/page.tsx` - Contenido de CAMIART (se mantiene intacto)
- `/src/app/layout.tsx` - Layout de CAMIART (se mantiene intacto)
- `/src/app/globals.css` - Estilos de CAMIART (se mantiene intacto)
- `/src/app/favicon.ico` - Favicon de CAMIART (se mantiene intacto)
- `next.config.ts` - Sin cambios necesarios
- `package.json` - Sin cambios necesarios
- Todos los demÃ¡s archivos del proyecto

### Implementation Steps

1. **Backup (Opcional pero Recomendado)**: Crear un commit de Git antes de eliminar archivos
2. **Eliminar Directorio**: Ejecutar `rm -rf app/` (Linux/Mac) o eliminar manualmente el directorio `/app`
3. **Verificar Build Local**: Ejecutar `npm run build` para confirmar que el build se completa exitosamente
4. **Verificar Contenido**: Ejecutar `npm run start` y verificar que `http://localhost:3000` muestra el contenido de CAMIART
5. **Desplegar a Vercel**: Hacer commit y push de los cambios para que Vercel reconstruya la aplicaciÃ³n
6. **Verificar ProducciÃ³n**: Acceder a la URL de Vercel y confirmar que muestra el contenido de CAMIART

## Testing Strategy

### Validation Approach

La estrategia de testing sigue un enfoque de dos fases: primero, confirmar que el bug existe en el cÃ³digo sin arreglar (exploratory testing), luego verificar que el fix funciona correctamente y preserva el comportamiento existente.

### Exploratory Bug Condition Checking

**Goal**: Confirmar que el bug existe ANTES de implementar el fix. Verificar que Next.js estÃ¡ sirviendo el contenido incorrecto de `/app` en lugar de `/src/app`.

**Test Plan**: Inspeccionar el build actual y el contenido servido en producciÃ³n para confirmar que se estÃ¡ utilizando el directorio incorrecto.

**Test Cases**:
1. **Build Output Inspection**: Ejecutar `npm run build` y examinar el output para ver quÃ© directorio estÃ¡ siendo compilado (esperamos ver referencias a `/app`)
2. **Production Content Check**: Acceder a la URL de Vercel y verificar que el contenido mostrado es el template por defecto (will fail - muestra contenido incorrecto)
3. **Metadata Verification**: Inspeccionar los meta tags en producciÃ³n y verificar que muestran "Create Next App" en lugar de "CAMIART" (will fail - metadata incorrecta)
4. **Directory Structure Check**: Listar los directorios del proyecto y confirmar que ambos `/app` y `/src/app` existen simultÃ¡neamente (will confirm bug condition)

**Expected Counterexamples**:
- El contenido servido en producciÃ³n es el template por defecto de Next.js, no CAMIART
- Los meta tags muestran "Create Next App" en lugar de "CAMIART | Camisetas laborales y publicitarias"
- El build de Next.js estÃ¡ compilando archivos de `/app` en lugar de `/src/app`

### Fix Checking

**Goal**: Verificar que despuÃ©s de eliminar `/app`, Next.js sirve correctamente el contenido de `/src/app` en todos los entornos.

**Pseudocode:**
```
FOR ALL deployment_environment IN [local_build, local_production, vercel_production] DO
  result := buildAndServeApplication(deployment_environment)
  ASSERT contentMatches(result.homepage, CAMIART_EXPECTED_CONTENT)
  ASSERT metadataMatches(result.metadata, CAMIART_EXPECTED_METADATA)
  ASSERT NOT contentMatches(result.homepage, NEXTJS_TEMPLATE_CONTENT)
END FOR
```

**Specific Assertions:**
- La pÃ¡gina raÃ­z `/` muestra el tÃ­tulo "Camisetas personalizadas para negocios, restaurantes y empresas"
- Los meta tags incluyen "CAMIART | Camisetas laborales y publicitarias"
- El contenido incluye las tres ofertas por cantidad (10+, 25+, 50+ camisetas)
- El contenido incluye la secciÃ³n "Especialistas en" con las tres categorÃ­as
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

**Testing Approach**: ComparaciÃ³n directa de archivos y comportamiento antes y despuÃ©s del fix. Dado que la Ãºnica operaciÃ³n es eliminar un directorio completo, la preservaciÃ³n es inherente - no hay riesgo de modificar accidentalmente otros archivos.

**Test Cases**:
1. **Source Code Preservation**: Verificar que todos los archivos en `/src/app` permanecen idÃ©nticos (contenido, permisos, timestamps relativos)
2. **Configuration Preservation**: Verificar que `next.config.ts`, `tsconfig.json`, `package.json`, etc. no han sido modificados
3. **Static Assets Preservation**: Verificar que todos los archivos en `/public` siguen siendo servidos correctamente
4. **Development Server**: Ejecutar `npm run dev` y verificar que funciona exactamente igual que antes
5. **Build Process**: Ejecutar `npm run build` y verificar que se completa sin errores nuevos
6. **TypeScript Compilation**: Verificar que no hay errores de TypeScript nuevos introducidos

### Unit Tests

Dado que este es un bug de configuraciÃ³n de estructura de directorios y no de lÃ³gica de cÃ³digo, los "unit tests" son verificaciones manuales:

- **Test 1**: Verificar que el directorio `/app` no existe despuÃ©s del fix
- **Test 2**: Verificar que el directorio `/src/app` existe y contiene los 4 archivos esperados
- **Test 3**: Ejecutar `npm run build` y verificar exit code 0 (Ã©xito)
- **Test 4**: Ejecutar `npm run start` y verificar que el servidor inicia correctamente
- **Test 5**: Hacer una peticiÃ³n HTTP a `http://localhost:3000` y verificar status code 200
- **Test 6**: Verificar que el HTML retornado contiene "CAMIART" y no "Create Next App"

### Property-Based Tests

Para este tipo de bug (estructura de directorios), property-based testing no es directamente aplicable. Sin embargo, podemos definir propiedades invariantes:

- **Property 1**: En cualquier momento despuÃ©s del fix, `directoryExists('/app')` debe ser `false`
- **Property 2**: En cualquier momento despuÃ©s del fix, `directoryExists('/src/app')` debe ser `true`
- **Property 3**: Para cualquier ruta vÃ¡lida de Next.js, el contenido servido debe provenir de `/src/app` y no de `/app`
- **Property 4**: Para cualquier archivo en `/src/app`, su contenido debe ser idÃ©ntico antes y despuÃ©s del fix

Estas propiedades pueden verificarse mediante scripts de validaciÃ³n que se ejecuten en diferentes momentos del ciclo de vida del proyecto.

### Integration Tests

Tests de integraciÃ³n que verifican el comportamiento end-to-end:

- **Test 1 - Local Build and Serve**: 
  1. Ejecutar `npm run build`
  2. Ejecutar `npm run start`
  3. Hacer peticiÃ³n HTTP a `http://localhost:3000`
  4. Verificar que el contenido es de CAMIART
  5. Verificar que los meta tags son correctos
  6. Verificar que no hay errores en la consola del navegador

- **Test 2 - Vercel Deployment**:
  1. Hacer commit y push de los cambios
  2. Esperar a que Vercel complete el build
  3. Acceder a la URL de producciÃ³n de Vercel
  4. Verificar que el contenido es de CAMIART
  5. Verificar que los meta tags son correctos
  6. Verificar que el status del deployment en Vercel es "Ready"

- **Test 3 - Static Asset Serving**:
  1. Acceder a archivos estÃ¡ticos como `/next.svg`, `/vercel.svg`
  2. Verificar que se sirven correctamente con status code 200
  3. Verificar que el favicon se carga correctamente

- **Test 4 - CSS and Styling**:
  1. Acceder a la pÃ¡gina principal
  2. Verificar que los estilos de Tailwind se aplican correctamente
  3. Verificar que el diseÃ±o responsive funciona en diferentes tamaÃ±os de pantalla
  4. Verificar que los colores y tipografÃ­a coinciden con el diseÃ±o de CAMIART
