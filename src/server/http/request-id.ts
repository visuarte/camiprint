const REQUEST_ID_HEADER = 'x-request-id';

const fallbackRequestId = () => `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

export const getOrCreateRequestId = (request: Request): string => {
  const externalRequestId = request.headers.get(REQUEST_ID_HEADER)?.trim();
  if (externalRequestId) return externalRequestId;

  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `req_${crypto.randomUUID().replace(/-/g, '')}`;
  }

  return fallbackRequestId();
};
