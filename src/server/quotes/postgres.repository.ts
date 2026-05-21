import type { QuoteRepository } from '@/server/quotes/contracts';
import type { QuoteLeadRecord, QuoteRequestInput } from '@/server/quotes/types';
import { getPostgresPool } from '@/server/platform/database/client';

interface Queryable {
  query<T>(text: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

interface QuoteRow {
  id: string;
  source: QuoteLeadRecord['source'];
  status: QuoteLeadRecord['status'];
  name: string;
  email: string;
  phone: string;
  company_name: string;
  quantity: QuoteLeadRecord['quantity'];
  message: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

const CREATE_QUOTES_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT quotes_source_check CHECK (source = 'landing-contact-form'),
  CONSTRAINT quotes_status_check CHECK (status = 'received'),
  CONSTRAINT quotes_quantity_check CHECK (quantity IN ('10-24', '25-49', '50-99', '100+'))
);

CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON quotes (created_at DESC);
CREATE INDEX IF NOT EXISTS quotes_email_idx ON quotes (email);
CREATE INDEX IF NOT EXISTS quotes_status_idx ON quotes (status);
`;

const mapRowToQuoteLeadRecord = (row: QuoteRow): QuoteLeadRecord => ({
  id: row.id,
  source: row.source,
  status: row.status,
  name: row.name,
  email: row.email,
  phone: row.phone,
  companyName: row.company_name,
  quantity: row.quantity,
  ...(row.message ? { message: row.message } : {}),
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString(),
});

const createQuoteId = () => {
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

  return `q_${uuid}`;
};

export class PostgresQuotesRepository implements QuoteRepository {
  private readonly dbPromise: Promise<Queryable>;
  private setupPromise: Promise<void> | null = null;

  constructor(db: Queryable | Promise<Queryable> = getPostgresPool()) {
    this.dbPromise = Promise.resolve(db);
  }

  private async ensureSchema(): Promise<Queryable> {
    const db = await this.dbPromise;

    if (!this.setupPromise) {
      this.setupPromise = db.query(CREATE_QUOTES_TABLE_SQL).then(() => undefined);
    }

    await this.setupPromise;
    return db;
  }

  async create(input: QuoteRequestInput): Promise<QuoteLeadRecord> {
    const db = await this.ensureSchema();
    const nowIso = new Date().toISOString();
    const record: QuoteLeadRecord = {
      id: createQuoteId(),
      source: 'landing-contact-form',
      status: 'received',
      createdAt: nowIso,
      updatedAt: nowIso,
      ...input,
    };

    const { rows } = await db.query<QuoteRow>(
      `INSERT INTO quotes (
        id,
        source,
        status,
        name,
        email,
        phone,
        company_name,
        quantity,
        message,
        created_at,
        updated_at,
        metadata
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id, source, status, name, email, phone, company_name, quantity, message, created_at, updated_at`,
      [
        record.id,
        record.source,
        record.status,
        record.name,
        record.email,
        record.phone,
        record.companyName,
        record.quantity,
        record.message ?? null,
        record.createdAt,
        record.updatedAt,
        null,
      ]
    );

    return mapRowToQuoteLeadRecord(rows[0]);
  }

  async list(): Promise<QuoteLeadRecord[]> {
    const db = await this.ensureSchema();
    const { rows } = await db.query<QuoteRow>(
      `SELECT id, source, status, name, email, phone, company_name, quantity, message, created_at, updated_at
       FROM quotes
       ORDER BY created_at ASC`
    );

    return rows.map(mapRowToQuoteLeadRecord);
  }

  async isHealthy(): Promise<boolean> {
    try {
      const db = await this.dbPromise;
      await db.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
