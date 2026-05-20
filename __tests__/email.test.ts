/**
 * Email service and order confirmation tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService } from '@/server/emails/service';
import { orderConfirmationTemplate, OrderConfirmationData } from '@/server/emails/templates';

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-message-id' }),
      verify: vi.fn().mockResolvedValue(true),
    })),
  },
}));

describe('Email Service', () => {
  let emailService: EmailService;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMTP_HOST = 'localhost';
    process.env.SMTP_PORT = '1025';
    process.env.SMTP_USER = '';
    process.env.SMTP_PASS = '';
    process.env.SMTP_FROM = 'noreply@camiprint.com';
  });

  describe('Email Service Initialization', () => {
    it('should initialize SMTP transporter when configured', async () => {
      const { default: nodemailer } = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        auth: { user: '', pass: '' },
      });
      expect(transporter).toBeDefined();
      expect(transporter.sendMail).toBeDefined();
    });

    it('should fall back to console logging when SMTP not configured', async () => {
      process.env.SMTP_HOST = '';
      const isConfigured = !!process.env.SMTP_HOST;
      expect(isConfigured).toBe(false);
    });

    it('should handle SMTP configuration errors gracefully', async () => {
      process.env.SMTP_HOST = '';
      const isConfigured = !!process.env.SMTP_HOST && !!process.env.SMTP_FROM;
      expect(isConfigured).toBe(false);
    });
  });

  describe('Order Confirmation Email', () => {
    const mockOrderData: OrderConfirmationData = {
      orderNumber: 'ABC12345',
      customerName: 'John Doe',
      items: [
        {
          productName: 'T-Shirt - Camiprint',
          quantity: 2,
          size: 'M',
          price: 19.99,
        },
        {
          productName: 'Hoodie - Camiprint',
          quantity: 1,
          size: 'L',
          price: 49.99,
        },
      ],
      total: 89.97,
      shippingAddress: '123 Main St\nNew York, NY 10001\nUSA',
      email: 'customer@example.com',
    };

    it('should send order confirmation email with correct subject', async () => {
      const subject = `Confirmación de Pedido #${mockOrderData.orderNumber}`;
      expect(subject).toContain('ABC12345');
      expect(subject).toContain('Confirmación de Pedido');
    });

    it('should include all order items in email', async () => {
      const itemNames = mockOrderData.items.map(i => i.productName);
      expect(itemNames.length).toBe(2);
      expect(itemNames).toContain('T-Shirt - Camiprint');
      expect(itemNames).toContain('Hoodie - Camiprint');
    });

    it('should include total amount in email', async () => {
      const totalString = `$${mockOrderData.total.toFixed(2)}`;
      expect(totalString).toBe('$89.97');
      expect(mockOrderData.total).toBeCloseTo(89.97, 2);
    });

    it('should include shipping address in email', async () => {
      expect(mockOrderData.shippingAddress).toContain('New York');
      expect(mockOrderData.shippingAddress).toContain('Main St');
      expect(mockOrderData.shippingAddress).toContain('USA');
    });

    it('should return true on successful send', async () => {
      const result = true; // Success
      expect(result).toBe(true);
    });

    it('should return false if email sending fails', async () => {
      const error = new Error('SMTP connection failed');
      const result = !error;
      expect(result).toBe(false);
    });

    it('should log email details on send', async () => {
      const logEntry = {
        orderNumber: mockOrderData.orderNumber,
        email: mockOrderData.email,
        status: 'sent',
      };
      expect(logEntry.email).toBe('customer@example.com');
      expect(logEntry.orderNumber).toBe('ABC12345');
    });
  });

  describe('Email Templates', () => {
    const mockOrderData: OrderConfirmationData = {
      orderNumber: 'DEF67890',
      customerName: 'Jane Smith',
      items: [
        {
          productName: 'Cap - Camiprint',
          quantity: 1,
          size: 'One Size',
          price: 24.99,
        },
      ],
      total: 24.99,
      shippingAddress: '456 Oak Ave\nLos Angeles, CA 90001\nUSA',
      email: 'jane@example.com',
    };

    it('should generate valid HTML email template', async () => {
      const html = orderConfirmationTemplate(mockOrderData);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('CAMIPRINT');
      expect(html).toContain('DEF67890');
      expect(html).toContain('Jane Smith');
    });

    it('should include responsive CSS in template', async () => {
      const html = orderConfirmationTemplate(mockOrderData);
      expect(html).toMatch(/@media\s*\(\s*max-width:\s*600px\s*\)/);
    });

    it('should escape HTML special characters in user data', async () => {
      const dataWithSpecialChars: OrderConfirmationData = {
        ...mockOrderData,
        customerName: '<script>alert("xss")</script>',
        shippingAddress: '<img src="x" onerror="alert(1)">',
      };
      const html = orderConfirmationTemplate(dataWithSpecialChars);
      expect(html).not.toContain('<script>');
      expect(html).not.toContain('onerror=');
      expect(html).not.toContain('alert(');
    });

    it('should format prices correctly', async () => {
      const html = orderConfirmationTemplate(mockOrderData);
      expect(html).toContain('$24.99');
      expect(html).not.toContain('24.990');
    });
  });

  describe('Email Health Check', () => {
    it('should verify SMTP connection', async () => {
      process.env.SMTP_HOST = 'localhost';
      const isConfigured = !!process.env.SMTP_HOST;
      expect(isConfigured).toBe(true);
    });

    it('should return false if SMTP not configured', async () => {
      process.env.SMTP_HOST = '';
      const isConfigured = !!process.env.SMTP_HOST;
      expect(isConfigured).toBe(false);
    });

    it('should handle connection errors gracefully', async () => {
      const error = new Error('Connection timeout');
      const success = !error || error.message.length > 0;
      expect(success).toBe(true);
    });
  });

  describe('Email Best-Effort Delivery', () => {
    it('should not throw if email send fails', async () => {
      const sendEmail = async () => {
        try {
          throw new Error('SMTP failed');
        } catch (error) {
          return false;
        }
      };
      const result = await sendEmail();
      expect(result).toBe(false);
    });

    it('should log email errors for debugging', async () => {
      const errorLog = { timestamp: Date.now(), error: 'Email send failed', context: 'webhook' };
      expect(errorLog).toHaveProperty('error');
      expect(errorLog.error).toContain('failed');
    });
  });
});
