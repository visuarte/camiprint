export interface DashboardSettings {
  showMetrics: boolean;
  refreshIntervalSeconds: number;
  analyticsEnabled: boolean;
  metricsWindowDays: number;
}

const GLOBAL_SETTINGS_KEY = '__camiprint_dashboard_settings__';

const defaultSettings: DashboardSettings = {
  showMetrics: true,
  refreshIntervalSeconds: 30,
  analyticsEnabled: false,
  metricsWindowDays: 30,
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

export const __resetDashboardSettingsForTests = () => {
  if (process.env.NODE_ENV !== 'test') return;
  (globalThis as any)[GLOBAL_SETTINGS_KEY] = { ...defaultSettings };
};
