import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

let cachedPrisma: PrismaClient | undefined;

const getPrismaClient = (): PrismaClient => {
  if (cachedPrisma) return cachedPrisma;

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  cachedPrisma = new PrismaClient();

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
