'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        credentials: 'same-origin',
      });

      if (response.ok) {
        const redirect = searchParams.get('redirect') || '/admin';
        router.push(redirect);
      } else {
        const data = await response.json();
        setError(data.error || 'Credenciales inválidas');
      }
    } catch {
      setError('Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-2 text-center">CamiArt Admin</h1>
          <p className="text-neutral-400 text-center text-sm mb-6">Ingresa con tu cuenta de administrador</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@camiart.com"
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-900 border border-red-700 rounded-lg p-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg font-medium transition"
            >
              {isLoading ? 'Ingresando...' : 'Acceder'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-800">
            <p className="text-xs text-neutral-500 text-center">
              Usa tu cuenta de Supabase Auth para acceder al panel de administración.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
