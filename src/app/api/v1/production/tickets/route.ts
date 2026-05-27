/**
 * POST /api/v1/production/tickets
 *
 * Crea un JobTicket para una ProductionOrder, enruta al departamento correcto
 * y añade el ticket a la cola de trabajo.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { ProductionEngine } from '@/engine/production/production-engine';
import { getProductionRepository } from '@/engine/production/repository';

const TicketPayloadSchema = z.object({
  productionOrderId: z.string().min(1),
  garmentType: z.string().min(1),
  printTechnique: z.string().min(1),
  colorCount: z.number().int().min(1).max(12),
  quantity: z.number().int().positive(),
  dueDate: z.string().datetime({ message: 'dueDate debe ser ISO 8601' }),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const requestId = `req_${randomUUID().replace(/-/g, '').slice(0, 16)}`;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_JSON', message: 'Body no es JSON válido' }, meta: { requestId } },
      { status: 400 },
    );
  }

  const parsed = TicketPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payload inválido',
          details: parsed.error.flatten().fieldErrors,
        },
        meta: { requestId },
      },
      { status: 422 },
    );
  }

  const { data } = parsed;
  const repo = getProductionRepository();
  const engine = new ProductionEngine(repo);

  const result = await engine.createJobTicket(
    {
      ...data,
      dueDate: new Date(data.dueDate),
      notes: data.notes,
    },
    () => repo.nextTicketSequence(),
  );

  if (!result.ok) {
    const isNotFound = result.errors?.some((e) => e.includes('no encontrada'));
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: isNotFound ? 'ORDER_NOT_FOUND' : 'ENGINE_ERROR',
          message: result.errors?.join('; '),
        },
        meta: { requestId },
      },
      { status: isNotFound ? 404 : 422 },
    );
  }

  return NextResponse.json(
    { ok: true, data: result.data, meta: { requestId } },
    { status: 201 },
  );
}
