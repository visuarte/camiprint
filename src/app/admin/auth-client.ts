/**
 * Admin authentication utilities for client-side use
 *
 * UNIFICADO: la fuente de verdad es la cookie httpOnly (seteada por el server).
 * localStorage se usa SOLO como respaldo en desarrollo.
 */

/**
 * Lee el token de la cookie admin_token (preferente) o localStorage (fallback).
 */
export function getAdminToken(): string | null {
  // 1. Intentar leer de cookie (httpOnly, seteada por el server)
  const cookieToken = getCookie('admin_token');
  if (cookieToken) return cookieToken;

  // 2. Fallback: localStorage (desarrollo / compatibilidad)
  try {
    if (typeof window !== 'undefined') {
      return window.localStorage?.getItem('admin_token') ?? null;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Helper: leer valor de una cookie por nombre
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Set admin auth token.
 * NOTA: El servidor setea la cookie httpOnly en /api/admin/auth/login.
 * Este método SOLO guarda en localStorage como respaldo de desarrollo.
 */
export function setAdminToken(token: string): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem('admin_token', token);
    }
  } catch (error) {
    console.error('Error setting admin token:', error);
  }
}

/**
 * Clear admin auth token (localStorage + cookie)
 */
export function clearAdminToken(): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage?.removeItem('admin_token');
      // También eliminar la cookie
      document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  } catch (error) {
    console.error('Error clearing admin token:', error);
  }
}

/**
 * Fetch wrapper that automatically includes auth.
 * Sends Authorization header if token is in localStorage;
 * otherwise relies on the httpOnly admin_token cookie sent automatically
 * by the browser on same-origin requests.
 */
export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    credentials: 'same-origin', // ensures httpOnly cookies are always sent
    headers,
  });
}
