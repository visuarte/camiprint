#!/usr/bin/env node
/**
 * Consulta una Order por ID usando Prisma.
 * Uso:
 *   node scripts/query-order.mjs <orderId>
 * Requiere DATABASE_URL en .env o en el entorno.
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Cargar .env manualmente (Node 24 sin --env-file)
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

const orderId = process.argv[2];
if (!orderId || orderId === '<orderId>') {
  console.error('Uso: node scripts/query-order.mjs <orderId>');
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, customer: true },
  });

  if (!order) {
    console.log(`No se encontró ninguna orden con id: ${orderId}`);
  } else {
    console.log(JSON.stringify({
      id: order.id,
      status: order.status,
      email: order.email,
      totalAmount: order.totalAmount,
      stripePaymentIntentId: order.stripePaymentIntentId,
      createdAt: order.createdAt,
      itemCount: order.items?.length ?? 0,
      customer: order.customer?.name ?? null,
    }, null, 2));
  }
} finally {
  await prisma.$disconnect();
}
