import type { QuoteRequestInput } from '@/server/quotes/types';
import type { QuoteRepository } from '@/server/quotes/contracts';
import { createQuoteRepository } from '@/server/quotes/repository.factory';
import { incrementCircuitOpenCount } from '@/server/observability/metrics';
import { logOperationalEvent } from '@/server/observability/logger';
import { emailService } from '@/server/emails/service';

export interface CreateQuoteResult {
  id: string;
  status: 'received';
  createdAt: string;
}

type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreakerSnapshot {
  state: CircuitState;
  failureCount: number;
  openedAtMs: number | null;
}

interface QuotesServiceOptions {
  timeoutMs?: number;
  failureThreshold?: number;
  openWindowMs?: number;
  now?: () => number;
}

const DEFAULT_TIMEOUT_MS = 5_000;
const DEFAULT_FAILURE_THRESHOLD = 5;
const DEFAULT_OPEN_WINDOW_MS = 30_000;

const GLOBAL_CIRCUIT_KEY = '__camiprint_quotes_circuit_breaker__';

const getCircuitBreakerState = (): CircuitBreakerSnapshot => {
  const globalScope = globalThis as typeof globalThis & {
    [GLOBAL_CIRCUIT_KEY]?: CircuitBreakerSnapshot;
  };

  if (!globalScope[GLOBAL_CIRCUIT_KEY]) {
    globalScope[GLOBAL_CIRCUIT_KEY] = {
      state: 'closed',
      failureCount: 0,
      openedAtMs: null,
    };
  }

  return globalScope[GLOBAL_CIRCUIT_KEY];
};

const openCircuit = (nowMs: number, failureThreshold: number) => {
  const state = getCircuitBreakerState();
  state.state = 'open';
  state.openedAtMs = nowMs;
  state.failureCount = failureThreshold;
  incrementCircuitOpenCount();
  logOperationalEvent('warn', 'Circuit breaker opened for quotes persistence', {
    circuit: 'quotes-persistence',
    state: 'open',
    failureThreshold,
    openedAtMs: nowMs,
  });
};

const closeCircuit = () => {
  const state = getCircuitBreakerState();
  const previousState = state.state;

  state.state = 'closed';
  state.failureCount = 0;
  state.openedAtMs = null;

  if (previousState !== 'closed') {
    logOperationalEvent('info', 'Circuit breaker closed for quotes persistence', {
      circuit: 'quotes-persistence',
      state: 'closed',
      previousState,
    });
  }
};

const toServiceUnavailableError = (reason: string): Error => {
  const error = new Error(reason);
  error.name = 'SERVICE_UNAVAILABLE';
  return error;
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      const timeoutError = new Error('Persistence timeout');
      timeoutError.name = 'PERSISTENCE_TIMEOUT';
      setTimeout(() => reject(timeoutError), timeoutMs);
    }),
  ]);
};

export class QuotesService {
  private readonly timeoutMs: number;
  private readonly failureThreshold: number;
  private readonly openWindowMs: number;
  private readonly now: () => number;

  constructor(
    private readonly repository: QuoteRepository = createQuoteRepository(),
    options: QuotesServiceOptions = {}
  ) {
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.failureThreshold = options.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD;
    this.openWindowMs = options.openWindowMs ?? DEFAULT_OPEN_WINDOW_MS;
    this.now = options.now ?? Date.now;
  }

  private assertCircuitReady(): void {
    const state = getCircuitBreakerState();

    if (state.state !== 'open') return;

    const nowMs = this.now();
    const elapsedMs = nowMs - (state.openedAtMs ?? nowMs);

    if (elapsedMs < this.openWindowMs) {
      throw toServiceUnavailableError('Circuit breaker abierto temporalmente.');
    }

    state.state = 'half-open';
    logOperationalEvent('info', 'Circuit breaker moved to half-open for quotes persistence', {
      circuit: 'quotes-persistence',
      state: 'half-open',
      elapsedMs,
      openWindowMs: this.openWindowMs,
    });
  }

  private registerFailure(): void {
    const state = getCircuitBreakerState();
    const nowMs = this.now();

    if (state.state === 'half-open') {
      openCircuit(nowMs, this.failureThreshold);
      return;
    }

    state.failureCount += 1;

    if (state.failureCount >= this.failureThreshold) {
      openCircuit(nowMs, this.failureThreshold);
    }
  }

  async createQuote(input: QuoteRequestInput): Promise<CreateQuoteResult> {
    this.assertCircuitReady();

    try {
      const record = await withTimeout(this.repository.create(input), this.timeoutMs);
      closeCircuit();

      const quoteEmailData = {
        quoteId: record.id,
        name: record.name,
        email: record.email,
        phone: record.phone,
        companyName: record.companyName,
        quantity: record.quantity,
        message: record.message,
        createdAt: record.createdAt,
      };

      const emailResults = await Promise.allSettled([
        emailService.sendQuoteNotification(quoteEmailData),
        emailService.sendQuoteCustomerConfirmation(quoteEmailData),
      ]);

      const failedEmailCount = emailResults.filter(
        (result) => result.status === 'rejected' || result.value === false
      ).length;

      if (failedEmailCount > 0) {
        logOperationalEvent('warn', 'Quote email delivery failed', {
          quoteId: record.id,
          failedCount: failedEmailCount,
        });
      }

      return {
        id: record.id,
        status: record.status,
        createdAt: record.createdAt,
      };
    } catch (error) {
      this.registerFailure();

      if (error instanceof Error && error.name === 'PERSISTENCE_TIMEOUT') {
        throw toServiceUnavailableError('Timeout al persistir la cotizacion.');
      }

      throw toServiceUnavailableError('No se pudo persistir la cotizacion.');
    }
  }
}

export const __resetQuotesCircuitBreakerForTests = () => {
  if (process.env.NODE_ENV !== 'test') return;
  closeCircuit();
};
