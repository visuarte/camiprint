/**
 * Email service using Resend
 * Sends order confirmation emails to customers
 */

import { Resend } from 'resend';
import {
  orderConfirmationTemplate,
  quoteCustomerConfirmationTemplate,
  quoteNotificationTemplate,
  OrderConfirmationData,
  QuoteEmailData,
} from './templates';
import { brandConfig } from '@/config/brand';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

interface SendResult {
  success: boolean;
  id?: string;
  error?: string;
}

export class EmailService {
  private resend: Resend;
  private isConfigured: boolean = false;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@camiart.com';
    this.fromName = process.env.RESEND_FROM_NAME || 'CamiArt';

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.isConfigured = true;
      console.log('[EmailService] Resend configured successfully');
    } else {
      console.warn('[EmailService] RESEND_API_KEY not configured. Using console logging for development.');
      this.isConfigured = false;
      // Create a dummy Resend instance to avoid runtime errors
      this.resend = new Resend('dummy_key_for_dev');
    }
  }

  async sendEmail(payload: EmailPayload): Promise<SendResult> {
    if (!this.isConfigured) {
      if (process.env.NODE_ENV === 'production') {
        const msg = '[EmailService] RESEND_API_KEY is required in production';
        console.error(msg, { to: payload.to, subject: payload.subject });
        return { success: false, error: msg };
      }

      // Development fallback: log to console and return fake id
      console.log('[EmailService] [DEV MODE - NO ACTUAL SEND]');
      console.log(`To: ${payload.to}`);
      console.log(`Subject: ${payload.subject}`);
      console.log(`From: ${this.fromName} <${this.fromEmail}>`);
      console.log(`Reply-To: ${payload.replyTo || brandConfig.supportEmail}`);
      console.log(`HTML Preview: ${payload.html.substring(0, 200)}...`);
      return { success: true, id: `dev-${Date.now()}` };
    }

    try {
      const data = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        replyTo: payload.replyTo || brandConfig.supportEmail,
      });

      // Log full response for debugging
      console.log('[EmailService] Resend response:', data);

      // Resend SDK returns { data: { id } } on success, { error: ... } on failure
      const resendData = data as Record<string, unknown>;
      const msgId = (
        resendData &&
        ((resendData['data'] as Record<string, unknown>)?.['id'] ||
          resendData['id'] ||
          (resendData['messageId'] as string))
      ) as string | undefined;

      if (resendData && resendData['error']) {
        console.warn('[EmailService] Resend returned error:', resendData['error']);
      }

      if (!msgId) {
        const warn = '[EmailService] No message id returned by Resend, attempting SMTP fallback if configured';
        console.warn(warn, { to: payload.to, subject: payload.subject, data });

        // Attempt SMTP fallback if SMTP is configured or RESEND_API_KEY exists
        const smtpResult: SendResult = await this.sendViaSmtp(payload).catch((e): SendResult => ({ success: false, error: String(e) }));
        if (smtpResult && smtpResult.success) {
          console.log('[EmailService] Sent via SMTP fallback:', { id: smtpResult.id, to: payload.to });
          return smtpResult;
        }

        const errMsg = smtpResult?.error || 'No message id returned by Resend and SMTP fallback failed';
        return { success: false, error: errMsg };
      }

      console.log('[EmailService] Email sent successfully via Resend:', { id: msgId, to: payload.to, subject: payload.subject });
      return { success: true, id: msgId };
    } catch (error) {
      const err = error as any;
      const errMsg = err?.message || String(err);
      console.error('[EmailService] Failed to send email via Resend:', { to: payload.to, subject: payload.subject, error: errMsg, stack: err?.stack });

      // Try SMTP fallback before giving up
      try {
        const smtpResult = await this.sendViaSmtp(payload);
        if (smtpResult && smtpResult.success) {
          console.log('[EmailService] Sent via SMTP fallback after Resend error:', { id: smtpResult.id, to: payload.to });
          return smtpResult;
        }
        return { success: false, error: smtpResult?.error || errMsg };
      } catch (smtpErr) {
        const smtpMsg = (smtpErr as any)?.message || String(smtpErr);
        console.error('[EmailService] SMTP fallback also failed:', smtpMsg);
        return { success: false, error: `${errMsg}; SMTP fallback: ${smtpMsg}` };
      }
    }
  }

  private async sendViaSmtp(payload: EmailPayload): Promise<SendResult> {
    // Determine SMTP config from env or default to Resend SMTP
    const host = process.env.SMTP_HOST || 'smtp.resend.com';
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = (process.env.SMTP_SECURE ?? 'true') === 'true';
    const user = process.env.SMTP_USER || 'resend';
    const pass = process.env.SMTP_PASS || process.env.RESEND_API_KEY;

    if (!pass) {
      const msg = '[EmailService] SMTP credentials not configured (SMTP_PASS or RESEND_API_KEY required)';
      console.warn(msg);
      return { success: false, error: msg };
    }

    let nodemailer: any;
    try {
      nodemailer = await import('nodemailer');
    } catch (e) {
      console.error('[EmailService] nodemailer not installed:', e);
      return { success: false, error: 'nodemailer not installed' };
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });

      const info = await transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        replyTo: payload.replyTo || brandConfig.supportEmail,
      });

      console.log('[EmailService] nodemailer sendMail info:', info);

      const messageId = info?.messageId || (info?.response && String(info.response));
      return { success: true, id: messageId };
    } catch (err) {
      const e = err as any;
      console.error('[EmailService] nodemailer send failed:', e?.message || e);
      return { success: false, error: e?.message || String(e) };
    }
  }

  async sendOrderConfirmation(
    email: string,
    orderData: OrderConfirmationData
  ): Promise<SendResult> {
    try {
      const html = orderConfirmationTemplate(orderData);

      const result = await this.sendEmail({
        to: email,
        subject: `Confirmación de Pedido #${orderData.orderNumber}`,
        html,
        replyTo: brandConfig.supportEmail,
      });

      if (result.success) {
        console.log('[EmailService] Order confirmation sent:', {
          orderNumber: orderData.orderNumber,
          email,
          messageId: result.id,
        });
      }

      return result;
    } catch (error) {
      const err = error as Error;
      console.error('[EmailService] Error sending order confirmation:', { email, error: err.message });
      return { success: false, error: err.message };
    }
  }

  async sendQuoteNotification(quoteData: QuoteEmailData): Promise<SendResult> {
    const recipient =
      process.env.QUOTES_NOTIFICATION_EMAIL ||
      process.env.CONTACT_TO_EMAIL ||
      process.env.RESEND_TO_EMAIL ||
      brandConfig.supportEmail;

    try {
      const html = quoteNotificationTemplate(quoteData);

      const result = await this.sendEmail({
        to: recipient,
        subject: `Nueva cotización: ${quoteData.companyName} (${quoteData.quantity})`,
        html,
        replyTo: quoteData.email,
      });

      if (result.success) {
        console.log('[EmailService] Quote notification sent:', {
          quoteId: quoteData.quoteId,
          recipient,
          messageId: result.id,
        });
      }

      return result;
    } catch (error) {
      const err = error as Error;
      console.error('[EmailService] Error sending quote notification:', {
        quoteId: quoteData.quoteId,
        error: err.message,
      });
      return { success: false, error: err.message };
    }
  }

  async sendQuoteCustomerConfirmation(quoteData: QuoteEmailData): Promise<SendResult> {
    try {
      const html = quoteCustomerConfirmationTemplate(quoteData);

      const result = await this.sendEmail({
        to: quoteData.email,
        subject: `Hemos recibido tu solicitud #${quoteData.quoteId}`,
        html,
        replyTo: process.env.QUOTES_NOTIFICATION_EMAIL || brandConfig.supportEmail,
      });

      if (result.success) {
        console.log('[EmailService] Quote customer confirmation sent:', {
          quoteId: quoteData.quoteId,
          email: quoteData.email,
          messageId: result.id,
        });
      }

      return result;
    } catch (error) {
      const err = error as Error;
      console.error('[EmailService] Error sending quote customer confirmation:', {
        quoteId: quoteData.quoteId,
        email: quoteData.email,
        error: err.message,
      });
      return { success: false, error: err.message };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
