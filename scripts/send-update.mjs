#!/usr/bin/env node
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load admin key from supabase/.env
function loadEnv() {
  const envPath = resolve(__dirname, '../supabase/.env');
  try {
    const content = readFileSync(envPath, 'utf-8');
    const match = content.match(/^ADMIN_KEY=(.+)$/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

const adminKey = loadEnv();
if (!adminKey) {
  console.error('Error: ADMIN_KEY not found in supabase/.env');
  process.exit(1);
}

const url = 'http://127.0.0.1:54321/functions/v1/send-update';

console.log('Fetching next upcoming event and sending update...');
console.log('');

try {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': adminKey,
    },
    body: JSON.stringify({}),
  });

  const data = await response.json();

  if (response.ok && data.success) {
    console.log('Success:', data.message);
    if (data.event) {
      console.log('Event:', data.event);
    }
    if (data.sent !== undefined) {
      console.log(`Sent: ${data.sent}, Failed: ${data.failed || 0}`);
    }
  } else {
    console.error('Error:', data.message);
    process.exit(1);
  }
} catch (error) {
  console.error('Request failed:', error.message);
  console.error('Make sure supabase functions serve is running.');
  process.exit(1);
}
