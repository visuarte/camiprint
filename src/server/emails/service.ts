/**
 * Email service using Resend
 * Sends order confirmation emails to customers
 */

import { Resend } from 'resend';
import { orderConfirmationTemplate, OrderConfirmationData } from './templates';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export class EmailService {
  private resend: Resend;
  private isConfigured: boolean = false;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@camiprint.com';
    this.fromName = process.env.RESEND_FROM_NAME || 'Camiprint';

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

  async sendEmail(payload: EmailPayload): Promise<boolean> {
    if (!this.isConfigured) {
      // Development fallback: log to console
      console.log('[EmailService] [DEV MODE - NO ACTUAL SEND]');
      console.log(`To: ${payload.to}`);
      console.log(`Subject: ${payload.subject}`);
      console.log(`From: ${this.fromName} <${this.fromEmail}>`);
      console.log(`Reply-To: ${payload.replyTo || 'support@camiprint.com'}`);
      console.log(`HTML Preview: ${payload.html.substring(0, 200)}...`);
      return true;
    }

    try {
      const data = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        replyTo: payload.replyTo || 'support@camiprint.com',
      });

      if (data.error) {
        console.error('[EmailService] Resend error:', {
          to: payload.to,
          subject: payload.subject,
          error: data.error,
        });
        return false;
      }

      console.log('[EmailService] Email sent successfully:', {
        id: data.data?.id,
        to: payload.to,
        subject: payload.subject,
      });

      return true;
    } catch (error) {
      const err = error as Error;
      console.error('[EmailService] Failed to send email:', {
        to: payload.to,
        subject: payload.subject,
        error: err.message,
      });
      return false;
    }
  }

  async sendOrderConfirmation(
    email: string,
    orderData: OrderConfirmationData
  ): Promise<boolean> {
    try {
      const html = orderConfirmationTemplate(orderData);

      const result = await this.sendEmail({
        to: email,
        subject: `Confirmación de Pedido #${orderData.orderNumber}`,
        html,
        replyTo: 'support@camiprint.com',
      });

      if (result) {
        console.log('[EmailService] Order confirmation sent:', {
          orderNumber: orderData.orderNumber,
          email,
        });
      }

      return result;
    } catch (error) {
      const err = error as Error;
      console.error('[EmailService] Error sending order confirmation:', {
        email,
        error: err.message,
      });
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
