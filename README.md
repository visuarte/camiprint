# Camiart

Tienda online de camisetas con ofertas rápidas por cantidad, enfocada en ropa laboral y publicidad para negocios, restaurantes y empresas.

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` para ver la tienda.

## Variables de entorno

Duplica `.env.example` a `.env.local` o configura estas variables en tu entorno:

```bash
QUOTES_REPOSITORY_DRIVER=json
DATABASE_URL=postgres://camiart:camiart@127.0.0.1:5432/camiart
```

Reglas:

- `QUOTES_REPOSITORY_DRIVER=json` usa el repositorio actual basado en JSON.
- `QUOTES_REPOSITORY_DRIVER=postgres` activa PostgreSQL para el endpoint de cotizaciones.
- `DATABASE_URL` es obligatorio cuando el driver es `postgres`.

## Migraciones PostgreSQL

Con PostgreSQL disponible y `DATABASE_URL` configurado:

```bash
npm run db:migrate
```

Este comando aplica automáticamente los `.sql` de [src/server/platform/database/migrations/001_create_quotes.sql](src/server/platform/database/migrations/001_create_quotes.sql).

## Arranque con PostgreSQL

Para desarrollo con PostgreSQL:

```bash
npm install
npm run db:migrate
npm run dev
```

Con `QUOTES_REPOSITORY_DRIVER=postgres`, los endpoints [src/app/api/v1/quotes/route.ts](src/app/api/v1/quotes/route.ts) y [src/app/api/v1/health/route.ts](src/app/api/v1/health/route.ts) usarán la base de datos real.

## Build y producción

Flujo recomendado:

```bash
npm install
npm run db:migrate
npm run build
npm start
```

## Validación end to end de quotes con PostgreSQL

Existe un validador reproducible:

```bash
npm run validate:e2e:quotes-postgres
```

Este script:

- ejecuta migraciones,
- hace build con webpack,
- arranca el servidor,
- verifica health,
- envía una cotización real,
- y comprueba la persistencia en PostgreSQL.

Nota operativa: en Next 16.2.6 sobre Windows, `next build --webpack` está fallando con un error externo del bundler al resolver app routes. El script queda preparado, pero esa validación puede requerir WSL/Linux o una versión posterior de Next para ejecutarse de punta a punta en este entorno.
