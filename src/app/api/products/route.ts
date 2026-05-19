import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET() {
  try {
    // Get all products from database
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        size: true,
        quantity: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store', // Don't cache product list for real-time updates
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
