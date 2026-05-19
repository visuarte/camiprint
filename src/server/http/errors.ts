export const getCorsHeaders = (origin: string | null): Record<string, string> => {
  if (!origin) return {};

  const raw = process.env.ALLOWED_ORIGINS?.trim();
  if (!raw) return {};

  const allowed = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (!allowed.includes(origin)) return {};

  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'Content-Type, X-Request-Id',
    'access-control-max-age': '86400',
  };
};

export interface ValidationIssue {
  field: string;
  issue: string;
}

export interface ErrorPayload {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: ValidationIssue[];
  };
  meta: {
    requestId: string;
  };
}

export interface SuccessPayload<T> {
  ok: true;
  data: T;
  meta: {
    requestId: string;
  };
}

const withCommonHeaders = (requestId: string, customHeaders?: HeadersInit): Headers => {
  const headers = new Headers(customHeaders);
  headers.set('x-request-id', requestId);
  headers.set('x-content-type-options', 'nosniff');
  headers.set('x-frame-options', 'DENY');

  if (process.env.NODE_ENV === 'production') {
    headers.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
  }

  return headers;
};

export const withCors = (headers: Headers, origin: string | null): Headers => {
  const cors = getCorsHeaders(origin);
  for (const [key, value] of Object.entries(cors)) {
    headers.set(key, value);
  }
  return headers;
};

export const jsonError = (
  status: number,
  requestId: string,
  code: string,
  message: string,
  details?: ValidationIssue[],
  customHeaders?: HeadersInit
) => {
  const body: ErrorPayload = {
    ok: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    meta: { requestId },
  };

  return Response.json(body, {
    status,
    headers: withCommonHeaders(requestId, customHeaders),
  });
};

export const jsonSuccess = <T>(status: number, requestId: string, data: T, customHeaders?: HeadersInit) => {
  const body: SuccessPayload<T> = {
    ok: true,
    data,
    meta: { requestId },
  };

  return Response.json(body, {
    status,
    headers: withCommonHeaders(requestId, customHeaders),
  });
};
