import { getPlatformConfig } from '@/server/platform/config';
import { getPostgresPool } from '@/server/platform/database/client';

export interface DashboardSettings {
  showMetrics: boolean;
  refreshIntervalSeconds: number;
  analyticsEnabled: boolean;
  metricsWindowDays: number;
  language: 'es-ES' | 'en-US';
  currency: 'EUR' | 'USD';
  timezone:
    | 'Europe/Madrid'
    | 'UTC'
    | 'Europe/London'
    | 'Europe/Berlin'
    | 'America/New_York'
    | 'America/Chicago'
    | 'America/Mexico_City'
    | 'America/Bogota'
    | 'America/Lima'
    | 'America/Santiago'
    | 'America/Argentina/Buenos_Aires';
  adminEmail: string | null;
  updatedAt?: string;
  updatedBy?: string | null;
  // WhatsApp configuration for public widget (editable in admin)
  whatsappPhone?: string | null;
  whatsappMessage?: string | null;
}

export interface DashboardSettingsAuditEntry {
  id: number;
  changedAt: string;
  changedBy: string | null;
  payload: DashboardSettings;
}

export interface DashboardSettingsAuditQuery {
  page?: number;
  pageSize?: number;
  changedBy?: string;
  from?: string;
  to?: string;
  sortBy?: 'newest' | 'oldest' | 'user_asc' | 'user_desc';
}

export interface DashboardSettingsAuditPage {
  entries: DashboardSettingsAuditEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const GLOBAL_SETTINGS_KEY = '__camiprint_dashboard_settings__';

const defaultSettings: DashboardSettings = {
  showMetrics: true,
  refreshIntervalSeconds: 30,
  analyticsEnabled: false,
  metricsWindowDays: 30,
  language: 'es-ES',
  currency: 'EUR',
  timezone: 'Europe/Madrid',
  adminEmail: null,
  whatsappPhone: null,
  whatsappMessage: 'Hola, quiero un presupuesto para camisetas corporativas. Nombre, empresa y cantidad:',
};

const getSettingsStore = (): DashboardSettings => {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_SETTINGS_KEY]?: DashboardSettings;
  };

  if (!g[GLOBAL_SETTINGS_KEY]) {
    g[GLOBAL_SETTINGS_KEY] = { ...defaultSettings };
  }

  return g[GLOBAL_SETTINGS_KEY];
};

export const getDashboardSettings = (): DashboardSettings => {
  return { ...getSettingsStore() };
};

export const updateDashboardSettings = (patch: Partial<DashboardSettings>): DashboardSettings => {
  const store = getSettingsStore();
  const next = { ...store, ...patch };
  (globalThis as any)[GLOBAL_SETTINGS_KEY] = next;
  return { ...next };
};

const SETTINGS_SINGLETON_ID = 1;

const mapDbRowToSettings = (row: any): DashboardSettings => ({
  showMetrics: !!row.show_metrics,
  refreshIntervalSeconds: Number(row.refresh_interval_seconds),
  analyticsEnabled: !!row.analytics_enabled,
  metricsWindowDays: Number(row.metrics_window_days),
  language: row.language,
  currency: row.currency,
  timezone: row.timezone,
  adminEmail: row.admin_email ?? null,
  whatsappPhone: row.whatsapp_phone ?? null,
  whatsappMessage: row.whatsapp_message ?? null,
  updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  updatedBy: row.updated_by ?? null,
});

export const getDashboardSettingsFromStore = async (): Promise<DashboardSettings> => {
  const { databaseUrl } = getPlatformConfig();

  // Keep compatibility for environments without DB configuration.
  if (!databaseUrl) {
    return getDashboardSettings();
  }

  try {
    const pool = await getPostgresPool();
    const existing = await pool.query(
      `SELECT
         show_metrics,
         refresh_interval_seconds,
         analytics_enabled,
         metrics_window_days,
         language,
         currency,
         timezone,
         admin_email,
         whatsapp_phone,
         whatsapp_message,
         updated_at,
         updated_by
       FROM admin_dashboard_settings
       WHERE id = $1`,
      [SETTINGS_SINGLETON_ID]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO admin_dashboard_settings (id)
         VALUES ($1)
         ON CONFLICT (id) DO NOTHING`,
        [SETTINGS_SINGLETON_ID]
      );

      const created = await pool.query(
        `SELECT
           show_metrics,
           refresh_interval_seconds,
           analytics_enabled,
           metrics_window_days,
           language,
           currency,
           timezone,
           admin_email,
           whatsapp_phone,
           whatsapp_message,
           updated_at,
           updated_by
         FROM admin_dashboard_settings
         WHERE id = $1`,
        [SETTINGS_SINGLETON_ID]
      );

      if (created.rows.length > 0) {
        const mapped = mapDbRowToSettings(created.rows[0]);
        updateDashboardSettings(mapped);
        return mapped;
      }

      return getDashboardSettings();
    }

    const mapped = mapDbRowToSettings(existing.rows[0]);
    updateDashboardSettings(mapped);
    return mapped;
  } catch (error) {
    console.error('[settings] DB read failed, using in-memory fallback:', error);
    return getDashboardSettings();
  }
};

export const updateDashboardSettingsInStore = async (
  patch: Partial<DashboardSettings>,
  updatedBy: string | null = null,
): Promise<DashboardSettings> => {
  const { databaseUrl } = getPlatformConfig();

  if (!databaseUrl) {
    return updateDashboardSettings({ ...patch, updatedAt: new Date().toISOString(), updatedBy });
  }

  try {
    const pool = await getPostgresPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO admin_dashboard_settings (id)
         VALUES ($1)
         ON CONFLICT (id) DO NOTHING`,
        [SETTINGS_SINGLETON_ID]
      );

      const currentResult = await client.query(
        `SELECT
           show_metrics,
           refresh_interval_seconds,
           analytics_enabled,
           metrics_window_days,
           language,
           currency,
           timezone,
           admin_email,
           whatsapp_phone,
           whatsapp_message,
           updated_at,
           updated_by
         FROM admin_dashboard_settings
         WHERE id = $1`,
        [SETTINGS_SINGLETON_ID]
      );

      const current = currentResult.rows.length > 0
        ? mapDbRowToSettings(currentResult.rows[0])
        : getDashboardSettings();

      const next = {
        ...current,
        ...patch,
        updatedBy,
      };

      const result = await client.query(
        `UPDATE admin_dashboard_settings
         SET
           show_metrics = $2,
           refresh_interval_seconds = $3,
           analytics_enabled = $4,
           metrics_window_days = $5,
           language = $6,
           currency = $7,
           timezone = $8,
           admin_email = $9,
           whatsapp_phone = $10,
           whatsapp_message = $11,
           updated_by = $12,
           updated_at = NOW()
         WHERE id = $1
         RETURNING
           show_metrics,
           refresh_interval_seconds,
           analytics_enabled,
           metrics_window_days,
           language,
           currency,
           timezone,
           admin_email,
           whatsapp_phone,
           whatsapp_message,
           updated_at,
           updated_by`,
        [
          SETTINGS_SINGLETON_ID,
          next.showMetrics,
          next.refreshIntervalSeconds,
          next.analyticsEnabled,
          next.metricsWindowDays,
          next.language,
          next.currency,
          next.timezone,
          next.adminEmail,
          next.whatsappPhone ?? null,
          next.whatsappMessage ?? null,
          updatedBy,
        ]
      );

      const mapped = mapDbRowToSettings(result.rows[0]);

      await client.query(
        `INSERT INTO admin_dashboard_settings_audit (
           settings_id,
           changed_by,
           payload
         ) VALUES ($1, $2, $3::jsonb)`,
        [SETTINGS_SINGLETON_ID, updatedBy, JSON.stringify(mapped)]
      );

      await client.query('COMMIT');
      updateDashboardSettings(mapped);
      return mapped;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[settings] DB write failed, using in-memory fallback:', error);
    return updateDashboardSettings({ ...patch, updatedAt: new Date().toISOString(), updatedBy });
  }
};

export const getDashboardSettingsAuditFromStore = async (
  query: DashboardSettingsAuditQuery = {},
): Promise<DashboardSettingsAuditPage> => {
  const { databaseUrl } = getPlatformConfig();

  const page = Math.max(1, Math.floor(Number(query.page ?? 1) || 1));
  const pageSize = Math.max(1, Math.min(100, Math.floor(Number(query.pageSize ?? 20) || 20)));
  const sortBy = query.sortBy ?? 'newest';

  if (!databaseUrl) {
    return {
      entries: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  try {
    const pool = await getPostgresPool();

    const filters: string[] = [];
    const params: unknown[] = [];

    const changedBy = query.changedBy?.trim();
    if (changedBy) {
      params.push(`%${changedBy}%`);
      filters.push(`changed_by ILIKE $${params.length}`);
    }

    const from = query.from?.trim();
    if (from) {
      params.push(new Date(from));
      filters.push(`changed_at >= $${params.length}`);
    }

    const to = query.to?.trim();
    if (to) {
      params.push(new Date(to));
      filters.push(`changed_at <= $${params.length}`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const orderByClause = (() => {
      switch (sortBy) {
        case 'oldest':
          return 'ORDER BY id ASC';
        case 'user_asc':
          return 'ORDER BY changed_by ASC NULLS LAST, id DESC';
        case 'user_desc':
          return 'ORDER BY changed_by DESC NULLS LAST, id DESC';
        case 'newest':
        default:
          return 'ORDER BY id DESC';
      }
    })();

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM admin_dashboard_settings_audit
       ${whereClause}`,
      params,
    );
    const total = Number(countResult.rows[0]?.total ?? 0);

    const offset = (page - 1) * pageSize;
    const listParams = [...params, pageSize, offset];
    const result = await pool.query(
      `SELECT id, changed_at, changed_by, payload
       FROM admin_dashboard_settings_audit
       ${whereClause}
       ${orderByClause}
       LIMIT $${listParams.length - 1}
       OFFSET $${listParams.length}`,
      listParams,
    );

    const entries = result.rows.map((row: any) => ({
      id: Number(row.id),
      changedAt: new Date(row.changed_at).toISOString(),
      changedBy: row.changed_by ?? null,
      payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
    }));

    return {
      entries,
      total,
      page,
      pageSize,
      totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
    };
  } catch (error) {
    console.error('[settings] DB audit read failed:', error);
    return {
      entries: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }
};

export const __resetDashboardSettingsForTests = () => {
  if (process.env.NODE_ENV !== 'test') return;
  (globalThis as any)[GLOBAL_SETTINGS_KEY] = { ...defaultSettings };
};
