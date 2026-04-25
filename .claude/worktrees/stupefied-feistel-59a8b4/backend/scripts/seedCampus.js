/**
 * seedCampus.js
 * Inserts the REVA University campus document (idempotent — safe to run multiple times).
 * Run: node scripts/seedCampus.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Campus   = require('../models/Campus');

const CAMPUS = {
  name:        'REVA University',
  emailDomain: 'reva.edu.in',
  city:        'Bengaluru',
  active:      true,
};

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('❌  MONGO_URI not set in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅  Connected\n');

  // Upsert by emailDomain (unique index) so it's safe to re-run
  const campus = await Campus.findOneAndUpdate(
    { emailDomain: CAMPUS.emailDomain },
    CAMPUS,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const total = await Campus.countDocuments();

  console.log('✅  Campus seeded:');
  console.log(`   _id:         ${campus._id}`);
  console.log(`   name:        ${campus.name}`);
  console.log(`   emailDomain: ${campus.emailDomain}`);
  console.log(`   city:        ${campus.city}`);
  console.log(`   active:      ${campus.active}`);
  console.log(`\n   Total campus documents: ${total}`);

  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB. ✅  Seed complete.');
}

seed().catch((err) => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
