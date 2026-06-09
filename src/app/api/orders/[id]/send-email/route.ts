/**
 * POST /api/orders/[id]/send-email
 * Resend confirmation email for an order
 * Admin-only endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { emailService } from '@/server/emails/service';
import { verifyAdminToken } from '@/app/api/admin/auth-utils';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    if (!(await verifyAdminToken(req))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
      items: order.items.map((item: typeof order.items[number]) => ({
        productName: item.product.name,
        quantity: item.quantity,
        size: item.product.size || 'N/A',
        price: item.price,
      })),
      total: order.totalAmount,
      shippingAddress: order.address,
      email: order.email,
    };

    // Feature flag: allow disabling emails in env
    if (process.env.ENABLE_EMAILS === 'false') {
      console.log('[send-email] Emails disabled via ENABLE_EMAILS=false; skipping send');
      return NextResponse.json(
        {
          ok: true,
          message: 'Emails are disabled (ENABLE_EMAILS=false). Skipped sending email.',
          orderId,
        },
        { status: 200 }
      );
    }

    // Send confirmation email via emailService
    const emailResult = await emailService.sendOrderConfirmation(
      order.email,
      orderConfirmationData
    );

    if (!emailResult || !emailResult.success) {
      console.error('[send-email] send failed:', emailResult?.error);
      return NextResponse.json(
        { error: 'Failed to send email', details: emailResult?.error },
        { status: 500 }
      );
    }

    console.log(`Confirmation email resent for order ${orderId} (admin action), messageId=${emailResult.id}`);

    return NextResponse.json(
      {
        ok: true,
        message: `Email resent to ${order.email}`,
        orderId,
        messageId: emailResult.id,
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
  }
}
