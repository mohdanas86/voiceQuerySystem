/**
 * createIndexes.js — Script to programmatically set up MongoDB collection indexes
 * Ulavi Technologies
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Read and parse .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
let MONGODB_URI = process.env.MONGODB_URI;
let MONGODB_DB = process.env.MONGODB_DB;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key === 'MONGODB_URI') {
        MONGODB_URI = value;
      } else if (key === 'MONGODB_DB') {
        MONGODB_DB = value;
      }
    }
  }
}

if (!MONGODB_URI || !MONGODB_DB) {
  console.error('Error: MONGODB_URI or MONGODB_DB is not defined in process.env or .env.local');
  process.exit(1);
}

async function run() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Successfully connected to MongoDB server.');
    const db = client.db(MONGODB_DB);
    const collection = db.collection('query_submissions');

    console.log('Creating indexes on "query_submissions" collection...');

    // 1. created_at_desc
    console.log('1. Creating index on { created_at: -1 }...');
    const index1 = await collection.createIndex({ created_at: -1 }, { name: 'created_at_desc' });
    console.log(`Created: ${index1}`);

    // 2. source_lang_created_at
    console.log('2. Creating index on { source_language: 1, created_at: -1 }...');
    const index2 = await collection.createIndex({ source_language: 1, created_at: -1 }, { name: 'source_lang_created_at' });
    console.log(`Created: ${index2}`);

    // 3. ip_created_at
    console.log('3. Creating index on { ip: 1, created_at: -1 }...');
    const index3 = await collection.createIndex({ ip: 1, created_at: -1 }, { name: 'ip_created_at' });
    console.log(`Created: ${index3}`);

    // 4. status_idx
    console.log('4. Creating index on { status: 1 }...');
    const index4 = await collection.createIndex({ status: 1 }, { name: 'status_idx' });
    console.log(`Created: ${index4}`);

    // 5. user_email_idx
    console.log('5. Creating index on { user_email: 1 }...');
    const index5 = await collection.createIndex({ user_email: 1 }, { name: 'user_email_idx' });
    console.log(`Created: ${index5}`);

    console.log('All indexes created successfully!');

    // List all indexes to verify
    const indexes = await collection.listIndexes().toArray();
    console.log('\nActive indexes on "query_submissions":');
    console.log(JSON.stringify(indexes, null, 2));

  } catch (err) {
    console.error('Error creating indexes:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();
