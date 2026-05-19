/**
 * POST /api/orders/[id]/send-email
 * Resend confirmation email for an order
 * Admin-only endpoint (requires ADMIN_AUTH_TOKEN header)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { emailService } from '@/server/emails/service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // Verify admin authentication
    const authHeader = req.headers.get('authorization');
    const adminToken = process.env.ADMIN_AUTH_TOKEN;

    if (!adminToken) {
      console.error('ADMIN_AUTH_TOKEN not configured');
      return NextResponse.json(
        { error: 'Admin authentication not configured' },
        { status: 500 }
      );
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    if (token !== adminToken) {
      console.warn(`Invalid admin token attempt for order ${orderId}`);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Fetch order with full details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare order data for email template
    const orderConfirmationData = {
      orderNumber: orderId.substring(0, 8).toUpperCase(),
      customerName: order.customer.name || order.email.split('@')[0],
      items: order.items.map((item) => ({
        productName: item.product.name,
        quantity: item.quantity,
        size: item.product.size || 'N/A',
        price: item.price,
      })),
      total: order.totalAmount,
      shippingAddress: order.address,
      email: order.email,
    };

    // Send confirmation email
    const emailSent = await emailService.sendOrderConfirmation(
      order.email,
      orderConfirmationData
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log(`Confirmation email resent for order ${orderId} (admin action)`);

    return NextResponse.json(
      {
        ok: true,
        message: `Email resent to ${order.email}`,
        orderId,
      },
      { status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    console.error('[/api/orders/[id]/send-email] Error:', err.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
