import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockFindMany,
  mockCount,
  mockAggregate,
  mockCreate,
  mockFindUnique,
  mockUpdate,
  mockDelete,
} = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockAggregate: vi.fn(),
  mockCreate: vi.fn(),
  mockFindUnique: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock('../src/server/db', () => ({
  prisma: {
    product: {
      findMany: mockFindMany,
      count: mockCount,
      aggregate: mockAggregate,
      create: mockCreate,
      findUnique: mockFindUnique,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

import { GET as GET_PRODUCTS, POST as POST_PRODUCTS } from '../src/app/api/admin/products/route';
import {
  GET as GET_PRODUCT_BY_ID,
  PATCH as PATCH_PRODUCT_BY_ID,
  DELETE as DELETE_PRODUCT_BY_ID,
} from '../src/app/api/admin/products/[id]/route';

const validToken = 'test-admin-token';

function makeRequest(overrides?: {
  authHeader?: string | null;
  cookieToken?: string | null;
  body?: unknown;
  url?: string;
}) {
  const headers = new Map<string, string>();
  if (overrides?.authHeader) headers.set('authorization', overrides.authHeader);

  return {
    url: overrides?.url ?? 'http://localhost/api/admin/products',
    headers: {
      get: (key: string) => headers.get(key.toLowerCase()) ?? null,
    },
    cookies: {
      get: (name: string) => {
        if (name === 'admin_token' && overrides?.cookieToken) {
          return { value: overrides.cookieToken };
        }
        return undefined;
      },
    },
    json: async () => overrides?.body ?? {},
  } as any;
}

describe('Admin Products API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_AUTH_TOKEN = validToken;
  });

  it('GET /api/admin/products returns 401 without auth', async () => {
    const req = makeRequest();
    const res = await GET_PRODUCTS(req);

    expect(res.status).toBe(401);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it('GET /api/admin/products returns products when authenticated', async () => {
    mockAggregate.mockResolvedValue({ _sum: { quantity: 5 } });
    mockCount.mockResolvedValueOnce(1).mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    mockFindMany.mockResolvedValueOnce([
      { id: 'p1', name: 'Producto 1', price: 10.5, size: 'M', quantity: 5 },
    ]);

    const req = makeRequest({ authHeader: `Bearer ${validToken}` });
    const res = await GET_PRODUCTS(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.total).toBe(1);
    expect(body.pagination).toMatchObject({ page: 1, limit: 12, total: 1, totalPages: 1 });
    expect(body.summary).toMatchObject({ totalProducts: 1, totalUnits: 5, lowStock: 1, outOfStock: 0 });
    expect(mockFindMany).toHaveBeenCalled();
  });

  it('POST /api/admin/products validates payload', async () => {
    const req = makeRequest({
      authHeader: `Bearer ${validToken}`,
      body: { name: '', price: -1 },
    });

    const res = await POST_PRODUCTS(req);
    expect(res.status).toBe(422);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('POST /api/admin/products creates product with valid payload', async () => {
    mockCreate.mockResolvedValueOnce({
      id: 'p2',
      name: 'Nuevo producto',
      description: null,
      price: 19.99,
      imageUrl: null,
      size: 'M',
      quantity: 3,
      createdAt: new Date().toISOString(),
    });

    const req = makeRequest({
      authHeader: `Bearer ${validToken}`,
      body: { name: 'Nuevo producto', price: 19.99, quantity: 3 },
    });

    const res = await POST_PRODUCTS(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.product.name).toBe('Nuevo producto');
    expect(mockCreate).toHaveBeenCalled();
  });

  it('GET /api/admin/products/[id] returns 404 when product does not exist', async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const req = makeRequest({ authHeader: `Bearer ${validToken}` });
    const res = await GET_PRODUCT_BY_ID(req, { params: Promise.resolve({ id: 'missing' }) });

    expect(res.status).toBe(404);
  });

  it('PATCH /api/admin/products/[id] updates product', async () => {
    mockFindUnique.mockResolvedValueOnce({ imageUrl: null });
    mockUpdate.mockResolvedValueOnce({
      id: 'p3',
      name: 'Producto editado',
      description: null,
      price: 15,
      imageUrl: null,
      size: 'L',
      quantity: 8,
      createdAt: new Date().toISOString(),
    });

    const req = makeRequest({
      authHeader: `Bearer ${validToken}`,
      body: { name: 'Producto editado', quantity: 8 },
      url: 'http://localhost/api/admin/products/p3',
    });
    const res = await PATCH_PRODUCT_BY_ID(req, { params: Promise.resolve({ id: 'p3' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.product.id).toBe('p3');
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('DELETE /api/admin/products/[id] deletes product', async () => {
    mockDelete.mockResolvedValueOnce({ id: 'p4', imageUrl: null });

    const req = makeRequest({
      authHeader: `Bearer ${validToken}`,
      url: 'http://localhost/api/admin/products/p4',
    });
    const res = await DELETE_PRODUCT_BY_ID(req, { params: Promise.resolve({ id: 'p4' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.id).toBe('p4');
    expect(mockDelete).toHaveBeenCalledWith({
      where: { id: 'p4' },
      select: { id: true, imageUrl: true },
    });
  });
});