import { NextRequest } from 'next/server';
import { getDashboardSettingsFromStore } from '@/server/admin/settings';

export async function GET(req: NextRequest) {
  const s = await getDashboardSettingsFromStore();
  // Expose only public settings
  return new Response(JSON.stringify({
    whatsappPhone: s.whatsappPhone ?? null,
    whatsappMessage: s.whatsappMessage ?? null,
    priceMultiplier: s.priceMultiplier ?? 1.5,
    basePrintingCost: s.basePrintingCost ?? 2,
  }), {
    headers: { 'content-type': 'application/json' },
  });
}
