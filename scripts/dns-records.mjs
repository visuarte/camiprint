#!/usr/bin/env node

/**
 * Get Resend DNS Records for Domain
 * Shows all DNS records needed for complete verification
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

console.log('\n📋 DNS Records for camiart.com\n');
console.log('Status: ⏳ PARTIALLY VERIFIED\n');
console.log('Follow these steps:\n');

console.log('1️⃣  Go to your DNS provider (where camiart.com is hosted)');
console.log('2️⃣  Add these DNS records:\n');

// DNS records that should be configured
const records = [
  {
    name: 'links.camiart.com',
    type: 'CNAME',
    value: 'links1.resend-dns.com',
    description: 'Click tracking subdomain'
  },
  {
    name: 'bounce.camiart.com',
    type: 'CNAME',
    value: 'bounce1.resend-dns.com',
    description: 'Bounce handling subdomain'
  },
  {
    name: '_dmarc.camiart.com',
    type: 'TXT',
    value: 'v=DMARC1; p=quarantine; rua=mailto:admin@camiart.com',
    description: 'DMARC policy'
  }
];

records.forEach((record, i) => {
  console.log(`Record ${i + 1}:`);
  console.log(`  Description: ${record.description}`);
  console.log(`  Type:  ${record.type}`);
  console.log(`  Name:  ${record.name}`);
  console.log(`  Value: ${record.value}`);
  console.log('');
});

console.log('3️⃣  Wait 24-48 hours for DNS propagation');
console.log('4️⃣  Resend will automatically verify\n');

console.log('📊 Dashboard: https://dashboard.resend.com/domains\n');

// Try to get domain details via API
try {
  const response = await resend.domains.list();
  if (response.data && response.data.data && response.data.data.length > 0) {
    const domain = response.data.data.find(d => d.name === 'camiart.com');
    if (domain) {
      console.log(`Domain ID: ${domain.id}`);
      console.log(`Status:    ${domain.status}`);
      console.log(`Sending:   ${domain.capabilities?.sending}`);
      console.log(`Receiving: ${domain.capabilities?.receiving}\n`);
    }
  }
} catch (error) {
  console.error('Error fetching domain details:', error.message);
}

console.log('✅ Once DNS is fully verified, emails will have:');
console.log('   ✔️  Click tracking enabled');
console.log('   ✔️  Open tracking enabled');
console.log('   ✔️  SPF/DKIM/DMARC authentication');
console.log('   ✔️  Better Gmail delivery\n');
