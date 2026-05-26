/**
 * Admin authentication utilities for client-side use
 */

/**
 * Get admin auth token from localStorage or cookies
 * In production, this should come from secure httpOnly cookies
 */
export function getAdminToken(): string | null {
  try {
    // Try localStorage first (for demo/development)
    const token = typeof window !== 'undefined' ? window.localStorage?.getItem('admin_token') : null;
    return token;
  } catch (error) {
    console.error('Error getting admin token:', error);
    return null;
  }
}

/**
 * Set admin auth token to localStorage
 * In production, server should set secure httpOnly cookies
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
 * Clear admin auth token
 */
export function clearAdminToken(): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage?.removeItem('admin_token');
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
