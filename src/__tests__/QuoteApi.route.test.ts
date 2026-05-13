import { describe, expect, it } from 'vitest';
import { POST } from '@/app/api/v1/quotes/route';

const validPayload = {
  name: 'Carlos Perez',
  email: 'carlos@empresa.com',
  phone: '+34 600 123 123',
  companyName: 'Camiprint SL',
  quantity: '50-99',
  message: 'Necesitamos camisetas para evento corporativo',
};

describe('POST /api/v1/quotes', () => {
  it('responde 201 con contrato de exito cuando el payload es valido', async () => {
    const request = new Request('http://localhost/api/v1/quotes', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'req_test_ok',
      },
      body: JSON.stringify(validPayload),
    });

    const response = await POST(request);
    const body = (await response.json()) as {
      ok: boolean;
      data: { id: string; status: string; createdAt: string };
      meta: { requestId: string };
    };

    expect(response.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.data.id).toMatch(/^q_/);
    expect(body.data.status).toBe('received');
    expect(body.data.createdAt).toMatch(/\d{4}-\d{2}-\d{2}T/);
    expect(body.meta.requestId).toBe('req_test_ok');
  });

  it('responde 422 con details por campo cuando hay validacion fallida', async () => {
    const request = new Request('http://localhost/api/v1/quotes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...validPayload,
        email: 'correo_invalido',
        quantity: '999',
      }),
    });

    const response = await POST(request);
    const body = (await response.json()) as {
      ok: boolean;
      error: {
        code: string;
        message: string;
        details: Array<{ field: string; issue: string }>;
      };
      meta: { requestId: string };
    };

    expect(response.status).toBe(422);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details.some((d) => d.field === 'email')).toBe(true);
    expect(body.error.details.some((d) => d.field === 'quantity')).toBe(true);
    expect(body.meta.requestId).toMatch(/^req_/);
  });
});
