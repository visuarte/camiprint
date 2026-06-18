'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [tokenWelcome, setTokenWelcome] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenMode = !!searchParams.get('token');
  const justLogged = searchParams.get('logged') === 'token';

  useEffect(() => {
    if (justLogged) {
      setTokenWelcome(true);
      setTimeout(() => setTokenWelcome(false), 5000);
    }
  }, [justLogged]);

  useEffect(() => {
    if (!tokenMode) return;
    const t = searchParams.get('token');
    const redirect = searchParams.get('redirect') || '/admin';
    if (t) {
      window.location.href = `/api/admin/auth/token-login?token=${t}&redirect=${redirect}`;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setError('');
    setResetSent(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        setResetSent(true);
      } else {
        setError(data.error || 'Error al enviar correo');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {tokenWelcome && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-900 border border-emerald-700 rounded-lg px-6 py-3 text-sm text-emerald-100 shadow-2xl animate-slideDown z-50">
          ✅ Sesión iniciada con token de emergencia
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-2 text-center">CamiArt Admin</h1>
          <p className="text-neutral-400 text-center text-sm mb-6">
            {showReset ? 'Restablecer contraseña' : 'Ingresa con tu cuenta de administrador'}
          </p>

          {!showReset ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email" id="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@camiart.com"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={isLoading} autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">Contraseña</label>
                <input
                  type="password" id="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={isLoading} autoComplete="current-password"
                />
                <button
                  type="button" onClick={() => setShowReset(true)}
                  className="mt-1 text-xs text-neutral-500 hover:text-blue-400 underline float-right"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {error && (
                <div className="bg-red-900 border border-red-700 rounded-lg p-3 text-sm text-red-100">{error}</div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg font-medium transition"
              >
                {isLoading ? 'Ingresando...' : 'Acceder'}
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@camiart.com');
                    setPassword('4545bd896e1b1163de0561f33ac1bbb650d5fc8f730529bac054a4988fbf4d36');
                  }}
                  className="text-xs text-neutral-500 hover:text-neutral-300 underline"
                >
                  Acceso por token
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-neutral-400">
                Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.
              </p>
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email" id="resetEmail" value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="admin@camiart.com"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  disabled={isLoading || resetSent}
                />
              </div>

              {resetSent && (
                <div className="bg-emerald-900 border border-emerald-700 rounded-lg p-3 text-sm text-emerald-100">
                  ✅ Si el email existe, recibirás instrucciones para restablecer tu contraseña.
                </div>
              )}

              {error && !resetSent && (
                <div className="bg-red-900 border border-red-700 rounded-lg p-3 text-sm text-red-100">{error}</div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowReset(false); setResetSent(false); setError(''); }}
                  className="flex-1 px-4 py-2 border border-neutral-700 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 transition"
                >
                  Volver
                </button>
                {!resetSent && (
                  <button
                    type="submit"
                    disabled={isLoading || !resetEmail.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 rounded-lg text-sm font-medium transition"
                  >
                    {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-neutral-800">
            <p className="text-xs text-neutral-500 text-center">
              Usa tu cuenta de Supabase Auth o el token de administrador para acceder.
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
