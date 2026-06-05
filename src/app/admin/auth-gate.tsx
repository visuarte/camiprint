'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * AuthGate: protege las rutas /admin (excepto /admin/login).
 * - Verifica la sesión contra /api/admin/auth/verify (lee la cookie httpOnly)
 * - Si no hay sesión, redirige a /admin/login
 * - Muestra un loading mientras verifica
 */
export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const isLoginPage = pathname === '/admin/login';

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth/verify', { credentials: 'same-origin' });
      const data = await res.json();
      setAuthState(data.authenticated ? 'authenticated' : 'unauthenticated');
    } catch {
      setAuthState('unauthenticated');
    }
  }, []);

  useEffect(() => {
    if (isLoginPage) {
      setAuthState('authenticated'); // no gateamos la página de login
      return;
    }
    checkAuth();
  }, [isLoginPage, checkAuth]);

  useEffect(() => {
    if (authState === 'unauthenticated' && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [authState, isLoginPage, router]);

  // Loading state
  if (authState === 'loading' && !isLoginPage) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-hazard-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-[#D8DEE8] text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado y no es login, no renderizar nada (la redirección está en el efecto)
  if (authState === 'unauthenticated' && !isLoginPage) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <p className="text-[#D8DEE8] text-sm">Redirigiendo al login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
