import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { createErrorResponse } from '@/lib/error-handler';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Order ID is required',
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: order.id,
      customerId: order.customerId,
      email: order.email,
      phone: order.phone,
      address: order.address,
      totalAmount: order.totalAmount,
      status: order.status,
      items: order.items,
      stripePaymentIntentId: order.stripePaymentIntentId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse.body, { status: errorResponse.status });
  } finally {
    await prisma.$disconnect();
  }
}
