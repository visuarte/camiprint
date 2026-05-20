'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAdminToken } from '../auth-client';

export default function AdminLoginPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simular verificación del token (en un caso real, podrías hacer un POST a una ruta API)
      const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin-dev-token-123';

      // Note: En el navegador no tenemos acceso a process.env.ADMIN_AUTH_TOKEN
      // Así que usamos una API route para validar
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        // Token válido, guardarlo y redirigir al dashboard
        setAdminToken(token);
        router.push('/admin');
      } else {
        setError('Token de administrador inválido');
      }
    } catch (err) {
      setError('Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <html lang="es">
      <head>
        <title>Admin Login - CamiPrint</title>
      </head>
      <body className="bg-neutral-950 text-neutral-100 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
            <h1 className="text-2xl font-bold mb-2 text-center">CamiPrint Admin</h1>
            <p className="text-neutral-400 text-center text-sm mb-6">Ingresa tu token de administrador</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-sm font-medium mb-2">
                  Token de Administrador
                </label>
                <input
                  type="password"
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Ingresa tu token..."
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-900 border border-red-700 rounded-lg p-3 text-sm text-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg font-medium transition"
              >
                {isLoading ? 'Verificando...' : 'Acceder'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-neutral-800">
              <p className="text-xs text-neutral-500 text-center">
                Para desarrollo, usa el token proporcionado en las variables de entorno.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
