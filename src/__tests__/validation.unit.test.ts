import { describe, expect, it } from 'vitest';
import { brandConfig } from '@/config/brand';
import { validateQuotePayload } from '@/server/quotes/validation';

const basePayload = {
  name: ' Carlos   Perez ',
  email: 'carlos@empresa.com',
  phone: '+34 600 123 123',
  companyName: ` ${brandConfig.displayName}   SL `,
  quantity: '50-99',
  message: '  Hola   equipo\n necesitamos   cotizacion\x00 ',
};

describe('validateQuotePayload', () => {
  it('acepta payload valido y normaliza campos', () => {
    const result = validateQuotePayload(basePayload);

    expect(result.issues).toHaveLength(0);
    expect(result.data).toBeTruthy();
    expect(result.data?.name).toBe('Carlos Perez');
    expect(result.data?.companyName).toBe(brandConfig.companyExample);
    expect(result.data?.message).toBe('Hola equipo\nnecesitamos cotizacion');
  });

  it('rechaza campos extra en payload', () => {
    const result = validateQuotePayload({
      ...basePayload,
      extra: 'no permitido',
    });

    expect(result.data).toBeUndefined();
    expect(result.issues.some((issue) => issue.field === 'body')).toBe(true);
  });

  it('rechaza email y quantity invalidos', () => {
    const result = validateQuotePayload({
      ...basePayload,
      email: 'correo_invalido',
      quantity: '999',
    });

    expect(result.data).toBeUndefined();
    expect(result.issues.some((issue) => issue.field === 'email')).toBe(true);
    expect(result.issues.some((issue) => issue.field === 'quantity')).toBe(true);
  });

  it('rechaza payload no objeto', () => {
    const result = validateQuotePayload('texto plano');

    expect(result.data).toBeUndefined();
    expect(result.issues).toEqual([
      {
        field: 'body',
        issue: 'Payload invalido, se esperaba un objeto JSON.',
      },
    ]);
  });

  it('rechaza telefono con menos de 7 caracteres validos', () => {
    const result = validateQuotePayload({
      ...basePayload,
      phone: '12345',
    });

    expect(result.data).toBeUndefined();
    expect(result.issues.some((issue) => issue.field === 'phone')).toBe(true);
  });
});
