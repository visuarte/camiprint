// =============================================================================
// Gor Factory API — Cliente HTTP base
// =============================================================================

import { GorAuthResponse, GorApiResult } from './types';

const ENV_URLS: Record<string, string> = {
  dev: 'https://devclientsws.gorfactory.es:2096',
  pro: 'https://clientsws.gorfactory.es:2096',
};

interface PendingRequest {
  resolve: (token: string) => void;
  reject: (err: Error) => void;
}

export class GorFactoryClient {
  private readonly baseUrl: string;
  private token: string | null = null;
  private tokenPromise: Promise<string> | null = null;
  private loginInProgress = false;
  private pendingQueue: PendingRequest[] = [];

  constructor(
    private readonly environment: 'dev' | 'pro',
    private readonly username: string,
    private readonly password: string,
  ) {
    this.baseUrl = ENV_URLS[environment];
    if (!this.baseUrl) throw new Error(`Entorno inválido: ${environment}`);
  }

  // ---- AUTH ----

  private async login(): Promise<string> {
    const formData = new URLSearchParams();
    formData.append('username', this.username);
    formData.append('password', this.password);

    const response = await fetch(`${this.baseUrl}/api/v1.0/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as GorAuthResponse;
    this.token = data.token;
    return data.token;
  }

  /**
   * Obtiene un token, evitando múltiples logins simultáneos.
   * Si hay una petición de login en curso, las demás se encolan.
   */
  async getToken(): Promise<string> {
    if (this.token) return this.token;

    if (this.loginInProgress && this.tokenPromise) {
      return this.tokenPromise;
    }

    this.loginInProgress = true;
    this.tokenPromise = this.login().finally(() => {
      this.loginInProgress = false;
      this.tokenPromise = null;
    });

    return this.tokenPromise;
  }

  /**
   * Forzar reinicio del token (ej: cuando expira)
   */
  resetToken(): void {
    this.token = null;
  }

  // ---- HTTP METHODS ----

  private async request<T>(
    method: string,
    path: string,
    options: {
      body?: URLSearchParams | object;
      isFormData?: boolean;
      skipAuth?: boolean;
    } = {},
  ): Promise<GorApiResult<T>> {
    try {
      const url = `${this.baseUrl}${path}`;
      const headers: Record<string, string> = {};

      if (!options.skipAuth) {
        const token = await this.getToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      let body: string | undefined;

      if (options.body) {
        if (options.isFormData) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
          body = options.body.toString();
        } else {
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify(options.body);
        }
      }

      const response = await fetch(url, { method, headers, body });

      // 401 → token expirado, reintentar una vez
      if (response.status === 401 && !options.skipAuth) {
        this.resetToken();
        return this.request<T>(method, path, options);
      }

      const text = await response.text();
      let data: T;

      try {
        data = JSON.parse(text) as T;
      } catch {
        return { success: false, error: `Respuesta no JSON: ${text.slice(0, 200)}`, raw: text };
      }

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${JSON.stringify(data)}`,
          data,
          raw: text,
        };
      }

      // Dev log para depurar estructura de respuesta
      if (process.env.NODE_ENV === 'development') {
        const typeInfo = Array.isArray(data) ? `array[${data.length}]` : typeof data;
        console.debug(`[GOR] ${method} ${path} → ${typeInfo}`, JSON.stringify(data).slice(0, 300));
      }

      return { success: true, data, raw: text };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ---- GET ----

  async get<T>(path: string, options?: { skipAuth?: boolean }): Promise<GorApiResult<T>> {
    return this.request<T>('GET', path, options);
  }

  // ---- POST (formdata) ----

  async postForm<T>(path: string, fields: Record<string, string>): Promise<GorApiResult<T>> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(fields)) {
      params.append(key, value);
    }
    return this.request<T>('POST', path, { body: params, isFormData: true });
  }

  // ---- POST (JSON) ----

  async postJson<T>(path: string, payload: object): Promise<GorApiResult<T>> {
    return this.request<T>('POST', path, { body: payload });
  }

  // ---- PUT (JSON) ----

  async putJson<T>(path: string, payload: object): Promise<GorApiResult<T>> {
    return this.request<T>('PUT', path, { body: payload });
  }
}
