import { createClient } from '@/utils/supabase/client';

export function getAdminToken(): string | null {
  return null;
}

export function setAdminToken(_token: string): void {}

export async function clearAdminToken(): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
    document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  } catch (error) {
    console.error('Error clearing admin session:', error);
  }
}

export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: 'same-origin',
  });
}
