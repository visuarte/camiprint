/**
 * Tests de integración real contra PostgreSQL.
 *
 * Requieren un servidor PostgreSQL accesible.
 * Para ejecutar localmente con el contenedor Docker de CI:
 *
 *   docker run --name camiart-postgres-e2e \
 *     -e POSTGRES_DB=camiart -e POSTGRES_USER=camiart -e POSTGRES_PASSWORD=camiart \
 *     -p 55432:5432 -d postgres:16
 *
 *   POSTGRES_INTEGRATION_TEST=true npm run test -- postgres.repository.integration
 *
 * En CI/CD configurar también:
 *   POSTGRES_TEST_URL=postgresql://camiart:camiart@localhost:55432/camiart
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { brandConfig } from '@/config/brand';
import { PostgresQuotesRepository } from '@/server/quotes/postgres.repository';
import type { QuoteRequestInput } from '@/server/quotes/types';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const TEST_DB_URL =
  process.env.POSTGRES_TEST_URL ??
  'postgresql://camiart:camiart@localhost:55432/camiart';

const baseInput: QuoteRequestInput = {
  name: 'Integracion Test',
  email: 'integration@camiprint.test',
  phone: '+34 600 000 001',
  companyName: brandConfig.companyExample,
  quantity: '50-99',
  message: 'Test de integracion con PostgreSQL real',
};

describe.skipIf(process.env.POSTGRES_INTEGRATION_TEST !== 'true')(
  'PostgresQuotesRepository [integración]',
  () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pool: any;

    beforeAll(async () => {
      // Importación dinámica para evitar que pg rompa el entorno unitario normal
      const { Pool } = await import('pg');
      pool = new Pool({ connectionString: TEST_DB_URL });

      const ddl = readFileSync(
        join(
          process.cwd(),
          'src/server/platform/database/migrations/001_create_quotes.sql'
        ),
        'utf-8'
      );
      await pool.query(ddl);

      // Limpia datos de ejecuciones anteriores del mismo prefijo
      await pool.query(
        `DELETE FROM quotes WHERE email = 'integration@camiprint.test'`
      );
    });

    afterAll(async () => {
      await pool.query(
        `DELETE FROM quotes WHERE email = 'integration@camiprint.test'`
      );
      await pool.end();
    });

    it('crea un registro y devuelve el shape correcto', async () => {
      const repo = new PostgresQuotesRepository(pool);

      const created = await repo.create(baseInput);

      expect(created.id).toMatch(/^q_/);
      expect(created.status).toBe('received');
      expect(created.source).toBe('landing-contact-form');
      expect(created.name).toBe(baseInput.name);
      expect(created.email).toBe(baseInput.email);
      expect(created.phone).toBe(baseInput.phone);
      expect(created.companyName).toBe(baseInput.companyName);
      expect(created.quantity).toBe(baseInput.quantity);
      expect(created.message).toBe(baseInput.message);
      expect(created.createdAt).toMatch(/\d{4}-\d{2}-\d{2}T/);
      expect(created.updatedAt).toMatch(/\d{4}-\d{2}-\d{2}T/);
    });

    it('lista registros y el creado aparece en la respuesta', async () => {
      const repo = new PostgresQuotesRepository(pool);

      const created = await repo.create({
        ...baseInput,
        name: 'Listado Test',
      });

      const records = await repo.list();

      expect(records.length).toBeGreaterThanOrEqual(1);
      expect(records.some((r) => r.id === created.id)).toBe(true);
    });

    it('reporta isHealthy true con la base de datos disponible', async () => {
      const repo = new PostgresQuotesRepository(pool);

      expect(await repo.isHealthy()).toBe(true);
    });

    it('reporta isHealthy false cuando la conexion falla', async () => {
      const { Pool: PoolCls } = await import('pg');
      const badPool = new PoolCls({
        connectionString: 'postgresql://invalid:invalid@localhost:19999/noexiste',
        connectionTimeoutMillis: 500,
      });
      const repo = new PostgresQuotesRepository(badPool);

      expect(await repo.isHealthy()).toBe(false);

      await badPool.end();
    });

    it('create falla si quantity no está en el enum de la restriccion CHECK', async () => {
      const repo = new PostgresQuotesRepository(pool);

      await expect(
        repo.create({ ...baseInput, quantity: '999+' as never })
      ).rejects.toThrow();
    });
  }
);
