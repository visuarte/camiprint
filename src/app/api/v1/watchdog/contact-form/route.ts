import { jsonSuccess } from '@/server/http/errors';
import { getOrCreateRequestId } from '@/server/http/request-id';
import { logOperationalEvent } from '@/server/observability/logger';

interface ContactWatchdogPayload {
  type?: string;
  path?: string;
  hash?: string;
  width?: number;
  height?: number;
  display?: string;
  visibility?: string;
  opacity?: string;
  userAgent?: string;
}

const parseBody = async (request: Request): Promise<ContactWatchdogPayload> => {
  try {
    return (await request.json()) as ContactWatchdogPayload;
  } catch {
    return {};
  }
};

const sanitizeText = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, 300);
};

const sanitizeNumber = (value: unknown): number | null => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(20_000, Math.round(value)));
};

export async function POST(request: Request) {
  const requestId = getOrCreateRequestId(request);
  const body = await parseBody(request);

  const payload = {
    type: sanitizeText(body.type, 'unknown_issue'),
    path: sanitizeText(body.path, 'unknown_path'),
    hash: sanitizeText(body.hash, ''),
    width: sanitizeNumber(body.width),
    height: sanitizeNumber(body.height),
    display: sanitizeText(body.display, 'unknown'),
    visibility: sanitizeText(body.visibility, 'unknown'),
    opacity: sanitizeText(body.opacity, 'unknown'),
    userAgent: sanitizeText(body.userAgent, 'unknown_agent').slice(0, 500),
    requestId,
  };

  logOperationalEvent('warn', 'Contact form watchdog reported rendering issue', payload);

  return jsonSuccess(202, requestId, { received: true });
}
