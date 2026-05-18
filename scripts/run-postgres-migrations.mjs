import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
const migrationsDirPath = path.resolve(currentDirPath, '../src/server/platform/database/migrations');

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error('DATABASE_URL es obligatorio para ejecutar migraciones.');
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
});

const ensureMigrationsTable = async () => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

const getAppliedMigrationIds = async () => {
  const { rows } = await client.query('SELECT id FROM schema_migrations ORDER BY id ASC');
  return new Set(rows.map((row) => row.id));
};

const getMigrationFileNames = async () => {
  const entries = await readdir(migrationsDirPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
};

const applyMigration = async (migrationFileName) => {
  const migrationId = migrationFileName.replace(/\.sql$/, '');
  const migrationPath = path.join(migrationsDirPath, migrationFileName);
  const sql = await readFile(migrationPath, 'utf8');

  await client.query('BEGIN');

  try {
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [migrationId]);
    await client.query('COMMIT');
    console.log(`Aplicada migracion: ${migrationId}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

try {
  await client.connect();
  await ensureMigrationsTable();

  const appliedMigrationIds = await getAppliedMigrationIds();
  const migrationFileNames = await getMigrationFileNames();
  const pendingMigrationFileNames = migrationFileNames.filter(
    (migrationFileName) => !appliedMigrationIds.has(migrationFileName.replace(/\.sql$/, ''))
  );

  if (pendingMigrationFileNames.length === 0) {
    console.log('No hay migraciones pendientes.');
    process.exit(0);
  }

  for (const migrationFileName of pendingMigrationFileNames) {
    await applyMigration(migrationFileName);
  }

  console.log(`Migraciones aplicadas: ${pendingMigrationFileNames.length}`);
} catch (error) {
  console.error('Fallo al ejecutar migraciones PostgreSQL.');
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}