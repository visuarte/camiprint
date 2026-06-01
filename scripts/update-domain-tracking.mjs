#!/usr/bin/env node

/**
 * Update Domain Tracking Settings
 * Enable click tracking and open tracking for camiart.com
 */

import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

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
const domainId = '1fab51e5-b267-419b-84e1-75bc1f164d97';

console.log('\n🔧 Updating Domain Tracking Settings\n');
console.log('Domain ID:', domainId);
console.log('Enabling: Open Tracking + Click Tracking\n');

try {
  // Update domain with tracking enabled
  const response = await resend.domains.update(domainId, {
    open_tracking_enabled: true,
    click_tracking_enabled: true,
  });

  console.log('Response:', JSON.stringify(response, null, 2));

  if (response.error) {
    console.error('\n❌ Error:', response.error.message);
  } else if (response.data) {
    console.log('\n✅ Domain updated successfully!');
    console.log('   Domain:', response.data.domain || response.data.name);
    console.log('   Status:', response.data.status);
    console.log('\n📊 Check status:');
    console.log('   npm run domain:check\n');
  }

} catch (error) {
  console.error('❌ Error updating domain:', error.message);
  console.error('Note: Your Resend plan might not support this API call');
  console.error('Use the Dashboard instead: https://dashboard.resend.com/domains\n');
}
