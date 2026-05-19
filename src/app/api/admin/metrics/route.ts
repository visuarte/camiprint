import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get orders in date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        status: true,
        totalAmount: true,
      },
    });

    // Calculate metrics
    const totalOrders = orders.length;
    const paidOrders = orders.filter((o: typeof orders[0]) => o.status === 'paid').length;
    const pendingOrders = orders.filter((o: typeof orders[0]) => o.status === 'pending').length;
    const cancelledOrders = orders.filter((o: typeof orders[0]) => o.status === 'cancelled').length;
    const totalRevenue = orders
      .filter((o: typeof orders[0]) => o.status === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return NextResponse.json({
      totalOrders,
      paidOrders,
      pendingOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
