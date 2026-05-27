/**
 * POST /api/v1/production/uploads
 *
 * Recibe metadatos de un DesignAsset ya subido a storage externo (S3/Vercel Blob).
 * Valida con Zod, delega al Engine para registrar el asset y actualizar la orden.
 *
 * Nota: el upload binario real a S3/storage lo gestiona el cliente directamente
 * (presigned URL). Este endpoint recibe los metadatos post-upload.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { ProductionEngine } from '@/engine/production/production-engine';
import { ALLOWED_EXTENSIONS, type AllowedExtension } from '@/engine/production/types';
import { validateAssetExtension } from '@/engine/production/validators';
import { getProductionRepository } from '@/engine/production/repository';

const UploadPayloadSchema = z.object({
  productionOrderId: z.string().min(1),
  originalFilename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive().max(50 * 1024 * 1024),
  storageKey: z.string().min(1),
  checksumSha256: z.string().regex(/^[a-f0-9]{64}$/, 'SHA-256 hex inválido'),
  uploadedBy: z.string().min(1),
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

  const parsed = UploadPayloadSchema.safeParse(body);
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

  // Validar extensión de negocio (Engine validator)
  const extResult = validateAssetExtension(data.originalFilename);
  if (!extResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'INVALID_EXTENSION', message: extResult.error },
        meta: { requestId },
      },
      { status: 422 },
    );
  }

  const repo = getProductionRepository();
  const engine = new ProductionEngine(repo);

  const result = await engine.registerDesignAsset({
    ...data,
    extension: extResult.extension as AllowedExtension,
  });

  if (!result.ok) {
    const isNotFound = result.errors?.some((e) => e.includes('no encontrada'));
    return NextResponse.json(
      {
        ok: false,
        error: { code: isNotFound ? 'ORDER_NOT_FOUND' : 'ENGINE_ERROR', message: result.errors?.join('; ') },
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
