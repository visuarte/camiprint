import { NextRequest } from 'next/server';
import { prisma } from '@/server/db';
import { serverError, unauthorized, verifyAdminToken, successResponse } from '../../auth-utils';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminToken(req)) {
    return unauthorized();
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const quantity = Number(body.quantity);

    if (!Number.isFinite(quantity) || quantity < 0) {
      return successResponse({ error: 'Invalid quantity' }, 400);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { quantity: Math.floor(quantity) },
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

    return successResponse({ ok: true, product: updated });
  } catch (error) {
    return serverError(error, 'Failed to update product stock');
  }
}