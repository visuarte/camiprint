import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  sanitizeQuotePayloadForLogs,
  logRequestInfo,
  logRequestWarn,
  logRequestError,
  logOperationalEvent,
} from '../server/observability/logger';

// ── helpers ──────────────────────────────────────────────────────────────────

const baseRequestCtx = () => ({
  requestId: 'req_test_logger',
  method: 'POST',
  path: '/api/v1/quotes',
  statusCode: 200,
  durationMs: 10,
});

const baseErrorCtx = () => ({
  ...baseRequestCtx(),
  errorCode: 'INTERNAL_ERROR',
  errorMessage: 'Something went wrong',
  errorStack: 'Error: Something went wrong\n    at foo.ts:1:1',
});

// ── sanitizeQuotePayloadForLogs ───────────────────────────────────────────────

describe('sanitizeQuotePayloadForLogs', () => {
  it('enmascara email: muestra solo primeros 3 chars del local-part', () => {
    const result = sanitizeQuotePayloadForLogs({
      name: 'John',
      email: 'juanito@example.com',
    });
    expect(result.email).toBe('jua***@ex***.com');
    expect(result.name).toBe('John');
  });

  it('enmascara email sin TLD (solo local@dominio)', () => {
    const result = sanitizeQuotePayloadForLogs({ email: 'abc@nodot' });
    expect(typeof result.email).toBe('string');
    expect(result.email).toContain('***');
  });

  it('enmascara email sin dominio (string sin @)', () => {
    const result = sanitizeQuotePayloadForLogs({ email: 'sinArroba' });
    // maskEmail maneja el caso sin @
    expect(typeof result.email).toBe('string');
    expect(result.email).toContain('***');
  });

  it('enmascara teléfono: muestra solo últimos 4 dígitos', () => {
    const result = sanitizeQuotePayloadForLogs({ phone: '+52 55 1234 5678' });
    expect(result.phone).toBe('***5678');
  });

  it('enmascara teléfono corto (<=4 chars) con ***', () => {
    const result = sanitizeQuotePayloadForLogs({ phone: '123' });
    expect(result.phone).toBe('***');
  });

  it('enmascara teléfono exactamente 4 chars con ***', () => {
    const result = sanitizeQuotePayloadForLogs({ phone: '1234' });
    expect(result.phone).toBe('***');
  });

  it('no modifica campos que no son email ni phone', () => {
    const input = { name: 'Empresa', quantity: '10-24', message: 'hola' };
    const result = sanitizeQuotePayloadForLogs(input);
    expect(result).toEqual(input);
  });

  it('no falla si email no es string', () => {
    const result = sanitizeQuotePayloadForLogs({ email: 42 as unknown as string });
    expect(result.email).toBe(42);
  });

  it('no falla si phone no es string', () => {
    const result = sanitizeQuotePayloadForLogs({ phone: null as unknown as string });
    expect(result.phone).toBeNull();
  });
});

// ── logRequestInfo ────────────────────────────────────────────────────────────

describe('logRequestInfo', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('escribe a console.info con el mensaje y contexto', () => {
    logRequestInfo('Quote created', baseRequestCtx());
    expect(console.info).toHaveBeenCalledOnce();
    const raw = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    expect(parsed.requestId).toBe('req_test_logger');
    expect(parsed.statusCode).toBe(200);
    expect(parsed.msg).toBe('Quote created');
  });

  it('incluye extra fields cuando se pasan', () => {
    logRequestInfo('Quote created', baseRequestCtx(), { source: 'test' });
    const raw = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    expect(parsed.source).toBe('test');
  });
});

// ── logRequestWarn ────────────────────────────────────────────────────────────

describe('logRequestWarn', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('escribe a console.warn con nivel warn', () => {
    logRequestWarn('Rate limited', { ...baseRequestCtx(), statusCode: 429 });
    expect(console.warn).toHaveBeenCalledOnce();
    const raw = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    expect(parsed.level).toBe('warn');
    expect(parsed.msg).toBe('Rate limited');
  });
});

// ── logRequestError ───────────────────────────────────────────────────────────

describe('logRequestError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('escribe a console.error con errorCode y errorMessage', () => {
    logRequestError('Service failed', baseErrorCtx());
    expect(console.error).toHaveBeenCalledOnce();
    const raw = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    expect(parsed.errorCode).toBe('INTERNAL_ERROR');
    expect(parsed.errorMessage).toBe('Something went wrong');
    expect(parsed.level).toBe('error');
  });

  it('no expone stackTrace en entorno test (NODE_ENV=test)', () => {
    logRequestError('Service failed', baseErrorCtx());
    const raw = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    // stackTrace solo se agrega en development, no en test
    expect(parsed.stackTrace).toBeUndefined();
  });
});

// ── logOperationalEvent ───────────────────────────────────────────────────────

describe('logOperationalEvent', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('log a nivel info', () => {
    logOperationalEvent('info', 'Circuit closed', { circuit: 'db' });
    expect(console.info).toHaveBeenCalledOnce();
    const raw = (console.info as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    expect(parsed.level).toBe('info');
    expect(parsed.msg).toBe('Circuit closed');
    expect(parsed.circuit).toBe('db');
  });

  it('log a nivel warn', () => {
    logOperationalEvent('warn', 'Circuit opened');
    expect(console.warn).toHaveBeenCalledOnce();
    const raw = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    expect(parsed.level).toBe('warn');
  });

  it('log a nivel error', () => {
    logOperationalEvent('error', 'Unhandled exception', { detail: 'x' });
    expect(console.error).toHaveBeenCalledOnce();
    const raw = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    expect(parsed.level).toBe('error');
    expect(parsed.detail).toBe('x');
  });

  it('funciona sin payload', () => {
    logOperationalEvent('info', 'Startup complete');
    expect(console.info).toHaveBeenCalledOnce();
  });
});
