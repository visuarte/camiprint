import { NextRequest } from 'next/server';
import { getDashboardSettingsFromStore } from '@/server/admin/settings';

export async function GET(req: NextRequest) {
  const s = await getDashboardSettingsFromStore();
  // Expose only public settings
  return new Response(JSON.stringify({
    whatsappPhone: s.whatsappPhone ?? null,
    whatsappMessage: s.whatsappMessage ?? null,
  }), {
    headers: { 'content-type': 'application/json' },
  });
}
