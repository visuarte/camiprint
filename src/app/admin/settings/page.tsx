'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '../auth-client';

interface Settings {
  showMetrics: boolean;
  refreshIntervalSeconds: number;
  analyticsEnabled: boolean;
  metricsWindowDays: number;
  whatsappPhone?: string | null;
  whatsappMessage?: string | null;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminFetch('/api/admin/settings');
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setSettings(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) return <div className="p-6">Cargando ajustes...</div>;
  if (!settings) return <div className="p-6">No se pudieron cargar los ajustes.</div>;

  const handleSave = async () => {
    setMessage('');
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setSettings(data);
      setMessage('Guardado correctamente');
    } catch (e) {
      console.error(e);
      setMessage('Error al guardar');
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-4">Ajustes del Dashboard</h1>
      <div className="space-y-4 max-w-lg">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={settings.showMetrics} onChange={(e) => setSettings({ ...settings, showMetrics: e.target.checked })} />
          <span>Mostrar métricas</span>
        </label>

        <label className="block">
          <span>Intervalo de refresco (segundos)</span>
          <input type="number" value={settings.refreshIntervalSeconds} min={5} onChange={(e) => setSettings({ ...settings, refreshIntervalSeconds: Number(e.target.value) })} className="w-40 mt-1" />
        </label>

        <label className="flex items-center gap-3">
          <input type="checkbox" checked={settings.analyticsEnabled} onChange={(e) => setSettings({ ...settings, analyticsEnabled: e.target.checked })} />
          <span>Habilitar analytics (Vercel)</span>
        </label>

        <label className="block">
          <span>Ventana de métricas (días)</span>
          <input type="number" value={settings.metricsWindowDays} min={1} onChange={(e) => setSettings({ ...settings, metricsWindowDays: Number(e.target.value) })} className="w-40 mt-1" />
        </label>

        <label className="block">
          <span>Teléfono WhatsApp (mostrar en widget)</span>
          <input type="text" value={settings.whatsappPhone ?? ''} onChange={(e) => setSettings({ ...settings, whatsappPhone: e.target.value })} className="w-full mt-1" />
        </label>

        <label className="block">
          <span>Mensaje por defecto WhatsApp</span>
          <textarea value={settings.whatsappMessage ?? ''} onChange={(e) => setSettings({ ...settings, whatsappMessage: e.target.value })} className="w-full mt-1 h-24" />
        </label>

        <div className="flex items-center gap-3">
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 rounded">Guardar</button>
          {message && <span className="text-sm text-neutral-400">{message}</span>}
        </div>
      </div>
    </div>
  );
}
