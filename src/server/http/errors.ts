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

export const jsonError = (
  status: number,
  requestId: string,
  code: string,
  message: string,
  details?: ValidationIssue[]
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

  return Response.json(body, { status });
};

export const jsonSuccess = <T>(status: number, requestId: string, data: T) => {
  const body: SuccessPayload<T> = {
    ok: true,
    data,
    meta: { requestId },
  };

  return Response.json(body, { status });
};
