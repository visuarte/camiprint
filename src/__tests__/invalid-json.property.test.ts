/**
 * Epic 10.7 – Property test: JSON malformados siempre retornan 422
 *
 * Genera 50 strings de JSON con distintos tipos de malformaciones y verifica
 * que el endpoint POST /api/v1/quotes siempre responda 422 VALIDATION_ERROR.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { POST } from '@/app/api/v1/quotes/route';
import { __resetQuoteRateLimitForTests } from '@/server/http/rate-limit';
import { __resetMetricsForTests } from '@/server/observability/metrics';
import { __resetQuotesStorageForTests } from '@/server/quotes/repository';
import { __resetQuotesCircuitBreakerForTests } from '@/server/quotes/service';

// 50 strings de JSON malformados con distintas categorías de error
const MALFORMED_JSON_STRINGS: string[] = [
  // Sin comillas en keys
  '{campo: valor}',
  '{name: "test", email: missing_quotes}',
  // Comillas sin cerrar
  '{"name": "test}',
  '{"email": "test@corp.com"',
  '{"name": "test", "email": }',
  // Caracteres de control
  '{"name": "te\x00st"}',
  '{"email": "a\x1Fb@c.com"}',
  // Comas extra
  '{"name": "x",}',
  '{"a": 1, "b": 2,}',
  '{,}',
  // Corchetes / llaves sin cerrar
  '{"name": "x"',
  '[{"name": "x"}',
  '{"arr": [1, 2, 3}',
  '{"obj": {"nested": "val"}',
  // Strings vacíos / solo espacios
  '',
  '   ',
  '\t\n',
  // Tokens inválidos
  'undefined',
  'NaN',
  'Infinity',
  '-Infinity',
  'function() {}',
  'null undefined',
  // Arrays en lugar de objetos
  '[]',
  '[1, 2, 3]',
  '["a", "b"]',
  // Valores primitivos
  '"solo un string"',
  '42',
  'true',
  'false',
  // JSON con comentarios (no válido en JSON estándar)
  '{"name": "x" /* comentario */}',
  '{"name": "x"} // trailing',
  // Escape sequences inválidas
  '{"name": "\\q"}',
  '{"name": "\\x41"}',
  // Objetos con keys duplicadas y sintaxis rota
  '{"a": 1 "b": 2}',
  '{a: 1, b: 2}',
  "{'a': 1}",
  // Truncado en el medio
  '{"name": "Carlos Perez", "email":',
  '{"name": "Carlos", "email": "carlos@',
  '{"name": "A", "email": "a@b.com", "phone":',
  // Null bytes
  '\0',
  '{\0}',
  // Unicode roto (UTF-16 surrogate sin par)
  '{"name": "\uD800"}',
  '{"name": "\uDFFF"}',
  // Números en posición de objeto
  '123abc',
  '1e999999',
  // Mezcla de delimitadores
  '{"name": "x")',
  '["a": 1]',
  '{name: "x", [email]: "y"}',
  '{"name" = "x"}',
];

describe('POST /api/v1/quotes – propiedad: JSON malformado siempre retorna 422 (50 casos)', () => {
  beforeEach(async () => {
    __resetQuoteRateLimitForTests();
    __resetMetricsForTests();
    __resetQuotesCircuitBreakerForTests();
    await __resetQuotesStorageForTests();
  });

  it.each(MALFORMED_JSON_STRINGS.map((s, i) => [i, s] as [number, string]))(
    'caso %i retorna 422 VALIDATION_ERROR',
    async (_index, malformedBody) => {
      const request = new Request('http://localhost/api/v1/quotes', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-request-id': `req_malformed_${_index}`,
        },
        body: malformedBody,
      });

      const response = await POST(request);
      const body = (await response.json()) as {
        ok: boolean;
        error: { code: string };
        meta: { requestId: string };
      };

      expect(response.status).toBe(422);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.meta.requestId).toBe(`req_malformed_${_index}`);
    }
  );
});
