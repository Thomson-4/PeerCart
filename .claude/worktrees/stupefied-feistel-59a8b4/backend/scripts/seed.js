/**
 * Seed script — creates the default REVA University campus.
 * Run once: node scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const Campus = require('../models/Campus');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI, { family: 4 });
  console.log('Connected to MongoDB');

  const existing = await Campus.findOne({ emailDomain: 'reva.edu.in' });
  if (existing) {
    console.log('Campus already exists:', existing.name, '—', existing._id);
    return;
  }

  const campus = await Campus.create({
    name: 'REVA University',
    emailDomain: 'reva.edu.in',
    city: 'Bengaluru',
    active: true,
  });

  console.log('Campus created:', campus.name, '—', campus._id.toString());
};

seed()
  .catch((err) => { console.error(err.message); process.exit(1); })
  .finally(() => mongoose.disconnect());
