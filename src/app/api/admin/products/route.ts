import { NextRequest } from 'next/server';
import { prisma } from '@/server/db';
import { serverError, unauthorized, verifyAdminToken, successResponse } from '../auth-utils';

type CreateProductPayload = {
  name?: unknown;
  description?: unknown;
  price?: unknown;
  imageUrl?: unknown;
  size?: unknown;
  quantity?: unknown;
};

function parseString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseNullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  return value.trim();
}

function parseNumber(value: unknown): number | undefined {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function parseNonNegativeInteger(value: unknown): number | undefined {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.floor(parsed);
}

function parsePositiveInteger(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return unauthorized();
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();
    const page = parsePositiveInteger(searchParams.get('page'), 1);
    const limit = Math.min(parsePositiveInteger(searchParams.get('limit'), 12), 100);
    const skip = (page - 1) * limit;

    const where = query
      ? {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        }
      : undefined;

    const [total, products, quantityAgg, lowStock, outOfStock] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
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
      }),
      prisma.product.aggregate({
        where,
        _sum: { quantity: true },
      }),
      prisma.product.count({
        where: {
          AND: [where ?? {}, { quantity: { lte: 100 } }],
        },
      }),
      prisma.product.count({
        where: {
          AND: [where ?? {}, { quantity: 0 }],
        },
      }),
    ]);

    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    return successResponse({
      ok: true,
      data: products,
      total,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      summary: {
        totalProducts: total,
        totalUnits: quantityAgg._sum.quantity ?? 0,
        lowStock,
        outOfStock,
      },
    });
  } catch (error) {
    return serverError(error, 'Failed to fetch admin products');
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return unauthorized();
  }

  try {
    const body: CreateProductPayload = await req.json().catch(() => ({}));

    const name = parseString(body.name);
    const price = parseNumber(body.price);
    const size = parseString(body.size) ?? 'M';
    const quantity = parseNonNegativeInteger(body.quantity) ?? 0;
    const description = parseNullableString(body.description) ?? null;
    const imageUrl = parseNullableString(body.imageUrl) ?? null;

    if (!name) {
      return successResponse({ error: 'Invalid product name' }, 422);
    }

    if (price === undefined || price <= 0) {
      return successResponse({ error: 'Invalid price' }, 422);
    }

    const created = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        size,
        quantity,
      },
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
    });

    return successResponse({ ok: true, product: created }, 201);
  } catch (error) {
    return serverError(error, 'Failed to create product');
  }
}