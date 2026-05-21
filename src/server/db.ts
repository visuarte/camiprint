import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { getDatabaseUrlFromEnv } from '@/server/platform/config';

declare global {
  var prisma: PrismaClient | undefined;
}

let cachedPrisma: PrismaClient | undefined;

const getPrismaClient = (): PrismaClient => {
  if (cachedPrisma) return cachedPrisma;

  const databaseUrl = getDatabaseUrlFromEnv();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  cachedPrisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== 'production') {
    global.prisma = cachedPrisma;
  }

  return cachedPrisma;
};

// Lazy proxy - PrismaClient is only instantiated when accessed
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return Reflect.get(getPrismaClient(), prop);
  },
});
