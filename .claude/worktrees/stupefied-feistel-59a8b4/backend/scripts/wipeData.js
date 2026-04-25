/**
 * wipeData.js
 * Deletes ALL documents from every collection (schemas/indexes stay intact).
 * Run: node scripts/wipeData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const COLLECTIONS = [
  'users',
  'listings',
  'needs',
  'transactions',
  'reviews',
  'conversations',
  'messages',
  'reports',
  'ambassadors',
];

async function wipe() {
  if (!process.env.MONGO_URI) {
    console.error('❌  MONGO_URI not set in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected\n');

  const db = mongoose.connection.db;

  for (const col of COLLECTIONS) {
    const collection = db.collection(col);
    const before = await collection.countDocuments();
    if (before === 0) {
      console.log(`   ${col.padEnd(16)} — already empty`);
      continue;
    }
    await collection.deleteMany({});
    const after = await collection.countDocuments();
    console.log(`   ${col.padEnd(16)} — deleted ${before} docs  →  count: ${after}`);
  }

  console.log('\n✅  All collections wiped.\n');

  // Confirm counts
  console.log('── Final document counts ──────────────────');
  for (const col of COLLECTIONS) {
    const count = await db.collection(col).countDocuments();
    const ok = count === 0 ? '✅' : '❌';
    console.log(`   ${ok} ${col.padEnd(16)} = ${count}`);
  }

  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB.');
}

wipe().catch((err) => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
