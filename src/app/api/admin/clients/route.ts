import { NextRequest } from 'next/server';
import { getPlatformConfig } from '@/server/platform/config';
import { verifyAdminToken, unauthorized, serverError, successResponse } from '../auth-utils';

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  lastOrderStatus: string | null;
};

export async function GET(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return unauthorized();
  }

  try {
    const platformConfig = getPlatformConfig();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const search = searchParams.get('search')?.trim();

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (!platformConfig.databaseUrl) {
      return successResponse({
        customers: [],
        total: 0,
        totalOrders: 0,
        totalRevenue: 0,
        page,
        limit,
        totalPages: 0,
      });
    }

    const { prisma } = await import('@/server/db');

    const total = await prisma.customer.count({ where: where as never });
    const customers = await prisma.customer.findMany({
      where: where as never,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          select: {
            totalAmount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const orderWhere = search
      ? {
          customer: {
            is: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        }
      : {};

    const aggregates = await prisma.order.aggregate({
      where: orderWhere as never,
      _count: { _all: true },
      _sum: { totalAmount: true },
    });

    const rows: CustomerRow[] = customers.map((customer) => {
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const lastOrder = customer.orders[0] ?? null;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
        orderCount: customer.orders.length,
        totalSpent,
        lastOrderAt: lastOrder?.createdAt ? lastOrder.createdAt.toISOString() : null,
        lastOrderStatus: lastOrder?.status ?? null,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return successResponse({
      customers: rows,
      total,
      totalOrders: aggregates._count._all,
      totalRevenue: aggregates._sum.totalAmount ?? 0,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    return serverError(error, 'Failed to load clients');
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return unauthorized();
  }

  try {
    const platformConfig = getPlatformConfig();
    if (!platformConfig.databaseUrl) {
      return successResponse({ error: 'DATABASE_NOT_AVAILABLE', message: 'No hay base de datos disponible para crear clientes.' }, 503);
    }

    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const address = typeof body.address === 'string' ? body.address.trim() : '';

    if (!name || !email || !phone || !address) {
      return new Response(JSON.stringify({ error: 'VALIDATION_ERROR', message: 'Nombre, email, teléfono y dirección son obligatorios.' }), {
        status: 422,
        headers: { 'content-type': 'application/json' },
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return new Response(JSON.stringify({ error: 'INVALID_EMAIL', message: 'El email no es válido.' }), {
        status: 422,
        headers: { 'content-type': 'application/json' },
      });
    }

    const { prisma } = await import('@/server/db');

    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      return new Response(JSON.stringify({ error: 'DUPLICATE_EMAIL', message: 'Ya existe un cliente con ese email.' }), {
        status: 409,
        headers: { 'content-type': 'application/json' },
      });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse({ customer }, 201);
  } catch (error) {
    return serverError(error, 'Failed to create client');
  }
}