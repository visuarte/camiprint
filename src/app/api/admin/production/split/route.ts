// =============================================================================
// API: Split de pedido a proveedores (Roly / Stamina)
// =============================================================================

import { NextResponse } from 'next/server';
import { splitOrderToSuppliers } from '@/server/production/workflow';

export async function POST(req: Request) {
  try {
    const { productionOrderId } = await req.json();

    if (!productionOrderId) {
      return NextResponse.json(
        { ok: false, error: 'productionOrderId es requerido' },
        { status: 400 },
      );
    }

    const supplierOrders = await splitOrderToSuppliers(productionOrderId);
    return NextResponse.json({ ok: true, data: supplierOrders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
