import { NextRequest } from 'next/server';
import { getDashboardSettings } from '@/server/admin/settings';

export async function GET(req: NextRequest) {
  const s = getDashboardSettings();
  // Expose only public settings
  return new Response(JSON.stringify({
    whatsappPhone: s.whatsappPhone ?? null,
    whatsappMessage: s.whatsappMessage ?? null,
  }), {
    headers: { 'content-type': 'application/json' },
  });
}
