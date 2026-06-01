#!/usr/bin/env node

/**
 * Test Email Sender Script
 * Sends test emails using Resend service
 * 
 * Usage:
 *   node scripts/test-email-send.mjs [type] [recipient@email.com]
 * 
 * Types:
 *   - order    : Order confirmation email (default)
 *   - quote    : Quote notification email
 *   - customer : Quote customer confirmation
 *   - all      : Send all three types
 * 
 * Examples:
 *   node scripts/test-email-send.mjs order test@example.com
 *   node scripts/test-email-send.mjs quote admin@example.com
 *   node scripts/test-email-send.mjs all test@example.com
 */

import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local if it exists
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key]) {
      process.env[key] = value.replace(/^["']|["']$/g, '');
    }
  });
}

const args = process.argv.slice(2);
const emailType = args[0]?.toLowerCase() || 'order';
const recipientEmail = args[1] || 'test@example.com';

console.log('\n📧 Test Email Sender\n');
console.log(`Type: ${emailType}`);
console.log(`Recipient: ${recipientEmail}\n`);

// Check API Key
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error('❌ RESEND_API_KEY not configured in environment');
  console.log('\n📝 Setup Resend:\n');
  console.log('1. Go to https://resend.com/api-keys');
  console.log('2. Create a new API key');
  console.log('3. Add to .env.local:\n');
  console.log('   RESEND_API_KEY=re_your_api_key_here');
  console.log('   RESEND_FROM_EMAIL=noreply@camiart.com');
  console.log('   RESEND_FROM_NAME=Camiart\n');
  process.exit(1);
}

// Initialize Resend
const resend = new Resend(apiKey);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@camiart.com';
const fromName = process.env.RESEND_FROM_NAME || 'Camiart';

console.log(`✅ Using: ${fromName} <${fromEmail}>\n`);

/**
 * Email Templates
 */

const orderConfirmationTemplate = (orderNumber, customerName, items) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Pedido</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
    <h2 style="color: #2c3e50;">Confirmación de Pedido #${orderNumber}</h2>
    
    <p>Hola ${customerName},</p>
    
    <p>Gracias por tu pedido. Aquí está el resumen:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Producto</th>
          <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Cantidad</th>
          <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Precio</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$${item.price.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <p style="font-size: 18px; font-weight: bold;">
      Total: $${items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
    </p>
    
    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
      Si tienes preguntas, contáctanos a support@camiprint.com
    </p>
  </div>
</body>
</html>
`;

const quoteNotificationTemplate = (company, quantity, message) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Cotización</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
    <h2 style="color: #2c3e50;">🎉 Nueva Solicitud de Cotización</h2>
    
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Empresa:</strong> ${company}</p>
      <p><strong>Cantidad:</strong> ${quantity}</p>
      <p><strong>Mensaje:</strong> ${message}</p>
    </div>
    
    <p style="color: #27ae60; font-weight: bold;">Acceso al dashboard para responder la cotización</p>
    
    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
      Este es un email automático de Camiprint
    </p>
  </div>
</body>
</html>
`;

const quoteCustomerConfirmationTemplate = (company, quoteId) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cotización Recibida</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
    <h2 style="color: #2c3e50;">Hemos Recibido tu Solicitud #${quoteId}</h2>
    
    <p>Hola ${company},</p>
    
    <p>Gracias por solicitar una cotización. Nuestro equipo revisará tu solicitud pronto y te contactará con una oferta personalizada.</p>
    
    <p style="color: #27ae60; font-weight: bold; margin-top: 20px;">
      ⏱️ Tiempo estimado: 24-48 horas
    </p>
    
    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
      Si tienes preguntas urgentes, escribenos a hola@camiprint.com
    </p>
  </div>
</body>
</html>
`;

/**
 * Send test emails
 */

async function sendTestEmail(type, recipient) {
  let subject, html;
  
  if (type === 'order' || type === 'all') {
    console.log('📨 Sending ORDER CONFIRMATION email...');
    subject = 'Confirmación de Pedido #TEST12345';
    html = orderConfirmationTemplate('TEST12345', 'Test User', [
      { name: 'T-Shirt Camiprint', quantity: 2, price: 19.99 },
      { name: 'Hoodie Camiprint', quantity: 1, price: 49.99 },
    ]);
    
    try {
      const result = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: recipient,
        subject,
        html,
      });
      
      if (result.error) {
        console.error(`  ❌ Error: ${result.error.message}`);
      } else {
        console.log(`  ✅ Sent! ID: ${result.data?.id}`);
      }
    } catch (error) {
      console.error(`  ❌ Exception: ${error.message}`);
    }
    console.log();
  }
  
  if (type === 'quote' || type === 'all') {
    console.log('📨 Sending QUOTE NOTIFICATION email...');
    subject = 'Nueva cotización: Test Company (50-99)';
    html = quoteNotificationTemplate('Test Company', '50-99', 'This is a test quote request');
    
    try {
      const result = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: recipient,
        subject,
        html,
      });
      
      if (result.error) {
        console.error(`  ❌ Error: ${result.error.message}`);
      } else {
        console.log(`  ✅ Sent! ID: ${result.data?.id}`);
      }
    } catch (error) {
      console.error(`  ❌ Exception: ${error.message}`);
    }
    console.log();
  }
  
  if (type === 'customer' || type === 'all') {
    console.log('📨 Sending QUOTE CUSTOMER CONFIRMATION email...');
    subject = 'Hemos recibido tu solicitud #QT-TEST-001';
    html = quoteCustomerConfirmationTemplate('Test Company', 'QT-TEST-001');
    
    try {
      const result = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: recipient,
        subject,
        html,
      });
      
      if (result.error) {
        console.error(`  ❌ Error: ${result.error.message}`);
      } else {
        console.log(`  ✅ Sent! ID: ${result.data?.id}`);
      }
    } catch (error) {
      console.error(`  ❌ Exception: ${error.message}`);
    }
    console.log();
  }
}

// Run
await sendTestEmail(emailType, recipientEmail);

console.log('✅ Done!\n');
console.log('📧 Check your email inbox (or spam folder)');
console.log('📊 Track delivery at: https://dashboard.resend.com\n');
