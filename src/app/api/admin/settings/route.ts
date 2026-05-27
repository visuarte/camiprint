import { NextRequest } from 'next/server';
import { verifyAdminToken, unauthorized, serverError, successResponse } from '../auth-utils';
import { getDashboardSettings, updateDashboardSettings } from '@/server/admin/settings';

export async function GET(req: NextRequest) {
  if (!verifyAdminToken(req)) return unauthorized();

  try {
    const settings = getDashboardSettings();
    return successResponse(settings);
  } catch (error) {
    return serverError(error, 'Failed to read dashboard settings');
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminToken(req)) return unauthorized();

  try {
    const body = await req.json();
    // Validate whatsapp phone if provided: require E.164 format (leading + and up to 15 digits)
    if (typeof body.whatsappPhone === 'string' && body.whatsappPhone.trim()) {
      const phone = body.whatsappPhone.trim();
      const e164 = /^\+[1-9]\d{1,14}$/;
      if (!e164.test(phone)) {
        return new Response(JSON.stringify({ error: 'INVALID_WHATSAPP_PHONE', message: 'El teléfono WhatsApp debe estar en formato E.164, por ejemplo +34616996306' }), { status: 422, headers: { 'content-type': 'application/json' } });
      }
    }
    // Basic validation
    const patch: any = {};
    if (typeof body.showMetrics === 'boolean') patch.showMetrics = body.showMetrics;
    if (typeof body.refreshIntervalSeconds === 'number') patch.refreshIntervalSeconds = Math.max(5, Math.floor(body.refreshIntervalSeconds));
    if (typeof body.analyticsEnabled === 'boolean') patch.analyticsEnabled = body.analyticsEnabled;
    if (typeof body.metricsWindowDays === 'number') patch.metricsWindowDays = Math.max(1, Math.floor(body.metricsWindowDays));
    if (typeof body.whatsappPhone === 'string') patch.whatsappPhone = body.whatsappPhone.trim() || null;
    if (typeof body.whatsappMessage === 'string') patch.whatsappMessage = body.whatsappMessage.trim() || null;

    const updated = updateDashboardSettings(patch);
    return successResponse(updated);
  } catch (error) {
    return serverError(error, 'Failed to update dashboard settings');
  }
}
