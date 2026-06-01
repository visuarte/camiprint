import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/server/emails/service';

// Dev-only helper: triggers emailService.sendEmail and returns SendResult
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const to = body.to || process.env.RESEND_TO_EMAIL || 'dev+test@localhost.localdomain';
    const subject = body.subject || 'Test email from debug endpoint';
    const html = body.html || `<p>Test email at ${new Date().toISOString()}</p>`;

    const result = await emailService.sendEmail({
      to,
      subject,
      html,
      replyTo: process.env.RESEND_FROM_EMAIL || 'support@camiart.com',
    });

    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    console.error('[debug/send-email-test] Error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
