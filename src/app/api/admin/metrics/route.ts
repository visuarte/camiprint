import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { verifyAdminToken, unauthorized, serverError, successResponse } from '../auth-utils';

export async function GET(req: NextRequest) {
  // Verify admin token
  if (!verifyAdminToken(req)) {
    return unauthorized();
  }

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
      .reduce((sum: number, o: typeof orders[0]) => sum + o.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return successResponse({
      totalOrders,
      paidOrders,
      pendingOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    return serverError(error, 'Failed to fetch metrics');
  }
}
