#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDemoOrder() {
  console.log('🎯 Creating demo order...');

  try {
    // Create demo customer
    const customer = await prisma.customer.upsert({
      where: { email: 'demo@camiprint.test' },
      update: {},
      create: {
        email: 'demo@camiprint.test',
        name: 'Demo User',
        phone: '+1 (555) 000-0000',
        address: '123 Demo Street',
        city: 'Demo City',
        state: 'DC',
        zipCode: '12345',
      },
    });

    console.log('✓ Customer created:', customer.id);

    // Get first product for order
    const product = await prisma.product.findFirst();
    if (!product) {
      console.error('❌ No products found. Run seed-products.mjs first!');
      process.exit(1);
    }

    // Create demo order
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        status: 'paid',
        totalAmount: product.price * 2,
        shippingAddress: '123 Demo Street, Demo City, DC 12345',
        items: {
          create: [
            {
              productId: product.id,
              quantity: 2,
              price: product.price,
            },
          ],
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    console.log('✓ Demo order created:', order.id);
    console.log('   Status: PAID');
    console.log('   Items:', order.items.length);
    console.log('   Total: $' + order.totalAmount.toFixed(2));
    console.log('   Customer:', order.customer.email);
    console.log('\n✅ Demo data ready! You can access this order in the admin panel.');
  } catch (error) {
    console.error('❌ Error creating demo order:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoOrder();
