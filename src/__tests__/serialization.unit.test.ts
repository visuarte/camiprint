/**
 * Epic 10.6 – Property test: round-trip serialization de QuoteLeadRecord
 *
 * Genera 100 registros QuoteLeadRecord-shaped, los serializa a JSON y los
 * parsea de vuelta verificando que todos los campos sean equivalentes.
 */
import { describe, expect, it } from 'vitest';
import type { QuoteLeadRecord, QuantityRange } from '@/server/quotes/types';
import { QUANTITY_VALUES } from '@/server/quotes/types';

const NAMES = ['Ana García', 'Carlos López', 'María Pérez', 'Juan Martínez', 'Laura Sánchez'];
const EMAILS = ['ana@corp.es', 'carlos@empresa.com', 'maria@tienda.net', 'juan@pyme.es', 'laura@startup.io'];
const PHONES = ['+34 600 000 001', '+34 611 222 333', '+34 655 444 555', '+34 677 888 999', '+34 699 000 111'];
const COMPANIES = ['Moda SL', 'Eventos SA', 'Promo Corp', 'Retail Ltda', 'Brand Factory'];
const MESSAGES: (string | undefined)[] = [
  'Necesitamos camisetas para evento',
  'Queremos logos bordados',
  undefined,
  '',
  'Urgente para feria',
];

function buildRecord(index: number): QuoteLeadRecord {
  const quantity = QUANTITY_VALUES[index % QUANTITY_VALUES.length] as QuantityRange;
  const now = new Date(Date.now() + index * 1000).toISOString();
  const record: QuoteLeadRecord = {
    id: `q_test_${String(index).padStart(4, '0')}`,
    name: NAMES[index % NAMES.length],
    email: EMAILS[index % EMAILS.length],
    phone: PHONES[index % PHONES.length],
    companyName: COMPANIES[index % COMPANIES.length],
    quantity,
    message: MESSAGES[index % MESSAGES.length],
    source: 'landing-contact-form',
    status: 'received',
    createdAt: now,
    updatedAt: now,
  };
  return record;
}

describe('QuoteLeadRecord – round-trip JSON serialization (100 records)', () => {
  it('todos los campos son equivalentes tras JSON.stringify → JSON.parse', () => {
    for (let i = 0; i < 100; i++) {
      const original = buildRecord(i);
      const serialized = JSON.stringify(original);
      const parsed = JSON.parse(serialized) as QuoteLeadRecord;

      expect(parsed.id).toBe(original.id);
      expect(parsed.name).toBe(original.name);
      expect(parsed.email).toBe(original.email);
      expect(parsed.phone).toBe(original.phone);
      expect(parsed.companyName).toBe(original.companyName);
      expect(parsed.quantity).toBe(original.quantity);
      expect(parsed.message).toBe(original.message);
      expect(parsed.source).toBe(original.source);
      expect(parsed.status).toBe(original.status);
      expect(parsed.createdAt).toBe(original.createdAt);
      expect(parsed.updatedAt).toBe(original.updatedAt);
    }
  });

  it('JSON.stringify produce un string parseable sin lanzar excepciones', () => {
    for (let i = 0; i < 100; i++) {
      const record = buildRecord(i);
      expect(() => JSON.parse(JSON.stringify(record))).not.toThrow();
    }
  });

  it('los campos de fecha son strings ISO 8601 validos', () => {
    const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    for (let i = 0; i < 100; i++) {
      const record = buildRecord(i);
      const parsed = JSON.parse(JSON.stringify(record)) as QuoteLeadRecord;
      expect(parsed.createdAt).toMatch(ISO_RE);
      expect(parsed.updatedAt).toMatch(ISO_RE);
    }
  });

  it('los valores de quantity son siempre miembros validos del union type', () => {
    const validValues = new Set<string>(QUANTITY_VALUES);
    for (let i = 0; i < 100; i++) {
      const record = buildRecord(i);
      const parsed = JSON.parse(JSON.stringify(record)) as QuoteLeadRecord;
      expect(validValues.has(parsed.quantity)).toBe(true);
    }
  });
});
