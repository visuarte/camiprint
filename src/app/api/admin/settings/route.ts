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
    // Basic validation
    const patch: any = {};
    if (typeof body.showMetrics === 'boolean') patch.showMetrics = body.showMetrics;
    if (typeof body.refreshIntervalSeconds === 'number') patch.refreshIntervalSeconds = Math.max(5, Math.floor(body.refreshIntervalSeconds));
    if (typeof body.analyticsEnabled === 'boolean') patch.analyticsEnabled = body.analyticsEnabled;
    if (typeof body.metricsWindowDays === 'number') patch.metricsWindowDays = Math.max(1, Math.floor(body.metricsWindowDays));

    const updated = updateDashboardSettings(patch);
    return successResponse(updated);
  } catch (error) {
    return serverError(error, 'Failed to update dashboard settings');
  }
}
