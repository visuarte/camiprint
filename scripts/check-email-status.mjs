#!/usr/bin/env node

/**
 * Check Email Delivery Status in Resend
 * Shows sent emails and their delivery status
 */

import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local
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

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error('❌ RESEND_API_KEY not configured');
  process.exit(1);
}

const resend = new Resend(apiKey);

console.log('\n📧 Resend Email Delivery Status\n');

// Get list of emails
try {
  const response = await resend.emails.list();
  
  if (!response.data || response.data.length === 0) {
    console.log('No emails sent yet');
    process.exit(0);
  }

  console.log(`📊 Total Emails: ${response.data.length}\n`);
  
  // Show last 10 emails
  response.data.slice(0, 10).forEach((email, i) => {
    console.log(`${i + 1}. ${email.from}`);
    console.log(`   To: ${email.to}`);
    console.log(`   Subject: ${email.subject?.substring(0, 50)}...`);
    console.log(`   Status: ${email.created_at}`);
    console.log(`   ID: ${email.id}\n`);
  });

  console.log('📌 For detailed info, visit: https://dashboard.resend.com/emails\n');

} catch (error) {
  console.error('Error fetching emails:', error.message);
  process.exit(1);
}
