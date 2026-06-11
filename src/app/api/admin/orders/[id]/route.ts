import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { verifyAdminToken, unauthorized, serverError, successResponse } from '../../auth-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminToken(req))) return unauthorized();
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                size: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return successResponse(order);
  } catch (error) {
    return serverError(error, 'Failed to fetch order');
  }
}
