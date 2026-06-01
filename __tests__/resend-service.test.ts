import { beforeEach, describe, expect, it, vi } from 'vitest';

const sendMock = vi.fn();

vi.mock('resend', () => ({
  Resend: vi.fn(function Resend() {
    return {
      emails: {
        send: sendMock,
      },
    };
  }),
}));

describe('EmailService Resend configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.ENABLE_EMAILS;
    process.env.NODE_ENV = 'test';
    process.env.RESEND_API_KEY = 're_test';
    process.env.RESEND_FROM_EMAIL = 'noreply@camiart.com';
    process.env.RESEND_FROM_NAME = 'Camiart';
  });

  it('sends through Resend with the configured sender and default reply-to', async () => {
    sendMock.mockResolvedValue({ data: { id: 'email_123' }, error: null });
    const { EmailService } = await import('@/server/emails/service');
    const service = new EmailService();

    const result = await service.sendEmail({
      to: 'customer@example.com',
      subject: 'Pedido recibido',
      html: '<p>OK</p>',
    });

    expect(result).toEqual({ success: true, id: 'email_123' });
    expect(sendMock).toHaveBeenCalledWith({
      from: 'Camiart <noreply@camiart.com>',
      to: 'customer@example.com',
      subject: 'Pedido recibido',
      html: '<p>OK</p>',
      replyTo: 'hola@camiart.com',
    });
  });

  it('returns a failure when Resend returns a structured error', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'domain is not verified' } });
    const { EmailService } = await import('@/server/emails/service');
    const service = new EmailService();

    const result = await service.sendEmail({
      to: 'customer@example.com',
      subject: 'Pedido recibido',
      html: '<p>OK</p>',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('domain is not verified');
  });

  it('skips real delivery when ENABLE_EMAILS=false', async () => {
    process.env.ENABLE_EMAILS = 'false';
    const { EmailService } = await import('@/server/emails/service');
    const service = new EmailService();

    const result = await service.sendEmail({
      to: 'customer@example.com',
      subject: 'Pedido recibido',
      html: '<p>OK</p>',
    });

    expect(result.success).toBe(true);
    expect(result.id).toMatch(/^disabled-/);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
