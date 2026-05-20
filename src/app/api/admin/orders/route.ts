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

    // Get total count
    const total = await prisma.order.count({ where });

    // Get orders with pagination
    const orders = await prisma.order.findMany({
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

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      orders,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    return serverError(error, 'Failed to fetch orders');
  }
}
