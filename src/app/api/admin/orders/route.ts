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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Query Prisma whenever a DB URL is configured.
    let orders: Array<Record<string, any>> = [];
    let total = 0;
    if (platformConfig.databaseUrl) {
      const { prisma } = await import('@/server/db');
      total = await prisma.order.count({ where });
      orders = await prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: 'desc' },
        select: {
          id: true,
          customerId: true,
          email: true,
          phone: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      });
    } else {
      // No DB configured — return empty list to avoid 500s in local/dev
      orders = [];
      total = 0;
    }

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      orders,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error('[admin/orders] DB error, returning empty dataset:', error);
    return successResponse({ orders: [], total: 0, page: 1, limit: 10, totalPages: 0 });
  }
}
