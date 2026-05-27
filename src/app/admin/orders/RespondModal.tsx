"use client";

import { useState } from 'react';
import { adminFetch } from '../auth-client';

export default function RespondModal({ orderId, onClose, onSuccess }: { orderId: string; onClose: () => void; onSuccess?: () => void; }) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('responded');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await adminFetch(`/api/orders/${orderId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error?.message || `Error ${res.status}`);
      } else {
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      setError('Error de red');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-neutral-900 border border-neutral-800 rounded-lg p-6 w-full max-w-md z-10">
        <h3 className="text-lg font-semibold mb-2">Responder cotización</h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-28 p-2 bg-neutral-800 border border-neutral-700 rounded mb-3"
          placeholder="Escribe la respuesta al cliente..."
        />
        <div className="flex items-center gap-2 mb-3">
          <label className="text-sm text-neutral-400">Estado:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm">
            <option value="responded">Respondido</option>
            <option value="accepted">Aceptado</option>
            <option value="rejected">Rechazado</option>
          </select>
        </div>
        {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading || !message.trim()} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white disabled:opacity-50">
            {loading ? 'Enviando...' : 'Enviar respuesta'}
          </button>
        </div>
      </div>
    </div>
  );
}
