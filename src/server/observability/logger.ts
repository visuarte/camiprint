import pino from 'pino';

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
  const sanitized = { ...payload };

  if (typeof sanitized.email === 'string') {
    sanitized.email = maskEmail(sanitized.email);
  }

  if (typeof sanitized.phone === 'string') {
    sanitized.phone = maskPhone(sanitized.phone);
  }

  return sanitized;
};

const GLOBAL_LOGGER_KEY = '__camiprint_pino_logger__';

const makeLogger = (): pino.Logger => {
  const baseOpts: pino.LoggerOptions = {
    level: process.env.LOG_LEVEL ?? 'info',
    base: { environment: process.env.NODE_ENV ?? 'unknown' },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
  };

  // En tests, enruta la salida de pino a través de console.{info,warn,error}
  // para que los vi.spyOn existentes sigan funcionando.
  if (process.env.NODE_ENV === 'test') {
    const destination: pino.DestinationStream = {
      write(msg: string) {
        try {
          const parsed = JSON.parse(msg) as { level?: string };
          const lvl = parsed.level;
          if (lvl === 'error') console.error(msg);
          else if (lvl === 'warn') console.warn(msg);
          else console.info(msg);
        } catch {
          console.info(msg);
        }
      },
    };
    return pino({ ...baseOpts, level: 'trace' }, destination);
  }

  return pino(baseOpts);
};

const getLogger = (): pino.Logger => {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_LOGGER_KEY]?: pino.Logger;
  };

  if (!g[GLOBAL_LOGGER_KEY]) {
    g[GLOBAL_LOGGER_KEY] = makeLogger();
  }

  return g[GLOBAL_LOGGER_KEY];
};

export const logRequestInfo = (
  message: string,
  context: RequestLogContext,
  extra?: Record<string, unknown>
) => {
  getLogger().info({ ...context, ...(extra ?? {}) }, message);
};

export const logRequestWarn = (
  message: string,
  context: RequestLogContext,
  extra?: Record<string, unknown>
) => {
  getLogger().warn({ ...context, ...(extra ?? {}) }, message);
};

export const logRequestError = (
  message: string,
  context: ErrorLogContext,
  extra?: Record<string, unknown>
) => {
  getLogger().error(
    {
      ...context,
      ...(process.env.NODE_ENV === 'development' && context.errorStack
        ? { stackTrace: context.errorStack }
        : {}),
      ...(extra ?? {}),
    },
    message
  );
};

export const logOperationalEvent = (
  level: LogLevel,
  message: string,
  payload: Record<string, unknown> = {}
) => {
  getLogger()[level](payload, message);
};

