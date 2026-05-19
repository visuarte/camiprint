import { describe, it, expect } from 'vitest';
import { getOrCreateRequestId } from '../server/http/request-id';

describe('getOrCreateRequestId', () => {
  it('reutiliza el header x-request-id si existe', () => {
    const req = new Request('http://localhost/api', {
      headers: { 'x-request-id': 'req_existing_123' },
    });
    expect(getOrCreateRequestId(req)).toBe('req_existing_123');
  });

  it('recorta whitespace del header x-request-id', () => {
    const req = new Request('http://localhost/api', {
      headers: { 'x-request-id': '  req_trimmed  ' },
    });
    expect(getOrCreateRequestId(req)).toBe('req_trimmed');
  });

  it('genera un nuevo ID con prefijo req_ cuando no hay header', () => {
    const req = new Request('http://localhost/api');
    const id = getOrCreateRequestId(req);
    expect(id).toMatch(/^req_/);
  });

  it('genera IDs únicos en llamadas sucesivas sin header', () => {
    const req1 = new Request('http://localhost/api');
    const req2 = new Request('http://localhost/api');
    const id1 = getOrCreateRequestId(req1);
    const id2 = getOrCreateRequestId(req2);
    expect(id1).not.toBe(id2);
  });

  it('genera ID de longitud razonable (> 10 chars)', () => {
    const req = new Request('http://localhost/api');
    const id = getOrCreateRequestId(req);
    expect(id.length).toBeGreaterThan(10);
  });

  it('usa fallback cuando crypto.randomUUID no está disponible', () => {
    const original = crypto.randomUUID;
    // @ts-expect-error — forzar fallback path
    crypto.randomUUID = undefined;

    try {
      const req = new Request('http://localhost/api');
      const id = getOrCreateRequestId(req);
      expect(id).toMatch(/^req_/);
    } finally {
      crypto.randomUUID = original;
    }
  });
});
