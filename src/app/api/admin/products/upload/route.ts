import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { unauthorized, verifyAdminToken, successResponse, serverError } from '../../auth-utils';
import { validateProductImageFile } from '@/server/products/image-utils';

export const runtime = 'nodejs';

function shouldUseBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminToken(req))) {
    return unauthorized();
  }

  try {
    const formData = await req.formData();
    const fileEntry = formData.get('file');

    if (!(fileEntry instanceof File)) {
      return successResponse({ error: 'Missing file field' }, 422);
    }

    if (!fileEntry.type.startsWith('image/')) {
      return successResponse({ error: 'Only image files are allowed' }, 422);
    }

    const bytes = Buffer.from(await fileEntry.arrayBuffer());
    const validation = validateProductImageFile(fileEntry, bytes);
    if (!validation.ok) {
      return successResponse({ error: validation.error }, 422);
    }

    const extension = validation.extension;

    const filename = `product-${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;
    const relativeDir = path.join('uploads', 'products');
    const blobPath = `products/${filename}`;

    if (shouldUseBlobStorage()) {
      const blob = await put(blobPath, bytes, {
        access: 'public',
        addRandomSuffix: false,
        contentType: fileEntry.type,
      });

      return successResponse(
        {
          ok: true,
          image: {
            url: blob.url,
            filename,
            size: fileEntry.size,
            mimeType: fileEntry.type,
            provider: 'vercel-blob',
            width: validation.width,
            height: validation.height,
          },
        },
        201,
      );
    }

    const absoluteDir = path.join(process.cwd(), 'public', relativeDir);
    await mkdir(absoluteDir, { recursive: true });

    const targetPath = path.join(absoluteDir, filename);
    await writeFile(targetPath, bytes);

    return successResponse({
      ok: true,
      image: {
        url: `/${relativeDir.replace(/\\/g, '/')}/${filename}`,
        filename,
        size: fileEntry.size,
        mimeType: fileEntry.type,
        provider: 'local-public',
        width: validation.width,
        height: validation.height,
      },
    }, 201);
  } catch (error) {
    return serverError(error, 'Failed to upload product image');
  }
}