#!/usr/bin/env node

/**
 * Monitor Domain Verification Status
 * Checks if camiart.com is fully verified in Resend
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

async function checkStatus() {
  try {
    const response = await resend.domains.list();
    
    if (!response.data || !response.data.data) {
      console.error('❌ No domains found');
      return;
    }

    const domain = response.data.data.find(d => d.name === 'camiart.com');
    
    if (!domain) {
      console.error('❌ camiart.com not found in Resend');
      return;
    }

    // Status icons
    const statusIcon = {
      'verified': '✅',
      'partially_verified': '⏳',
      'failed': '❌',
      'pending': '⏱️'
    };

    const icon = statusIcon[domain.status] || '❓';

    console.log('\n📧 Domain Verification Status\n');
    console.log(`${icon} Domain:    ${domain.name}`);
    console.log(`   Status:    ${domain.status.toUpperCase()}`);
    console.log(`   Created:   ${domain.created_at}`);
    console.log(`   Region:    ${domain.region}`);
    console.log(`   Sending:   ${domain.capabilities?.sending === 'enabled' ? '✅' : '❌'}`);
    console.log(`   Receiving: ${domain.capabilities?.receiving === 'enabled' ? '✅' : '❌'}\n`);

    if (domain.status === 'verified') {
      console.log('🎉 Domain is fully verified!\n');
      console.log('You can now:');
      console.log('  ✅ Send emails with tracking');
      console.log('  ✅ Track opens and clicks');
      console.log('  ✅ Use DMARC authentication');
      console.log('  ✅ Better Gmail delivery\n');
      
      // Test email suggestion
      console.log('Test with:');
      console.log('  npm run email:test:order -- visuarte.creativos@gmail.com\n');
    } else if (domain.status === 'partially_verified') {
      console.log('⏳ Status: PARTIALLY VERIFIED\n');
      console.log('Action needed:');
      console.log('  1. Add 3 DNS records in Vercel');
      console.log('  2. Records needed:');
      console.log('     - links.camiart.com → links1.resend-dns.com (CNAME)');
      console.log('     - bounce.camiart.com → bounce1.resend-dns.com (CNAME)');
      console.log('     - _dmarc.camiart.com → v=DMARC1;... (TXT)\n');
      console.log('  3. Guide: docs/vercel-dns-setup.md\n');
      console.log('  4. After DNS updated, check again in 15-30 minutes\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Auto-refresh mode
const refreshInterval = process.argv[2] === '--watch' ? 30000 : null;

if (refreshInterval) {
  console.log('📡 Watching domain status (updates every 30 seconds)...\n');
  console.log('Press Ctrl+C to stop\n');
  
  checkStatus();
  
  setInterval(checkStatus, refreshInterval);
} else {
  checkStatus();
}
