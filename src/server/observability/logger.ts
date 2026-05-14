export type LogLevel = 'info' | 'warn' | 'error';

export interface RequestLogContext {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
}

export interface ErrorLogContext extends RequestLogContext {
  errorCode: string;
  errorMessage: string;
  errorStack?: string;
}

const maskEmail = (value: string): string => {
  const [localPart = '', domainPart = ''] = value.split('@');
  const safeLocalPart = localPart.slice(0, 3) || '***';

  if (!domainPart) return `${safeLocalPart}***`;

  const [domainLabel = '', topLevelDomain = ''] = domainPart.split('.');
  const safeDomainLabel = domainLabel.slice(0, 2) || '***';
  const safeTopLevelDomain = topLevelDomain || '***';

  return `${safeLocalPart}***@${safeDomainLabel}***.${safeTopLevelDomain}`;
};

const maskPhone = (value: string): string => {
  const normalized = value.replace(/\s+/g, '');
  return normalized.length <= 4 ? '***' : `***${normalized.slice(-4)}`;
};

export const sanitizeQuotePayloadForLogs = (payload: Record<string, unknown>) => {
  const sanitizedPayload = { ...payload };

  if (typeof sanitizedPayload.email === 'string') {
    sanitizedPayload.email = maskEmail(sanitizedPayload.email);
  }

  if (typeof sanitizedPayload.phone === 'string') {
    sanitizedPayload.phone = maskPhone(sanitizedPayload.phone);
  }

  return sanitizedPayload;
};

const emitLog = (level: LogLevel, message: string, payload: Record<string, unknown>) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    environment: process.env.NODE_ENV ?? 'unknown',
    ...payload,
  };

  const serialized = JSON.stringify(logEntry);

  if (level === 'error') {
    console.error(serialized);
    return;
  }

  if (level === 'warn') {
    console.warn(serialized);
    return;
  }

  console.info(serialized);
};

export const logRequestInfo = (message: string, context: RequestLogContext, extra?: Record<string, unknown>) => {
  emitLog('info', message, {
    ...context,
    ...(extra ?? {}),
  });
};

export const logRequestWarn = (message: string, context: RequestLogContext, extra?: Record<string, unknown>) => {
  emitLog('warn', message, {
    ...context,
    ...(extra ?? {}),
  });
};

export const logRequestError = (message: string, context: ErrorLogContext, extra?: Record<string, unknown>) => {
  emitLog('error', message, {
    ...context,
    ...(process.env.NODE_ENV === 'development' && context.errorStack
      ? { stackTrace: context.errorStack }
      : {}),
    ...(extra ?? {}),
  });
};
