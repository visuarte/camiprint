import { NextRequest } from 'next/server';
import { verifyAdminToken, unauthorized, serverError, successResponse } from '../auth-utils';
import { getDashboardSettingsFromStore, updateDashboardSettingsInStore } from '@/server/admin/settings';

const ALLOWED_LANGUAGES = ['es-ES', 'en-US'] as const;
const ALLOWED_CURRENCIES = ['EUR', 'USD'] as const;
const ALLOWED_TIMEZONES = [
  'Europe/Madrid',
  'UTC',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Mexico_City',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'America/Argentina/Buenos_Aires',
] as const;

export async function GET(req: NextRequest) {
  if (!(await verifyAdminToken(req))) return unauthorized();

  try {
    const settings = await getDashboardSettingsFromStore();
    return successResponse(settings);
  } catch (error) {
    return serverError(error, 'Failed to read dashboard settings');
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminToken(req))) return unauthorized();

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
    if (typeof body.adminEmail === 'string' && body.adminEmail.trim()) {
      const email = body.adminEmail.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return new Response(JSON.stringify({ error: 'INVALID_ADMIN_EMAIL', message: 'El email de administrador no tiene un formato válido.' }), { status: 422, headers: { 'content-type': 'application/json' } });
      }
    }
    if (typeof body.language === 'string' && !ALLOWED_LANGUAGES.includes(body.language as any)) {
      return new Response(JSON.stringify({ error: 'INVALID_LANGUAGE', message: 'Idioma no permitido.' }), { status: 422, headers: { 'content-type': 'application/json' } });
    }
    if (typeof body.currency === 'string' && !ALLOWED_CURRENCIES.includes(body.currency as any)) {
      return new Response(JSON.stringify({ error: 'INVALID_CURRENCY', message: 'Divisa no permitida.' }), { status: 422, headers: { 'content-type': 'application/json' } });
    }
    if (typeof body.timezone === 'string' && !ALLOWED_TIMEZONES.includes(body.timezone as any)) {
      return new Response(JSON.stringify({ error: 'INVALID_TIMEZONE', message: 'Zona horaria no permitida.' }), { status: 422, headers: { 'content-type': 'application/json' } });
    }
    // Basic validation
    const patch: any = {};
    if (typeof body.showMetrics === 'boolean') patch.showMetrics = body.showMetrics;
    if (typeof body.refreshIntervalSeconds === 'number') patch.refreshIntervalSeconds = Math.max(5, Math.floor(body.refreshIntervalSeconds));
    if (typeof body.analyticsEnabled === 'boolean') patch.analyticsEnabled = body.analyticsEnabled;
    if (typeof body.metricsWindowDays === 'number') patch.metricsWindowDays = Math.max(1, Math.floor(body.metricsWindowDays));
    if (typeof body.language === 'string') patch.language = body.language;
    if (typeof body.currency === 'string') patch.currency = body.currency;
    if (typeof body.timezone === 'string') patch.timezone = body.timezone;
    if (typeof body.adminEmail === 'string') patch.adminEmail = body.adminEmail.trim() || null;
    if (typeof body.whatsappPhone === 'string') patch.whatsappPhone = body.whatsappPhone.trim() || null;
    if (typeof body.whatsappMessage === 'string') patch.whatsappMessage = body.whatsappMessage.trim() || null;

    const updatedBy = req.headers.get('x-admin-user')?.trim() || 'admin-token';
    const updated = await updateDashboardSettingsInStore(patch, updatedBy);
    return successResponse(updated);
  } catch (error) {
    return serverError(error, 'Failed to update dashboard settings');
  }
}
