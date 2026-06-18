import { promises as fs, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { prisma } from '@/server/db';
import { getPlatformConfig } from '@/server/platform/config';

export type QuoteCommunicationChannel = 'email' | 'whatsapp' | 'internal';
export type QuoteCommunicationStatus = 'queued' | 'sent' | 'failed';

export interface QuoteCommunicationEntry {
  id: string;
  quoteId: string;
  eventType: string;
  channel: QuoteCommunicationChannel;
  status: QuoteCommunicationStatus;
  templateKey: string;
  message: string;
  requestId: string | null;
  createdAt: string;
}

interface QuoteCommunicationStore {
  records: QuoteCommunicationEntry[];
}

interface QuoteCommunicationRow {
  id: string;
  quote_id: string;
  event_type: string;
  channel: QuoteCommunicationChannel;
  status: QuoteCommunicationStatus;
  template_key: string;
  message: string;
  request_id: string | null;
  created_at: Date | string;
}

let _dataDir: string | null = null;

const getDataDir = (): string => {
  if (_dataDir) return _dataDir;

  const tmp = tmpdir();
  try {
    const testPath = join(tmp, `.camiprint-write-test-${Date.now()}`);
    writeFileSync(testPath, '');
    unlinkSync(testPath);
    _dataDir = tmp;
    return _dataDir;
  } catch {
    _dataDir = join(process.cwd(), 'data');
    return _dataDir;
  }
};

const DATA_FILE_PATH =
  process.env.NODE_ENV === 'test'
    ? join(tmpdir(), `quote-communication.${process.pid}.json`)
    : join(getDataDir(), 'quote-communication.json');

const GLOBAL_STORAGE_LOCK_KEY = '__camiart_quote_communication_storage_lock__';
const GLOBAL_TIMELINE_TABLE_READY_KEY = '__camiart_quote_communication_table_ready__';

const withStorageLock = async <T>(operation: () => Promise<T>): Promise<T> => {
  const globalScope = globalThis as typeof globalThis & {
    [GLOBAL_STORAGE_LOCK_KEY]?: Promise<void>;
  };

  const previousLock = globalScope[GLOBAL_STORAGE_LOCK_KEY] ?? Promise.resolve();
  let releaseLock: () => void = () => {};

  const currentLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });

  globalScope[GLOBAL_STORAGE_LOCK_KEY] = previousLock.then(() => currentLock);

  await previousLock;

  try {
    return await operation();
  } finally {
    releaseLock();
  }
};

const ensureStoreFile = async (filePath: string): Promise<void> => {
  await fs.mkdir(dirname(filePath), { recursive: true });

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify({ records: [] }, null, 2), 'utf-8');
  }
};

const readStore = async (): Promise<QuoteCommunicationStore> => {
  const filePath = DATA_FILE_PATH;
  await ensureStoreFile(filePath);

  const rawData = await fs.readFile(filePath, 'utf-8');
  const parsedData = JSON.parse(rawData) as QuoteCommunicationStore;

  if (!Array.isArray(parsedData.records)) {
    throw new Error('Invalid quote communication storage format');
  }

  return parsedData;
};

const writeStoreAtomically = async (store: QuoteCommunicationStore): Promise<void> => {
  const filePath = DATA_FILE_PATH;
  const temporaryPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`;

  await ensureStoreFile(filePath);
  await fs.writeFile(temporaryPath, JSON.stringify(store, null, 2), 'utf-8');
  await fs.rename(temporaryPath, filePath);
};

const createTimelineEntryId = () => `qcomm_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

const isPostgresTimelineEnabled = (): boolean => {
  try {
    return getPlatformConfig().quoteRepositoryDriver === 'postgres';
  } catch {
    return false;
  }
};

const mapRowToEntry = (row: QuoteCommunicationRow): QuoteCommunicationEntry => ({
  id: row.id,
  quoteId: row.quote_id,
  eventType: row.event_type,
  channel: row.channel,
  status: row.status,
  templateKey: row.template_key,
  message: row.message,
  requestId: row.request_id,
  createdAt: new Date(row.created_at).toISOString(),
});

const ensureTimelineTable = async (): Promise<void> => {
  const globalScope = globalThis as typeof globalThis & {
    [GLOBAL_TIMELINE_TABLE_READY_KEY]?: boolean;
  };

  if (globalScope[GLOBAL_TIMELINE_TABLE_READY_KEY]) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS quote_communication_timeline (
      id TEXT PRIMARY KEY,
      quote_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      channel TEXT NOT NULL,
      status TEXT NOT NULL,
      template_key TEXT NOT NULL,
      message TEXT NOT NULL,
      request_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT quote_comm_channel_check CHECK (channel IN ('email', 'whatsapp', 'internal')),
      CONSTRAINT quote_comm_status_check CHECK (status IN ('queued', 'sent', 'failed'))
    )
  `);

  await prisma.$executeRawUnsafe(
    'CREATE INDEX IF NOT EXISTS quote_comm_quote_id_created_at_idx ON quote_communication_timeline (quote_id, created_at DESC)'
  );

  await prisma.$executeRawUnsafe(
    'CREATE INDEX IF NOT EXISTS quote_comm_event_type_idx ON quote_communication_timeline (event_type)'
  );

  globalScope[GLOBAL_TIMELINE_TABLE_READY_KEY] = true;
};

export interface AppendQuoteCommunicationEventInput {
  quoteId: string;
  eventType: string;
  channel: QuoteCommunicationChannel;
  status: QuoteCommunicationStatus;
  templateKey: string;
  message: string;
  requestId?: string | null;
}

export const appendQuoteCommunicationEvent = async (
  input: AppendQuoteCommunicationEventInput
): Promise<QuoteCommunicationEntry> => {
  const nowIso = new Date().toISOString();
  const entry: QuoteCommunicationEntry = {
    id: createTimelineEntryId(),
    quoteId: input.quoteId,
    eventType: input.eventType,
    channel: input.channel,
    status: input.status,
    templateKey: input.templateKey,
    message: input.message,
    requestId: input.requestId ?? null,
    createdAt: nowIso,
  };

  if (isPostgresTimelineEnabled()) {
    await ensureTimelineTable();
    await prisma.$executeRawUnsafe(
      `INSERT INTO quote_communication_timeline
        (id, quote_id, event_type, channel, status, template_key, message, request_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::timestamptz)`,
      entry.id,
      entry.quoteId,
      entry.eventType,
      entry.channel,
      entry.status,
      entry.templateKey,
      entry.message,
      entry.requestId,
      entry.createdAt
    );

    return entry;
  }

  return await withStorageLock(async () => {
    const store = await readStore();
    store.records.push(entry);
    await writeStoreAtomically(store);
    return entry;
  });
};

export const getLatestQuoteCommunicationForQuote = async (
  quoteId: string
): Promise<QuoteCommunicationEntry | null> => {
  if (isPostgresTimelineEnabled()) {
    await ensureTimelineTable();
    const rows = await prisma.$queryRawUnsafe<QuoteCommunicationRow[]>(
      `SELECT id, quote_id, event_type, channel, status, template_key, message, request_id, created_at
       FROM quote_communication_timeline
       WHERE quote_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      quoteId
    );

    const row = rows[0];
    return row ? mapRowToEntry(row) : null;
  }

  return await withStorageLock(async () => {
    const store = await readStore();
    const byQuote = store.records.filter((record) => record.quoteId === quoteId);
    if (byQuote.length === 0) return null;

    byQuote.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return byQuote[0] ?? null;
  });
};

export const hasQuoteCommunicationEvent = async (quoteId: string, eventType: string): Promise<boolean> => {
  if (isPostgresTimelineEnabled()) {
    await ensureTimelineTable();
    const rows = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
      `SELECT COUNT(*)::int AS count
       FROM quote_communication_timeline
       WHERE quote_id = $1
         AND event_type = $2`,
      quoteId,
      eventType
    );

    return (rows[0]?.count ?? 0) > 0;
  }

  return await withStorageLock(async () => {
    const store = await readStore();
    return store.records.some((record) => record.quoteId === quoteId && record.eventType === eventType);
  });
};
