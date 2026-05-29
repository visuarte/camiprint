import { NextRequest } from 'next/server';
import { prisma } from '@/server/db';
import { serverError, unauthorized, verifyAdminToken, successResponse } from '../../auth-utils';
import { cleanupReplacedProductImage } from '@/server/products/image-utils';

type PatchProductPayload = {
  name?: unknown;
  description?: unknown;
  price?: unknown;
  imageUrl?: unknown;
  size?: unknown;
  quantity?: unknown;
};

function parseOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.trim();
}

function parseOptionalNullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  return value.trim();
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function parseOptionalNonNegativeInteger(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.floor(parsed);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminToken(req)) {
    return unauthorized();
  }

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        size: true,
        quantity: true,
        createdAt: true,
      },
    });

    if (!product) {
      return successResponse({ error: 'Product not found' }, 404);
    }

    return successResponse({ ok: true, product });
  } catch (error) {
    return serverError(error, 'Failed to fetch product');
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminToken(req)) {
    return unauthorized();
  }

  try {
    const { id } = await params;
    const body: PatchProductPayload = await req.json().catch(() => ({}));
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!existing) {
      return successResponse({ error: 'Product not found' }, 404);
    }

    const updateData: {
      name?: string;
      description?: string | null;
      price?: number;
      imageUrl?: string | null;
      size?: string;
      quantity?: number;
    } = {};

    if (body.name !== undefined) {
      const name = parseOptionalString(body.name);
      if (!name) return successResponse({ error: 'Invalid product name' }, 422);
      updateData.name = name;
    }

    if (body.description !== undefined) {
      const description = parseOptionalNullableString(body.description);
      if (description === undefined) return successResponse({ error: 'Invalid description' }, 422);
      updateData.description = description;
    }

    if (body.imageUrl !== undefined) {
      const imageUrl = parseOptionalNullableString(body.imageUrl);
      if (imageUrl === undefined) return successResponse({ error: 'Invalid imageUrl' }, 422);
      updateData.imageUrl = imageUrl;
    }

    if (body.price !== undefined) {
      const price = parseOptionalNumber(body.price);
      if (price === undefined || price <= 0) return successResponse({ error: 'Invalid price' }, 422);
      updateData.price = price;
    }

    if (body.size !== undefined) {
      const size = parseOptionalString(body.size);
      if (!size) return successResponse({ error: 'Invalid size' }, 422);
      updateData.size = size;
    }

    if (body.quantity !== undefined) {
      const quantity = parseOptionalNonNegativeInteger(body.quantity);
      if (quantity === undefined) return successResponse({ error: 'Invalid quantity' }, 422);
      updateData.quantity = quantity;
    }

    if (Object.keys(updateData).length === 0) {
      return successResponse({ error: 'No valid fields to update' }, 422);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        size: true,
        quantity: true,
        createdAt: true,
      },
    });

    if (body.imageUrl !== undefined) {
      await cleanupReplacedProductImage(existing.imageUrl, updated.imageUrl);
    }

    return successResponse({ ok: true, product: updated });
  } catch (error) {
    return serverError(error, 'Failed to update product');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminToken(req)) {
    return unauthorized();
  }

  try {
    const { id } = await params;
    const deleted = await prisma.product.delete({
      where: { id },
      select: { id: true, imageUrl: true },
    });
    await cleanupReplacedProductImage(deleted.imageUrl, null, 'deleted');
    return successResponse({ ok: true, id });
  } catch (error) {
    return serverError(error, 'Failed to delete product');
  }
}