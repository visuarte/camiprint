/**
 * GET /api/v1/production/queues
 *
 * Consulta la cola de trabajo con filtros opcionales:
 * - department: PREPRESS | PRINTING | QA | SHIPPING
 * - queueStatus: WAITING | ACTIVE | BLOCKED | DONE
 * - limit: número de items por página (default 20, max 100)
 * - cursor: id del último item de la página anterior
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { ProductionEngine } from '@/engine/production/production-engine';
import { getProductionRepository } from '@/server/production/factory';
import { type Department, type QueueStatus } from '@/engine/production/types';

const QueueQuerySchema = z.object({
  department: z.enum(['PREPRESS', 'PRINTING', 'QA', 'SHIPPING']).optional(),
  status: z.enum(['WAITING', 'ACTIVE', 'BLOCKED', 'DONE']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const requestId = `req_${randomUUID().replace(/-/g, '').slice(0, 16)}`;

  const { searchParams } = request.nextUrl;
  const rawParams = Object.fromEntries(searchParams.entries());

  const parsed = QueueQuerySchema.safeParse(rawParams);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Parámetros de consulta inválidos',
          details: parsed.error.flatten().fieldErrors,
        },
        meta: { requestId },
      },
      { status: 422 },
    );
  }

  const { department, status, limit, cursor } = parsed.data;

  const repo = getProductionRepository();
  const engine = new ProductionEngine(repo);

  const result = await engine.getDepartmentQueue({
    department: department as Department | undefined,
    status: status as QueueStatus | undefined,
    limit,
    cursor,
  });

  return NextResponse.json(
    { ok: true, data: result.data, meta: { requestId } },
    { status: 200 },
  );
}
