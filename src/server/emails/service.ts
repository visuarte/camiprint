/**
 * Email service using Nodemailer
 * Sends order confirmation emails to customers
 */

import nodemailer from 'nodemailer';
import { orderConfirmationTemplate, OrderConfirmationData } from './templates';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    // Check if SMTP is configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpPort) {
      try {
        const port = parseInt(smtpPort, 10);

        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: port,
          secure: port === 465, // true for 465, false for other ports
          auth: smtpUser && smtpPass ? {
            user: smtpUser,
            pass: smtpPass,
          } : undefined,
        });

        this.isConfigured = true;
        console.log('[EmailService] SMTP configured successfully');
      } catch (error) {
        const err = error as Error;
        console.error('[EmailService] Failed to initialize SMTP transporter:', err.message);
        this.isConfigured = false;
      }
    } else {
      console.warn('[EmailService] SMTP not configured. Using console logging for development.');
      this.isConfigured = false;
    }
  }

  async sendEmail(payload: EmailPayload): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      // Development fallback: log to console
      console.log('[EmailService] [DEV MODE - NO ACTUAL SEND]');
      console.log(`To: ${payload.to}`);
      console.log(`Subject: ${payload.subject}`);
      console.log(`Reply-To: ${payload.replyTo || 'noreply@camiprint.com'}`);
      console.log(`HTML Preview: ${payload.html.substring(0, 200)}...`);
      return true;
    }

    try {
      const smtpFrom = process.env.SMTP_FROM || 'noreply@camiprint.com';

      const info = await this.transporter.sendMail({
        from: smtpFrom,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        replyTo: payload.replyTo || 'support@camiprint.com',
      });

      console.log('[EmailService] Email sent successfully:', {
        messageId: info.messageId,
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
      console.error('[EmailService] Error in sendOrderConfirmation:', err.message);
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('[EmailService] SMTP not configured - health check skipped');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('[EmailService] SMTP connection verified');
      return true;
    } catch (error) {
      const err = error as Error;
      console.error('[EmailService] SMTP health check failed:', err.message);
      return false;
    }
  }
}

// Singleton instance
export const emailService = new EmailService();
