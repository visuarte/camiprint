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

  constructor(db: Queryable | Promise<Queryable> = getPostgresPool()) {
    this.dbPromise = Promise.resolve(db);
  }

  async create(input: QuoteRequestInput): Promise<QuoteLeadRecord> {
    const db = await this.dbPromise;
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
    const db = await this.dbPromise;
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