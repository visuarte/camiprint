// =============================================================================
// API: Revisión técnica — pending + approve
// =============================================================================

import { NextResponse } from 'next/server';
import {
  getPendingReviewOrders,
  approveProductionOrder,
  getProductionOrderDetail,
} from '@/server/production/workflow';
import type { TechnicianReviewInput } from '@/server/production/workflow';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      const order = await getProductionOrderDetail(id);
      if (!order) return NextResponse.json({ ok: false, error: 'Orden no encontrada' }, { status: 404 });
      return NextResponse.json({ ok: true, data: order });
    }

    const pending = await getPendingReviewOrders();
    return NextResponse.json({ ok: true, data: pending });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TechnicianReviewInput;

    if (!body.productionOrderId || !body.technicianId || !body.lines?.length) {
      return NextResponse.json(
        { ok: false, error: 'Faltan campos requeridos: productionOrderId, technicianId, lines' },
        { status: 400 },
      );
    }

    const result = await approveProductionOrder(body);
    return NextResponse.json({ ok: true, data: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
