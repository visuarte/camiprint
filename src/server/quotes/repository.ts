import type { QuoteLeadRecord, QuoteRequestInput } from '@/server/quotes/types';
import type { QuoteRepository } from '@/server/quotes/contracts';
import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';

interface QuotesStore {
  records: QuoteLeadRecord[];
}

const DATA_FILE_PATH =
  process.env.NODE_ENV === 'test'
    ? join(/* turbopackIgnore: true */ process.cwd(), 'data', `quotes.${process.pid}.json`)
    : join(/* turbopackIgnore: true */ process.cwd(), 'data', 'quotes.json');
const GLOBAL_STORAGE_LOCK_KEY = '__camiart_quotes_storage_lock__';

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

const readStore = async (): Promise<QuotesStore> => {
  const filePath = DATA_FILE_PATH;
  await ensureStoreFile(filePath);

  const rawData = await fs.readFile(filePath, 'utf-8');
  const parsedData = JSON.parse(rawData) as QuotesStore;

  if (!Array.isArray(parsedData.records)) {
    throw new Error('Invalid quotes storage format');
  }

  return parsedData;
};

const writeStoreAtomically = async (store: QuotesStore): Promise<void> => {
  const filePath = DATA_FILE_PATH;
  const temporaryPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`;

  await ensureStoreFile(filePath);
  await fs.writeFile(temporaryPath, JSON.stringify(store, null, 2), 'utf-8');
  await fs.rename(temporaryPath, filePath);
};

const createQuoteId = () => `q_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

export class QuotesRepository implements QuoteRepository {
  async create(input: QuoteRequestInput): Promise<QuoteLeadRecord> {
    return await withStorageLock(async () => {
      const nowIso = new Date().toISOString();
      const record: QuoteLeadRecord = {
        id: createQuoteId(),
        source: 'landing-contact-form',
        status: 'received',
        createdAt: nowIso,
        updatedAt: nowIso,
        ...input,
      };

      const store = await readStore();
      store.records.push(record);
      await writeStoreAtomically(store);

      return record;
    });
  }

  async list(): Promise<QuoteLeadRecord[]> {
    return await withStorageLock(async () => {
      const store = await readStore();
      return [...store.records];
    });
  }

  async isHealthy(): Promise<boolean> {
    return await withStorageLock(async () => {
      try {
        const store = await readStore();
        return Array.isArray(store.records);
      } catch {
        return false;
      }
    });
  }
}

export const __resetQuotesStorageForTests = async (): Promise<void> => {
  if (process.env.NODE_ENV !== 'test') return;
  await withStorageLock(async () => {
    await writeStoreAtomically({ records: [] });
  });
};
