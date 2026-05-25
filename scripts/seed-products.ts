/**
 * Seed de productos para Camiprint
 * Ejecutar con: npx tsx scripts/seed-products.ts
 *
 * Requiere DATABASE_URL apuntando a Supabase (pooler o directo).
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  '';

if (!connectionString) {
  console.error('DATABASE_URL no definida');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: 'Camiseta Básica — Pack 10',
    description: 'Impresión 1 color. Plazo 10 días. Shipping incluido.',
    price: 12.9,
    imageUrl: null,
    size: 'M',
    quantity: 500,
  },
  {
    name: 'Camiseta Premium — Pack 25',
    description: 'Impresión 2 colores. Plazo 7-10 días. Shipping + Tracking. Diseño gratuito.',
    price: 10.9,
    imageUrl: null,
    size: 'M',
    quantity: 500,
  },
  {
    name: 'Camiseta Pro — Pack 50',
    description: 'Impresión multicolor. Plazo 5-7 días. Shipping prioritario. Diseño + Muestras gratis.',
    price: 8.9,
    imageUrl: null,
    size: 'M',
    quantity: 500,
  },
];

async function main() {
  console.log('Seeding productos...');

  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (existing) {
      console.log(`  ⏭  Ya existe: ${product.name}`);
      continue;
    }
    const created = await prisma.product.create({ data: product });
    console.log(`  ✓ Creado: ${created.name} (${created.id})`);
  }

  console.log('Seed completado.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
