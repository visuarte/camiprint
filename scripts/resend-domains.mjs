#!/usr/bin/env node

/**
 * Resend Domains Management via API
 * Create, list, and verify domains
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
const command = process.argv[2];
const domainName = process.argv[3];

console.log('\n📧 Resend Domains Manager\n');

try {
  if (command === 'list') {
    console.log('📋 Listing all domains...\n');
    
    const response = await resend.domains.list();
    console.log('Response:', JSON.stringify(response, null, 2));
    
    if (response.data && Array.isArray(response.data)) {
      response.data.forEach(domain => {
        console.log(`\n✅ Domain: ${domain.name}`);
        console.log(`   Status: ${domain.status || 'unknown'}`);
        console.log(`   ID: ${domain.id}`);
      });
    }
  } 
  else if (command === 'create' && domainName) {
    console.log(`🚀 Creating domain: ${domainName}\n`);
    
    const response = await resend.domains.create({
      domain: domainName,
    });
    
    console.log('Response:', JSON.stringify(response, null, 2));
    
    if (response.error) {
      console.error(`❌ Error: ${response.error.message}`);
    } else if (response.data) {
      console.log(`\n✅ Domain created successfully!`);
      console.log(`   Domain: ${response.data.domain}`);
      console.log(`   Status: ${response.data.status}`);
      console.log(`\n📋 DNS Records to add:\n`);
      
      if (response.data.records) {
        response.data.records.forEach(record => {
          console.log(`Type: ${record.record}`);
          console.log(`Name: ${record.name}`);
          console.log(`Value: ${record.value}`);
          console.log('---');
        });
      }
    }
  }
  else if (command === 'verify' && domainName) {
    console.log(`✔️  Verifying domain: ${domainName}\n`);
    
    const response = await resend.domains.verify({
      domain_id: domainName,
    });
    
    console.log('Response:', JSON.stringify(response, null, 2));
  }
  else {
    console.log('Usage:');
    console.log('  node scripts/resend-domains.mjs list');
    console.log('  node scripts/resend-domains.mjs create camiart.com');
    console.log('  node scripts/resend-domains.mjs verify <domain-id>');
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
