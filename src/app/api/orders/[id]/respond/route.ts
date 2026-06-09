import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { jsonError, jsonSuccess } from '@/server/http/errors';
import { getOrCreateRequestId } from '@/server/http/request-id';
import { verifyAdminToken } from '@/app/api/admin/auth-utils';

const RespondSchema = z.object({
  message: z.string().min(1),
  status: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = getOrCreateRequestId(req);

  if (!(await verifyAdminToken(req))) {
    return jsonError(401, requestId, 'UNAUTHORIZED', 'Token de autorización inválido o ausente.');
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return jsonError(422, requestId, 'INVALID_JSON', 'El body no es JSON válido.');
  }

  const parsed = RespondSchema.safeParse(rawBody);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({ field: issue.path.join('.'), issue: issue.message }));
    return jsonError(422, requestId, 'VALIDATION_ERROR', 'Payload inválido.', details);
  }

  const { message, status } = parsed.data;
  const { id } = await params;
  if (!id) return jsonError(400, requestId, 'MISSING_ID', 'Order ID required.');

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return jsonError(404, requestId, 'ORDER_NOT_FOUND', 'Order not found.');

    await prisma.order.update({
      where: { id },
      data: ({
        responseMessage: message,
        respondedBy: process.env.ADMIN_RESPONDER_NAME ?? 'admin',
        respondedAt: new Date(),
        ...(status ? { status } : {}),
      } as any),
    });

    // Optionally enqueue or trigger side effects here (emails, notifications)

    return jsonSuccess(200, requestId, { ok: true });
  } catch (error) {
    console.error('[orders/respond] failed', {
      requestId,
      orderId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    return jsonError(500, requestId, 'INTERNAL_ERROR', 'Error al actualizar la orden.');
  }
}
