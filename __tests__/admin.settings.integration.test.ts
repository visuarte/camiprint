import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockGetDashboardSettingsFromStore,
  mockUpdateDashboardSettingsInStore,
} = vi.hoisted(() => ({
  mockGetDashboardSettingsFromStore: vi.fn(),
  mockUpdateDashboardSettingsInStore: vi.fn(),
}));

vi.mock('../src/server/admin/settings', () => ({
  getDashboardSettingsFromStore: mockGetDashboardSettingsFromStore,
  updateDashboardSettingsInStore: mockUpdateDashboardSettingsInStore,
}));

import { GET, POST } from '../src/app/api/admin/settings/route';

const validToken = 'test-admin-token';

function makeRequest(overrides?: {
  authHeader?: string | null;
  cookieToken?: string | null;
  body?: unknown;
  extraHeaders?: Record<string, string>;
}) {
  const headers = new Map<string, string>();
  if (overrides?.authHeader) headers.set('authorization', overrides.authHeader);
  if (overrides?.extraHeaders) {
    for (const [key, value] of Object.entries(overrides.extraHeaders)) {
      headers.set(key.toLowerCase(), value);
    }
  }

  return {
    headers: {
      get: (key: string) => headers.get(key.toLowerCase()) ?? null,
    },
    cookies: {
      get: (name: string) => {
        if (name === 'admin_token' && overrides?.cookieToken) {
          return { value: overrides.cookieToken };
        }
        return undefined;
      },
    },
    json: async () => overrides?.body ?? {},
  } as any;
}

describe('Admin Settings API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_AUTH_TOKEN = validToken;
  });

  it('GET returns 401 when request is not authenticated', async () => {
    const req = makeRequest();

    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it('GET returns settings when request is authenticated with bearer token', async () => {
    mockGetDashboardSettingsFromStore.mockResolvedValueOnce({
      showMetrics: true,
      refreshIntervalSeconds: 30,
      analyticsEnabled: false,
      metricsWindowDays: 30,
      language: 'es-ES',
      currency: 'EUR',
      timezone: 'Europe/Madrid',
      adminEmail: null,
      whatsappPhone: null,
      whatsappMessage: 'hola',
      updatedBy: 'admin-token',
    });

    const req = makeRequest({ authHeader: `Bearer ${validToken}` });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      showMetrics: true,
      language: 'es-ES',
      currency: 'EUR',
    });
  });

  it('POST returns 422 for invalid admin email', async () => {
    const req = makeRequest({
      authHeader: `Bearer ${validToken}`,
      body: { adminEmail: 'not-an-email' },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error).toBe('INVALID_ADMIN_EMAIL');
    expect(mockUpdateDashboardSettingsInStore).not.toHaveBeenCalled();
  });

  it('POST forwards sanitized patch and updater identity', async () => {
    mockUpdateDashboardSettingsInStore.mockResolvedValueOnce({
      showMetrics: true,
      refreshIntervalSeconds: 60,
      analyticsEnabled: false,
      metricsWindowDays: 45,
      language: 'en-US',
      currency: 'USD',
      timezone: 'UTC',
      adminEmail: 'ops@camiart.com',
      whatsappPhone: '+34600000000',
      whatsappMessage: 'mensaje',
      updatedBy: 'diego-admin',
      updatedAt: '2026-05-28T12:00:00.000Z',
    });

    const req = makeRequest({
      authHeader: `Bearer ${validToken}`,
      extraHeaders: { 'x-admin-user': 'diego-admin' },
      body: {
        refreshIntervalSeconds: 60,
        metricsWindowDays: 45,
        language: 'en-US',
        currency: 'USD',
        timezone: 'UTC',
        adminEmail: 'ops@camiart.com',
      },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockUpdateDashboardSettingsInStore).toHaveBeenCalledWith(
      expect.objectContaining({
        refreshIntervalSeconds: 60,
        metricsWindowDays: 45,
        language: 'en-US',
        currency: 'USD',
        timezone: 'UTC',
        adminEmail: 'ops@camiart.com',
      }),
      'diego-admin'
    );
    expect(body).toMatchObject({
      updatedBy: 'diego-admin',
      language: 'en-US',
      currency: 'USD',
    });
  });
});
