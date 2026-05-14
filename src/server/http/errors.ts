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
