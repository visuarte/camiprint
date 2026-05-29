import { del, list, put } from '@vercel/blob';
import { imageSize } from 'image-size';
import path from 'path';
import { rm } from 'fs/promises';
import { randomUUID } from 'crypto';

type ImageRule = {
  label: string;
  maxBytes: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
};

const IMAGE_RULES: Record<string, ImageRule> = {
  '.jpg': { label: 'JPG', maxBytes: 5 * 1024 * 1024, minWidth: 400, minHeight: 400, maxWidth: 7000, maxHeight: 7000 },
  '.jpeg': { label: 'JPEG', maxBytes: 5 * 1024 * 1024, minWidth: 400, minHeight: 400, maxWidth: 7000, maxHeight: 7000 },
  '.png': { label: 'PNG', maxBytes: 6 * 1024 * 1024, minWidth: 400, minHeight: 400, maxWidth: 7000, maxHeight: 7000 },
  '.webp': { label: 'WEBP', maxBytes: 4 * 1024 * 1024, minWidth: 400, minHeight: 400, maxWidth: 7000, maxHeight: 7000 },
  '.avif': { label: 'AVIF', maxBytes: 4 * 1024 * 1024, minWidth: 400, minHeight: 400, maxWidth: 7000, maxHeight: 7000 },
  '.gif': { label: 'GIF', maxBytes: 3 * 1024 * 1024, minWidth: 200, minHeight: 200, maxWidth: 2000, maxHeight: 2000 },
};

type FileLike = {
  name: string;
  type: string;
  size: number;
};

type SoftDeleteReason = 'replaced' | 'deleted';

type BlobSoftDeleteManifest = {
  schema: 'camiart.product-image-soft-delete.v1';
  targetUrl: string;
  createdAt: string;
  deleteAfter: string;
  reason: SoftDeleteReason;
};

type SoftDeleteCleanupOptions = {
  limit?: number;
  dryRun?: boolean;
};

export type SoftDeleteCleanupResult = {
  ok: true;
  dryRun: boolean;
  scanned: number;
  scheduled: number;
  deletedTargets: number;
  deletedManifests: number;
  skippedNotDue: number;
  skippedInvalid: number;
  failed: number;
};

const SOFT_DELETE_PREFIX = 'products-trash/pending/';
const DEFAULT_SOFT_DELETE_GRACE_HOURS = 24;
const DEFAULT_CLEANUP_LIMIT = 200;

export type ProductImageValidationOk = {
  ok: true;
  extension: string;
  width: number;
  height: number;
  maxBytes: number;
  ruleLabel: string;
};

export type ProductImageValidationError = {
  ok: false;
  error: string;
};

export type ProductImageValidationResult = ProductImageValidationOk | ProductImageValidationError;

function resolveExtension(file: FileLike): string | null {
  const ext = path.extname(file.name || '').toLowerCase();
  if (IMAGE_RULES[ext]) return ext;

  const mimeMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif',
  };
  return mimeMap[file.type] ?? null;
}

export function validateProductImageFile(file: FileLike, bytes: Buffer): ProductImageValidationResult {
  const extension = resolveExtension(file);
  if (!extension) {
    return { ok: false, error: 'Formato no soportado. Usa JPG, PNG, WEBP, AVIF o GIF.' };
  }

  const rule = IMAGE_RULES[extension];
  if (file.size <= 0 || file.size > rule.maxBytes) {
    return {
      ok: false,
      error: `${rule.label}: tamaño inválido. Máximo permitido ${Math.floor(rule.maxBytes / (1024 * 1024))}MB.`,
    };
  }

  const dimensions = imageSize(bytes);
  const width = dimensions.width ?? 0;
  const height = dimensions.height ?? 0;

  if (!width || !height) {
    return { ok: false, error: 'No se pudo leer el tamaño de la imagen.' };
  }

  if (
    width < rule.minWidth ||
    height < rule.minHeight ||
    width > rule.maxWidth ||
    height > rule.maxHeight
  ) {
    return {
      ok: false,
      error: `${rule.label}: dimensiones fuera de rango (${rule.minWidth}x${rule.minHeight} - ${rule.maxWidth}x${rule.maxHeight}). Recibido: ${width}x${height}.`,
    };
  }

  return {
    ok: true,
    extension,
    width,
    height,
    maxBytes: rule.maxBytes,
    ruleLabel: rule.label,
  };
}

function isManagedLocalProductImageUrl(url: string): boolean {
  return url.startsWith('/uploads/products/');
}

export function isManagedBlobProductImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const blobHost =
      parsed.hostname.endsWith('.blob.vercel-storage.com') ||
      parsed.hostname.endsWith('.public.blob.vercel-storage.com');
    return blobHost && parsed.pathname.includes('/products/');
  } catch {
    return false;
  }
}

function getSoftDeleteGraceHours(): number {
  const raw = Number(process.env.PRODUCT_IMAGE_SOFT_DELETE_HOURS || DEFAULT_SOFT_DELETE_GRACE_HOURS);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_SOFT_DELETE_GRACE_HOURS;
  return Math.floor(raw);
}

async function scheduleBlobSoftDelete(targetUrl: string, reason: SoftDeleteReason): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN || !isManagedBlobProductImageUrl(targetUrl)) {
    return false;
  }

  const createdAt = new Date();
  const deleteAfter = new Date(createdAt.getTime() + getSoftDeleteGraceHours() * 60 * 60 * 1000);

  const manifest: BlobSoftDeleteManifest = {
    schema: 'camiart.product-image-soft-delete.v1',
    targetUrl,
    createdAt: createdAt.toISOString(),
    deleteAfter: deleteAfter.toISOString(),
    reason,
  };

  const manifestName = `${SOFT_DELETE_PREFIX}${Date.now()}-${randomUUID().slice(0, 8)}.json`;
  await put(manifestName, JSON.stringify(manifest), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });

  return true;
}

async function removeLocalManagedImage(url: string): Promise<void> {
  const relativePath = url.replace(/^\/+/, '');
  const basePath = path.resolve(process.cwd(), 'public', 'uploads', 'products');
  const target = path.resolve(process.cwd(), 'public', relativePath);

  if (!target.startsWith(basePath)) {
    return;
  }

  await rm(target, { force: true });
}

export async function cleanupReplacedProductImage(previousImageUrl: string | null | undefined, nextImageUrl?: string | null, reason: SoftDeleteReason = 'replaced'): Promise<void> {
  if (!previousImageUrl) return;
  if (nextImageUrl && previousImageUrl === nextImageUrl) return;

  try {
    if (isManagedLocalProductImageUrl(previousImageUrl)) {
      await removeLocalManagedImage(previousImageUrl);
      return;
    }

    if (isManagedBlobProductImageUrl(previousImageUrl) && process.env.BLOB_READ_WRITE_TOKEN) {
      const scheduled = await scheduleBlobSoftDelete(previousImageUrl, reason);
      if (!scheduled) {
        await del(previousImageUrl);
      }
    }
  } catch (error) {
    console.warn('[products/image-utils] cleanup failed:', error);
  }
}

function isValidManifest(payload: unknown): payload is BlobSoftDeleteManifest {
  if (!payload || typeof payload !== 'object') return false;
  const asManifest = payload as Partial<BlobSoftDeleteManifest>;
  return (
    asManifest.schema === 'camiart.product-image-soft-delete.v1' &&
    typeof asManifest.targetUrl === 'string' &&
    typeof asManifest.createdAt === 'string' &&
    typeof asManifest.deleteAfter === 'string' &&
    (asManifest.reason === 'replaced' || asManifest.reason === 'deleted')
  );
}

async function fetchManifest(url: string): Promise<BlobSoftDeleteManifest | null> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;
    const payload = await response.json();
    if (!isValidManifest(payload)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function runProductImageSoftDeleteCleanup(options: SoftDeleteCleanupOptions = {}): Promise<SoftDeleteCleanupResult> {
  const limit = Number.isFinite(options.limit) && (options.limit ?? 0) > 0
    ? Math.floor(options.limit as number)
    : DEFAULT_CLEANUP_LIMIT;
  const dryRun = Boolean(options.dryRun);

  const result: SoftDeleteCleanupResult = {
    ok: true,
    dryRun,
    scanned: 0,
    scheduled: 0,
    deletedTargets: 0,
    deletedManifests: 0,
    skippedNotDue: 0,
    skippedInvalid: 0,
    failed: 0,
  };

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return result;
  }

  let cursor: string | undefined;
  while (result.scanned < limit) {
    const pageLimit = Math.min(1000, limit - result.scanned);
    const listed = await list({ prefix: SOFT_DELETE_PREFIX, cursor, limit: pageLimit });

    for (const blob of listed.blobs) {
      if (result.scanned >= limit) break;
      result.scanned += 1;

      const manifest = await fetchManifest(blob.url);
      if (!manifest || !isManagedBlobProductImageUrl(manifest.targetUrl)) {
        result.skippedInvalid += 1;
        if (!dryRun) {
          try {
            await del(blob.url);
            result.deletedManifests += 1;
          } catch {
            result.failed += 1;
          }
        }
        continue;
      }

      result.scheduled += 1;
      const dueAt = new Date(manifest.deleteAfter).getTime();
      if (!Number.isFinite(dueAt) || Date.now() < dueAt) {
        result.skippedNotDue += 1;
        continue;
      }

      if (dryRun) {
        continue;
      }

      try {
        await del(manifest.targetUrl);
        result.deletedTargets += 1;
      } catch {
        // Ignore target deletion failures and still try to remove manifest to avoid infinite retries.
      }

      try {
        await del(blob.url);
        result.deletedManifests += 1;
      } catch {
        result.failed += 1;
      }
    }

    if (!listed.hasMore || !listed.cursor) break;
    cursor = listed.cursor;
  }

  return result;
}