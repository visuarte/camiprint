'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminFetch } from '../auth-client';

interface Settings {
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
  whatsappPhone?: string | null;
  whatsappMessage?: string | null;
  priceMultiplier?: number;
  basePrintingCost?: number;
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
  const [adminEmailError, setAdminEmailError] = useState('');

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
    setAdminEmailError('');
    // client-side validation for E.164 phone format if provided
    const phone = settings.whatsappPhone?.trim();
    if (phone) {
      const e164 = /^\+[1-9]\d{1,14}$/;
      if (!e164.test(phone)) {
        setMessage('El teléfono WhatsApp debe estar en formato E.164, por ejemplo +34616996306');
        return;
      }
    }
    const email = settings.adminEmail?.trim();
    if (email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        setAdminEmailError('El email no tiene un formato válido.');
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
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Ajustes del Dashboard</h1>
        <Link href="/admin/settings/history" className="px-3 py-2 bg-neutral-700 text-gray-900 rounded text-sm">
          Ver historial
        </Link>
      </div>
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
          <span>Idioma del dashboard</span>
          <select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value as Settings['language'] })}
            className="w-full mt-1"
          >
            <option value="es-ES">Español (España)</option>
            <option value="en-US">English (US)</option>
          </select>
        </label>

        <label className="block">
          <span>Divisa</span>
          <select
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value as Settings['currency'] })}
            className="w-full mt-1"
          >
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
          </select>
        </label>

        <label className="block">
          <span>Zona horaria</span>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value as Settings['timezone'] })}
            className="w-full mt-1"
          >
            <option value="Europe/Madrid">Europe/Madrid</option>
            <option value="UTC">UTC</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Europe/Berlin">Europe/Berlin</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Chicago">America/Chicago</option>
            <option value="America/Mexico_City">America/Mexico_City</option>
            <option value="America/Bogota">America/Bogota</option>
            <option value="America/Lima">America/Lima</option>
            <option value="America/Santiago">America/Santiago</option>
            <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires</option>
          </select>
        </label>

        <label className="block">
          <span>Email del administrador</span>
          <input
            type="email"
            value={settings.adminEmail ?? ''}
            onChange={(e) => {
              setSettings({ ...settings, adminEmail: e.target.value });
              if (adminEmailError) setAdminEmailError('');
            }}
            className="w-full mt-1"
            placeholder="admin@tu-dominio.com"
          />
          {adminEmailError && <p className="text-xs text-red-500 mt-1">{adminEmailError}</p>}
        </label>

        {(settings.updatedAt || settings.updatedBy) && (
          <div className="rounded border border-neutral-800 bg-neutral-900/40 p-3 text-xs text-neutral-400">
            <div>Última actualización: {settings.updatedAt ? new Date(settings.updatedAt).toLocaleString('es-ES') : 'N/D'}</div>
            <div>Actualizado por: {settings.updatedBy ?? 'N/D'}</div>
          </div>
        )}

        <label className="block">
          <div className="flex items-center justify-between">
            <span>Teléfono WhatsApp (mostrar en widget)</span>
            <button
              title="Abrir script Vercel"
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
              className="p-1 rounded hover:bg-neutral-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 00-.894.553L3.618 10H2a1 1 0 000 2h3a1 1 0 00.894-.553L9.382 5H11a1 1 0 100-2H8z" />
                <path d="M12 7a1 1 0 011 1v6a1 1 0 001 1h2v2H4v-2h2a1 1 0 001-1V8a1 1 0 112 0v6h2V8a1 1 0 011-1z" />
              </svg>
            </button>
          </div>
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

        <fieldset className="border border-gray-200 rounded-xl p-4 mt-6">
          <legend className="text-sm font-bold uppercase tracking-wider text-gray-500 px-2">Márgenes y precios</legend>
          <p className="text-xs text-gray-400 mb-4">Controla cómo se calculan los precios mostrados en el catálogo público.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span>Multiplicador de margen</span>
              <input type="number" step="0.1" min="1" value={settings.priceMultiplier ?? 1.5}
                onChange={(e) => setSettings({ ...settings, priceMultiplier: parseFloat(e.target.value) || 1.5 })}
                className="w-full mt-1" />
              <p className="text-xs text-neutral-500 mt-1">Precio prenda × este valor. Actual: 1.5</p>
            </label>
            <label className="block">
              <span>Coste base estampación (€)</span>
              <input type="number" step="0.5" min="0" value={settings.basePrintingCost ?? 2}
                onChange={(e) => setSettings({ ...settings, basePrintingCost: parseFloat(e.target.value) || 0 })}
                className="w-full mt-1" />
              <p className="text-xs text-neutral-500 mt-1">Se suma al precio final. Actual: 2€</p>
            </label>
          </div>
        </fieldset>

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
            className="px-4 py-2 bg-gray-700 text-gray-900 rounded"
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
                  className="px-3 py-1 bg-green-600 text-gray-900 rounded text-sm flex items-center gap-2"
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
                  className="px-3 py-1 bg-blue-600 text-gray-900 rounded text-sm"
                >Descargar</button>
                <button onClick={() => setScriptOpen(false)} className="px-3 py-1 bg-gray-200 rounded text-sm">Cerrar</button>
              </div>
            </div>
            {scriptError && <div className="text-red-600 mb-2">{scriptError}</div>}
            <pre className="whitespace-pre-wrap max-h-80 overflow-auto bg-neutral-100 p-3 rounded text-sm">{scriptContent}</pre>
            {/* Accessible toast for copy feedback */}
            <div aria-live="polite" aria-atomic="true">
              {copySuccess && (
                <div className="fixed bottom-6 right-6 bg-black text-gray-900 px-4 py-2 rounded shadow" role="status">
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
