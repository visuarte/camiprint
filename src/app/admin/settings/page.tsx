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
  const [scriptOpen, setScriptOpen] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptContent, setScriptContent] = useState<string | null>(null);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

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
    // client-side validation for E.164 phone format if provided
    const phone = settings.whatsappPhone?.trim();
    if (phone) {
      const e164 = /^\+[1-9]\d{1,14}$/;
      if (!e164.test(phone)) {
        setMessage('El teléfono WhatsApp debe estar en formato E.164, por ejemplo +34616996306');
        return;
      }
    }
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
          <input
            type="text"
            value={settings.whatsappPhone ?? ''}
            onChange={(e) => setSettings({ ...settings, whatsappPhone: e.target.value })}
            className="w-full mt-1"
            placeholder="+34616996306"
            aria-describedby="whatsapp-help"
          />
          <p id="whatsapp-help" className="text-xs text-neutral-500 mt-1">Formato E.164 obligatorio, por ejemplo <span className="font-mono">+34616996306</span></p>
        </label>

        <label className="block">
          <span>Mensaje por defecto WhatsApp</span>
          <textarea value={settings.whatsappMessage ?? ''} onChange={(e) => setSettings({ ...settings, whatsappMessage: e.target.value })} className="w-full mt-1 h-24" />
        </label>

        <div className="flex items-center gap-3">
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 rounded">Guardar</button>
          <button
            onClick={async () => {
              setScriptError(null);
              setScriptLoading(true);
              try {
                const res = await adminFetch('/api/admin/settings/vercel-script');
                if (!res.ok) throw new Error(String(res.status));
                const data = await res.json();
                setScriptContent(data.script ?? null);
                setScriptOpen(true);
              } catch (e) {
                console.error(e);
                setScriptError('No se pudo obtener el script');
              } finally {
                setScriptLoading(false);
              }
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded"
          >
            {scriptLoading ? 'Cargando...' : 'Obtener script Vercel'}
          </button>
          {message && <span className="text-sm text-neutral-400">{message}</span>}
        </div>
      </div>
      {scriptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded shadow-lg max-w-3xl w-full p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Script Vercel (Stripe secrets)</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    if (!scriptContent) return;
                    try {
                      await navigator.clipboard.writeText(scriptContent);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    } catch {
                      setCopySuccess(false);
                    }
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  <span>{copySuccess ? 'Copiado' : 'Copiar'}</span>
                </button>
                <button
                  onClick={() => {
                    if (!scriptContent) return;
                    const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'setup-stripe-secrets.ps1';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >Descargar</button>
                <button onClick={() => setScriptOpen(false)} className="px-3 py-1 bg-gray-200 rounded text-sm">Cerrar</button>
              </div>
            </div>
            {scriptError && <div className="text-red-600 mb-2">{scriptError}</div>}
            <pre className="whitespace-pre-wrap max-h-80 overflow-auto bg-neutral-100 p-3 rounded text-sm">{scriptContent}</pre>
            {/* Accessible toast for copy feedback */}
            <div aria-live="polite" aria-atomic="true">
              {copySuccess && (
                <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded shadow" role="status">
                  Script copiado al portapapeles
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
