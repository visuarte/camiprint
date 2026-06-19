import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import pino from 'pino';

const webhookLog = pino({ name: 'gor-tracking', level: process.env.LOG_LEVEL || 'info' });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderRef, trackingNumber, carrier, status } = body;

    webhookLog.info({ body }, 'Gor Factory tracking webhook received');

    if (!orderRef) {
      return NextResponse.json({ ok: false, error: 'Missing orderRef' }, { status: 400 });
    }

    // Find order by gorOrderRef or local order ID
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { gorOrderRef: orderRef },
          { id: orderRef },
        ],
      },
    });

    if (!order) {
      webhookLog.warn({ orderRef }, 'Order not found for tracking update');
      return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 });
    }

    const updateData: any = {};

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
      updateData.shippedAt = new Date();
      updateData.status = 'shipped';
    }
    if (carrier) updateData.trackingCarrier = carrier;
    if (status === 'delivered') updateData.status = 'delivered';

    if (Object.keys(updateData).length > 0) {
      await prisma.order.update({
        where: { id: order.id },
        data: updateData,
      });
      webhookLog.info({ orderId: order.id, ...updateData }, 'Order tracking updated');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const err = error as Error;
    webhookLog.error({ error: err.message }, 'Gor Factory webhook error');
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
