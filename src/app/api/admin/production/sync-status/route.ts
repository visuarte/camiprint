import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { createGorFactory } from '@/server/integrations/gor-factory/factory';
import { verifyAdminToken } from '@/app/api/admin/auth-utils';

export async function POST(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 422 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // For Gor Factory orders, poll the API for latest status
    if (order.productionSource === 'gor_factory' && order.gorOrderRef) {
      try {
        const gor = createGorFactory()
        const docs = await gor.documents.getAll({
          doctype: 'tracking',
          docnum: order.gorOrderRef,
        })
        if (docs.success && docs.data) {
          // Update tracking info from Gor response
          const trackingData = docs.data as any
          if (trackingData.trackingNumber) {
            await prisma.order.update({
              where: { id: orderId },
              data: {
                trackingNumber: trackingData.trackingNumber,
                trackingCarrier: trackingData.carrier || 'Gor Factory',
                shippedAt: trackingData.shippedAt ? new Date(trackingData.shippedAt) : undefined,
                status: trackingData.status === 'delivered' ? 'delivered' : 'shipped',
              },
            })
          }
        }
      } catch {
        // GOR API unavailable, keep current state
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
