import { QUANTITY_VALUES, type QuoteRequestInput } from '@/server/quotes/types';
import type { ValidationIssue } from '@/server/http/errors';

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PHONE_RE = /^[+0-9\s()-]{7,30}$/;

const readOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const readRequiredString = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

export const validateQuotePayload = (payload: unknown): { data?: QuoteRequestInput; issues: ValidationIssue[] } => {
  const issues: ValidationIssue[] = [];

  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return {
      issues: [{ field: 'body', issue: 'Payload invalido, se esperaba un objeto JSON.' }],
    };
  }

  const obj = payload as Record<string, unknown>;
  const name = readRequiredString(obj.name);
  const email = readRequiredString(obj.email);
  const phone = readRequiredString(obj.phone);
  const companyName = readRequiredString(obj.companyName);
  const quantity = readRequiredString(obj.quantity);
  const message = readOptionalString(obj.message);

  if (name.length < 2 || name.length > 120) {
    issues.push({ field: 'name', issue: 'Debe tener entre 2 y 120 caracteres.' });
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    issues.push({ field: 'email', issue: 'Formato de email invalido.' });
  }

  if (!PHONE_RE.test(phone)) {
    issues.push({ field: 'phone', issue: 'Debe contener entre 7 y 30 caracteres validos.' });
  }

  if (companyName.length < 1 || companyName.length > 160) {
    issues.push({ field: 'companyName', issue: 'Debe tener entre 1 y 160 caracteres.' });
  }

  if (!QUANTITY_VALUES.includes(quantity as QuoteRequestInput['quantity'])) {
    issues.push({ field: 'quantity', issue: `Valor invalido. Usa: ${QUANTITY_VALUES.join(' | ')}.` });
  }

  if (typeof message === 'string' && message.length > 2000) {
    issues.push({ field: 'message', issue: 'No puede superar 2000 caracteres.' });
  }

  if (issues.length > 0) return { issues };

  return {
    issues,
    data: {
      name,
      email,
      phone,
      companyName,
      quantity: quantity as QuoteRequestInput['quantity'],
      ...(message ? { message } : {}),
    },
  };
};
