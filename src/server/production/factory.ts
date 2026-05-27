import { createPrismaProductionRepository } from "@/server/production/prisma-repository";
import { createInMemoryProductionRepository } from "@/server/production/in-memory-repository";

/**
 * Returns a production repository based on environment.
 * - If `DATABASE_URL` is present, use Prisma implementation.
 * - Otherwise, use in-memory (safe for dev and tests).
 */
export function getProductionRepository() {
  if (process.env.DATABASE_URL) {
    return createPrismaProductionRepository();
  }
  return createInMemoryProductionRepository();
}
