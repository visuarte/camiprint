import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { createHash, timingSafeEqual } from 'node:crypto';
import pino from 'pino';

const webhookLog = pino({ name: 'gor-tracking', level: process.env.LOG_LEVEL || 'info' });

function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = createHash('sha256').update(payload + secret).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const bodyText = await request.text();
  const signature = request.headers.get('x-gor-signature');
  const sharedSecret = process.env.GOR_WEBHOOK_SECRET || '';

  if (sharedSecret && !verifySignature(bodyText, signature, sharedSecret)) {
    webhookLog.warn({ signature }, 'Invalid Gor Factory webhook signature');
    return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const body = JSON.parse(bodyText);
    const { orderRef, trackingNumber, carrier, status } = body;

    webhookLog.info({ body, ip: request.headers.get('x-forwarded-for') }, 'Gor Factory tracking webhook received');

    if (!orderRef) {
      return NextResponse.json({ ok: false, error: 'Missing orderRef' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { OR: [{ gorOrderRef: orderRef }, { id: orderRef }] },
    });

    if (!order) {
      webhookLog.warn({ orderRef }, 'Order not found for tracking update');
      return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
      updateData.shippedAt = new Date();
      updateData.status = 'shipped';
    }
    if (carrier) updateData.trackingCarrier = carrier;
    if (status === 'delivered') updateData.status = 'delivered';

    if (Object.keys(updateData).length > 0) {
      await prisma.order.update({ where: { id: order.id }, data: updateData });
      webhookLog.info({ orderId: order.id, ...updateData }, 'Order tracking updated');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const err = error as Error;
    webhookLog.error({ error: err.message }, 'Gor Factory webhook error');
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
