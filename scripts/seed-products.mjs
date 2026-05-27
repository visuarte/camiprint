#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Cargar .env manualmente
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

const dbUrl = process.env.DATABASE_URL ?? '';
// Strip sslmode from URL so pg doesn't override the ssl option below
const connectionString = dbUrl.replace(/[?&]sslmode=[^&]*/g, '').replace(/[?&]pgbouncer=[^&]*/g, '');
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
let prisma;
try {
  prisma = new PrismaClient({ adapter });
} catch (error) {
  console.error('Error initializing Prisma:', error);
  process.exit(1);
}

async function seedProducts() {
  console.log('🌱 Starting product seed...');

  try {
    // Clear existing products (optional - comment out if you want to keep them)
    // await prisma.product.deleteMany({});
    // console.log('Cleared existing products');

    const products = [
      {
        name: 'Classic T-Shirt',
        description: 'Comfortable classic t-shirt perfect for everyday wear',
        price: 24.99,
        imageUrl: 'https://via.placeholder.com/400x400?text=Classic+T-Shirt',
        size: 'M',
        quantity: 50,
      },
      {
        name: 'Premium Cotton',
        description: '100% premium cotton t-shirt with superior comfort',
        price: 34.99,
        imageUrl: 'https://via.placeholder.com/400x400?text=Premium+Cotton',
        size: 'L',
        quantity: 40,
      },
      {
        name: 'V-Neck Tee',
        description: 'Stylish v-neck t-shirt for a modern look',
        price: 27.99,
        imageUrl: 'https://via.placeholder.com/400x400?text=V-Neck+Tee',
        size: 'M',
        quantity: 35,
      },
      {
        name: 'Graphic Print',
        description: 'Bold graphic print t-shirt with trendy design',
        price: 29.99,
        imageUrl: 'https://via.placeholder.com/400x400?text=Graphic+Print',
        size: 'L',
        quantity: 30,
      },
      {
        name: 'Oversized Fit',
        description: 'Relaxed oversized fit t-shirt for ultimate comfort',
        price: 32.99,
        imageUrl: 'https://via.placeholder.com/400x400?text=Oversized+Fit',
        size: 'XL',
        quantity: 25,
      },
      {
        name: 'Sport Tech',
        description: 'Moisture-wicking performance t-shirt for active wear',
        price: 39.99,
        imageUrl: 'https://via.placeholder.com/400x400?text=Sport+Tech',
        size: 'L',
        quantity: 20,
      },
      {
        name: 'Vintage Retro',
        description: 'Retro vintage-inspired t-shirt with classic appeal',
        price: 31.99,
        imageUrl: 'https://via.placeholder.com/400x400?text=Vintage+Retro',
        size: 'M',
        quantity: 28,
      },
      {
        name: 'Premium Blend',
        description: 'Premium cotton-polyester blend for durability',
        price: 33.99,
        imageUrl: 'https://via.placeholder.com/400x400?text=Premium+Blend',
        size: 'S',
        quantity: 32,
      },
    ];

    for (const product of products) {
      // Create multiple size variants for each product
      const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      
      for (const size of sizes) {
        const existingProduct = await prisma.product.findFirst({
          where: {
            name: product.name,
            size: size,
          },
        });

        if (!existingProduct) {
          await prisma.product.create({
            data: {
              ...product,
              size: size,
              quantity: Math.floor(Math.random() * 50) + 20, // Random quantity between 20-70
            },
          });
          console.log(`✅ Created: ${product.name} - Size ${size}`);
        } else {
          console.log(`⏭️  Already exists: ${product.name} - Size ${size}`);
        }
      }
    }

    console.log('✨ Product seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();
