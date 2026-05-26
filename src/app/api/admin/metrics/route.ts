import { NextRequest, NextResponse } from 'next/server';
import { getPlatformConfig } from '@/server/platform/config';
import { verifyAdminToken, unauthorized, serverError, successResponse } from '../auth-utils';

export async function GET(req: NextRequest) {
  // Verify admin token
  if (!verifyAdminToken(req)) {
    return unauthorized();
  }

  try {
    const platformConfig = getPlatformConfig();
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get orders in date range. Only query Prisma when running with Postgres configured.
    let orders: Array<{ id: string; status: string; totalAmount: number }> = [];
    if (platformConfig.quoteRepositoryDriver === 'postgres') {
      try {
        const { prisma } = await import('@/server/db');
        orders = await prisma.order.findMany({
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
      } catch (dbError) {
        // DB not reachable — return empty metrics instead of 500
        console.error('[metrics] DB error, returning empty metrics:', dbError);
        orders = [];
      }
    }
    // JSON driver → orders already empty []

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
