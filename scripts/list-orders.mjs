#!/usr/bin/env node
/**
 * Lista las últimas N órdenes.
 * Uso:
 *   node scripts/list-orders.mjs [limit=10]
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

const limit = parseInt(process.argv[2] ?? '10', 10);
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  const orders = await prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      email: true,
      totalAmount: true,
      stripePaymentIntentId: true,
      createdAt: true,
    },
  });

  if (orders.length === 0) {
    console.log('No hay órdenes en la base de datos.');
  } else {
    console.table(orders.map(o => ({
      id: o.id.slice(0, 8),
      status: o.status,
      email: o.email,
      total: o.totalAmount,
      pi: o.stripePaymentIntentId?.slice(0, 20) ?? '—',
      createdAt: o.createdAt?.toISOString().slice(0, 19) ?? '—',
    })));
  }
} finally {
  await prisma.$disconnect();
}
